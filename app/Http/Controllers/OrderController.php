<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Floor;
use App\Models\MemberType;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
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

        return Inertia::render('App/Order/New/Index', compact('orderNo', 'memberTypes', 'floorTables'));
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

    public function sendToKitchen(Request $request)
    {
        dd($request->all());
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
