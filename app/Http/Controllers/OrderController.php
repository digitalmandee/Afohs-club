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
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\Printer;

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

        try {
            // Order creation or update
            $order = Order::updateOrCreate(
                ['id' => $request->id],
                [
                    'order_number' => $request->id ? $request->order_no : $this->getOrderNo(),
                    'user_id' => $request->member['id'],
                    'waiter_id' => $request->waiter['id'] ?? null,
                    'table_id' => $request->table,
                    'order_type' => $request->order_type,
                    'person_count' => $request->person_count,
                    'start_date' => Carbon::parse($request->date)->toDateString(),
                    'start_time' => $request->time,
                    'down_payment' => $request->down_payment,
                    'amount' => $request->price,
                    'status' => 'pending',
                ]
            );

            // Group items by kitchen
            $groupedByKitchen = collect($request->order_items)->groupBy('kitchen_id');

            // Insert order items
            foreach ($groupedByKitchen as $kitchenId => $items) {
                foreach ($items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'kitchen_id' => $kitchenId,
                        'order_item' => $item,
                        'status' => 'pending',
                    ]);
                }
            }

            // Create invoice
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

            // Print the orders per kitchen
            $this->printOrdersForKitchens($groupedByKitchen, $order);

            return redirect()->back()->with('success', 'Order sent to kitchen.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error("Error sending order to kitchen: " . $th->getMessage());
            return redirect()->back()->with('error', 'Failed to send order to kitchen.');
        }
    }

    protected function printOrdersForKitchens($groupedByKitchen, $order)
    {
        foreach ($groupedByKitchen as $kitchenId => $items) {
            $kitchen = User::find($kitchenId);
            if (!$kitchen || !$kitchen->printer_ip) continue;

            try {
                $connector = new NetworkPrintConnector($kitchen->printer_ip, 9100);
                $printer = new Printer($connector);

                // Print header
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                $printer->text("Kitchen: {$kitchen->name}\n");
                $printer->text("Order #: {$order->order_number}\n");
                $printer->text("Table: {$order->table_id}\n");
                $printer->text(date("Y-m-d H:i:s") . "\n");
                $printer->text("--------------------------------\n");

                // Print each item
                foreach ($items as $item) {
                    $this->printItem($printer, $item);
                }

                // Finalize the print
                $printer->feed(1);
                $printer->cut();
                $printer->close();
            } catch (\Throwable $th) {
                Log::error("Printer error for Kitchen {$kitchenId}: " . $th->getMessage());
            }
        }
    }

    protected function printItem($printer, $item)
    {
        // Print the category if available
        if (isset($item['category']) && !empty($item['category'])) {
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("Category: {$item['category']}\n");
        }

        // Print item basic info
        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->text("- {$item['name']} x {$item['quantity']}\n");

        // Print item variants
        if (isset($item['variants']) && !empty($item['variants'])) {
            foreach ($item['variants'] as $variant) {
                $printer->text("  > {$variant['name']}: {$variant['value']}\n");
            }
        }

        // Add separator
        $printer->text("--------------------------------\n");
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