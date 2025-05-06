<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Floor;
use App\Models\Invoices;
use App\Models\MemberType;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    // Show new order page
    public function index(Request $request)
    {
        $orderNo = $this->getOrderNo();
        $memberTypes = MemberType::select('id', 'name')->get();

        // Current date/time (or use provided start_date/time from frontend)
        $startDate = $request->input('start_date', now()->toDateString());
        $startTime = $request->input('start_time', now()->toTimeString());

        // Get all active floors with their tables
        $floorTables = Floor::select('id', 'name')->where('status', 1)->with('tables:id,floor_id,table_no,capacity')->get();

        // return Inertia::render('App/Order/New/Index', compact('orderNo', 'memberTypes', ''));
        return Inertia::render('App/Order/New/Index', [
            'orderNo' => $orderNo,
            'memberTypes' => $memberTypes,
            'floorTables' => $floorTables,
        ]);
    }
    public function savedOrder()
    {
        $orders = Order::where('status', 'saved')->with('user:id,name')->get();

        return response()->json([
            'SavedOrders' => $orders,
        ]);
    }

    public function orderMenu(Request $request)
    {
        return Inertia::render('App/Order/OrderMenu');
    }

    // Get next order number
    private function getOrderNo()
    {
        $orderNo = Order::max('order_number');
        $orderNo = $orderNo + 1;
        return $orderNo;
    }

    // Search for members
    public function searchMember(Request $request)
    {
        $query = $request->input('query');
        $memberType = $request->input('member_type');
        $roleType = $request->input('role', 'user');

        $members = User::where('name', 'like', "%{$query}%")
            ->whereHas('roles', function ($q) use ($roleType) {
                $q->where('name', $roleType);
            });

        // Only apply member_type filter if role is 'user' and member_type is provided
        if ($roleType === 'user' && !empty($memberType)) {
            $members->where('member_type_id', $memberType);
        }

        $results = $members->select('id', 'name', 'email')->get();

        return response()->json(['success' => true, 'results' => $results], 200);
    }

    private function getInvoiceNo()
    {
        $invoicNo = Invoices::max('invoice_no');
        $invoicNo = $invoicNo + 1;
        return $invoicNo;
    }
    public function orderReservation(Request $request)
    {
        // dd($request->all());

        $order = Order::create([
            'order_number' => $this->getOrderNo(),
            'user_id' => $request->member['id'],
            'order_type' => $request->order_type,
            'person_count' => $request->person_count,
            'start_date' => Carbon::parse($request->date)->toDateString(),
            'start_time' => $request->time,
            'down_payment' => $request->down_payment,
            'status' => 'saved',
        ]);


        return response()->json(['message' => 'Order placed successfully.', 'order' => $order], 200);
    }

    public function sendToKitchen(Request $request)
    {
        $request->validate([
            'member.id' => 'required|exists:users,id',
            'order_items' => 'required|array',
            'order_items.*.id' => 'required|exists:products,id',
            'price' => 'required|numeric',
        ]);

        DB::beginTransaction();


        $order = Order::create([
            'order_number' => $this->getOrderNo(),
            'user_id' => $request->member['id'],
            'waiter_id' => $request->waiter['id'],
            'table_id' => $request->table,
            'order_type' => $request->order_type,
            'person_count' => $request->person_count,
            'start_date' => $request->date,
            'start_time' => $request->time,
            'down_payment' => $request->down_payment,
            'amount' => $request->price,
            'status' => 'pending'
        ]);

        collect($request->order_items)->each(function ($item) use ($order) {
            OrderItem::create([
                'order_id' => $order->id,
                'order_item' => $item,
                'status' => 'pending',
            ]);
        });
        Invoices::create([
            'invoice_no' => $this->getInvoiceNo(),
            'user_id' => $request->member['id'],
            'order_id' => $order->id,
            'amount' => $request->price,
            'tax' => $request->tax,
            'discount' => $request->discount,
            'total_price' => $request->total_price,
            'status' => 'unpaid',
        ]);

        DB::commit();

        return redirect()->back()->with('success', 'Order sent to kitchen.');
    }

    public function getProducts($category_id)
    {
        $category = Category::find($category_id);

        if ($category) {
            $products = Product::with(['variants:id,product_id,name', 'variants.values', 'category'])->where('category_id', $category_id)->get();

            return response()->json(['success' => true, 'products' => $products], 200);
        } else {
            return response()->json(['success' => true, 'products' => []], 200);
        }
    }
    public function getCategories()
    {
        $categories = Category::latest()->get();

        return response()->json(['categories' => $categories]);
    }
}