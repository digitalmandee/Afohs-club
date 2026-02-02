<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\FinancialInvoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminPosReportController extends Controller
{
    public function index(Request $request)
    {
        // Get date range - default to today
        $startDate = $request->get('start_date', Carbon::today()->toDateString());
        $endDate = $request->get('end_date', Carbon::today()->toDateString());

        // Get all tenants (restaurants)
        $tenants = Tenant::select('id', 'name')->get();

        // Get report data for all restaurants
        $allReportsData = [];
        $grandTotal = 0;

        foreach ($tenants as $tenant) {
            $reportData = $this->generateReportDataForTenant($tenant->id, $startDate, $endDate);
            if ($reportData['total_quantity'] > 0) {
                $allReportsData[] = [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'report_data' => $reportData
                ];
                $grandTotal += $reportData['total_quantity'];
            }
        }

        return Inertia::render('App/Admin/Reports/AllPosReports', [
            'allReportsData' => $allReportsData,
            'tenants' => $tenants,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotal' => $grandTotal,
            'filters' => $request->only(['start_date', 'end_date'])
        ]);
    }

    public function singleRestaurant(Request $request, $tenantId)
    {
        // Get date range - default to today
        $startDate = $request->get('start_date', Carbon::today()->toDateString());
        $endDate = $request->get('end_date', Carbon::today()->toDateString());

        // Get specific tenant
        $tenant = Tenant::findOrFail($tenantId);

        // Get report data for this restaurant
        $reportData = $this->generateReportDataForTenant($tenantId, $startDate, $endDate);

        return Inertia::render('App/Admin/Reports/SinglePosReport', [
            'reportData' => $reportData,
            'tenant' => $tenant,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'filters' => $request->only(['start_date', 'end_date'])
        ]);
    }

    public function printSingle(Request $request, $tenantId)
    {
        // Get date range - default to today
        $startDate = $request->get('start_date', Carbon::today()->toDateString());
        $endDate = $request->get('end_date', Carbon::today()->toDateString());

        // Get specific tenant
        $tenant = Tenant::findOrFail($tenantId);

        // Get report data for this restaurant
        $reportData = $this->generateReportDataForTenant($tenantId, $startDate, $endDate);

        return Inertia::render('App/Admin/Reports/SinglePosReportPrint', [
            'reportData' => $reportData,
            'tenant' => $tenant,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'filters' => $request->only(['start_date', 'end_date'])
        ]);
    }

    public function printAll(Request $request)
    {
        // Get date range - default to today
        $startDate = $request->get('start_date', Carbon::today()->toDateString());
        $endDate = $request->get('end_date', Carbon::today()->toDateString());

        // Get all tenants (restaurants)
        $tenants = Tenant::select('id', 'name')->get();

        // Get report data for all restaurants
        $allReportsData = [];
        $grandTotal = 0;

        foreach ($tenants as $tenant) {
            $reportData = $this->generateReportDataForTenant($tenant->id, $startDate, $endDate);
            if ($reportData['total_quantity'] > 0) {
                $allReportsData[] = [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'report_data' => $reportData
                ];
                $grandTotal += $reportData['total_quantity'];
            }
        }

        return Inertia::render('App/Admin/Reports/AllPosReportsPrint', [
            'allReportsData' => $allReportsData,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotal' => $grandTotal
        ]);
        return Inertia::render('App/Admin/Reports/SinglePosReportPrint', [
            'reportData' => $reportData,
            'tenant' => $tenant,
            'startDate' => $startDate,
            'endDate' => $endDate
        ]);
    }

    public function restaurantWise()
    {
        $filters = request()->only(['start_date', 'end_date']);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        $tenants = Tenant::all();
        $allReportsData = [];
        $grandTotal = 0;
        $grandSubTotal = 0;
        $grandDiscount = 0;
        $grandTotalSale = 0;

        foreach ($tenants as $tenant) {
            $reportData = $this->generateFinancialReportDataForTenant($tenant->id, $startDate, $endDate);

            if (!empty($reportData['categories'])) {
                $allReportsData[] = [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'report_data' => $reportData
                ];

                $grandTotal += $reportData['total_quantity'];
                $grandSubTotal += $reportData['total_sub_total'];
                $grandDiscount += $reportData['total_discount'];
                $grandTotalSale += $reportData['total_sale'];
            }
        }

        return Inertia::render('App/Admin/Reports/RestaurantWisePosReport', [
            'allReportsData' => $allReportsData,
            'tenants' => $tenants,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotal' => $grandTotal,
            'grandSubTotal' => $grandSubTotal,
            'grandDiscount' => $grandDiscount,
            'grandTotalSale' => $grandTotalSale,
            'filters' => $filters
        ]);
    }

    public function restaurantWisePrint()
    {
        $filters = request()->only(['start_date', 'end_date']);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        $tenants = Tenant::all();
        $allReportsData = [];
        $grandTotal = 0;
        $grandSubTotal = 0;
        $grandDiscount = 0;
        $grandTotalSale = 0;

        foreach ($tenants as $tenant) {
            $reportData = $this->generateFinancialReportDataForTenant($tenant->id, $startDate, $endDate);

            if (!empty($reportData['categories'])) {
                $allReportsData[] = [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'report_data' => $reportData
                ];

                $grandTotal += $reportData['total_quantity'];
                $grandSubTotal += $reportData['total_sub_total'];
                $grandDiscount += $reportData['total_discount'];
                $grandTotalSale += $reportData['total_sale'];
            }
        }

        return Inertia::render('App/Admin/Reports/RestaurantWisePosReportPrint', [
            'allReportsData' => $allReportsData,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotal' => $grandTotal,
            'grandSubTotal' => $grandSubTotal,
            'grandDiscount' => $grandDiscount,
            'grandTotalSale' => $grandTotalSale
        ]);
    }

    public function runningSalesOrders()
    {
        // Get today's date
        $today = now()->toDateString();

        // Get running orders (not completed) from Order table for today
        $runningOrders = Order::whereDate('created_at', $today)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with(['tenant', 'table', 'member'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Filter orders that have food_order invoices using JSON contains and attach invoice data
        $runningOrdersWithInvoices = $runningOrders->map(function ($order) {
            $invoice = FinancialInvoice::where('invoice_type', 'food_order')
                ->whereJsonContains('data', ['order_id' => $order->id])
                ->first();

            if ($invoice) {
                $order->invoice_no = $invoice->invoice_no;
                return $order;
            }
            return null;
        })->filter();

        $totalOrders = $runningOrdersWithInvoices->count();
        $totalAmount = $runningOrdersWithInvoices->sum('total_price');

        return Inertia::render('App/Admin/Reports/RunningSalesOrders', [
            'runningOrders' => $runningOrdersWithInvoices->values(),
            'totalOrders' => $totalOrders,
            'totalAmount' => $totalAmount,
            'reportDate' => $today
        ]);
    }

    public function runningSalesOrdersPrint()
    {
        // Get today's date
        $today = now()->toDateString();

        // Get running orders (not completed) from Order table for today
        $runningOrders = Order::whereDate('created_at', $today)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with(['tenant', 'table', 'member'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Filter orders that have food_order invoices using JSON contains and attach invoice data
        $runningOrdersWithInvoices = $runningOrders->map(function ($order) {
            $invoice = FinancialInvoice::where('invoice_type', 'food_order')
                ->whereJsonContains('data', ['order_id' => $order->id])
                ->first();

            if ($invoice) {
                $order->invoice_no = $invoice->invoice_no;
                return $order;
            }
            return null;
        })->filter();

        $totalOrders = $runningOrdersWithInvoices->count();
        $totalAmount = $runningOrdersWithInvoices->sum('total_price');

        return Inertia::render('App/Admin/Reports/RunningSalesOrdersPrint', [
            'runningOrders' => $runningOrdersWithInvoices->values(),
            'totalOrders' => $totalOrders,
            'totalAmount' => $totalAmount,
            'reportDate' => $today
        ]);
    }

    public function salesSummaryWithItems()
    {
        $filters = request()->only(['start_date', 'end_date']);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        // Get financial invoices with food_order type within date range
        $invoices = FinancialInvoice::where('invoice_type', 'food_order')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->orderBy('created_at', 'desc')
            ->get();

        // Process each invoice to get order and member details
        $salesData = [];
        $grandTotalQty = 0;
        $grandTotalAmount = 0;
        $grandTotalDiscount = 0;
        $grandTotalSale = 0;

        foreach ($invoices as $invoice) {
            $orderData = $invoice->data;
            $orderId = $orderData['order_id'] ?? null;

            if ($orderId) {
                $order = Order::with(['member', 'tenant', 'table', 'waiter'])
                    ->find($orderId);

                if ($order) {
                    $orderItems = [];
                    $invoiceTotalQty = 0;
                    $invoiceTotalAmount = 0;
                    $invoiceTotalDiscount = 0;
                    $invoiceTotalSale = 0;

                    // Process order items
                    foreach ($order->orderItems as $orderItem) {
                        $item = $orderItem->order_item;
                        $qty = (float) ($item['quantity'] ?? 0);
                        $price = (float) ($item['price'] ?? 0);
                        $totalPrice = (float) ($item['total_price'] ?? 0);
                        $subTotal = $price * $qty;
                        $discount = $subTotal - $totalPrice;

                        // Get menu_code from Product table
                        $menuCode = 'N/A';
                        $productId = $item['id'] ?? null;
                        if ($productId) {
                            $product = Product::find($productId);
                            if ($product) {
                                $menuCode = $product->menu_code ?? 'N/A';
                            }
                        }

                        $orderItems[] = [
                            'code' => $menuCode,
                            'name' => $item['name'] ?? 'Unknown Item',
                            'qty' => $qty,
                            'sale_price' => $price,
                            'sub_total' => $subTotal,
                            'discount' => $discount,
                            'total_sale' => $totalPrice
                        ];

                        $invoiceTotalQty += $qty;
                        $invoiceTotalAmount += $subTotal;
                        $invoiceTotalDiscount += $discount;
                        $invoiceTotalSale += $totalPrice;
                    }

                    $salesData[] = [
                        'invoice_no' => $invoice->invoice_no,
                        'date' => $invoice->created_at->format('d/M/Y'),
                        'customer' => $order->member ? $order->member->full_name : 'N/A',
                        'order_via' => $order->order_type ?? 'N/A',
                        'waiter' => $order->waiter ? $order->waiter->name : 'N/A',
                        'table' => $order->table ? $order->table->table_no : 'N/A',
                        'covers' => $order->person_count ?? 0,
                        'items' => $orderItems,
                        'total_qty' => $invoiceTotalQty,
                        'total_amount' => $invoiceTotalAmount,
                        'total_discount' => $invoiceTotalDiscount,
                        'total_sale' => $invoiceTotalSale,
                        'kot' => $order->kitchen_note ?? 'N/A',
                        'time' => $invoice->created_at->format('H:i:s')
                    ];

                    $grandTotalQty += $invoiceTotalQty;
                    $grandTotalAmount += $invoiceTotalAmount;
                    $grandTotalDiscount += $invoiceTotalDiscount;
                    $grandTotalSale += $invoiceTotalSale;
                }
            }
        }

        return Inertia::render('App/Admin/Reports/SalesSummaryWithItems', [
            'salesData' => $salesData,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotalQty' => $grandTotalQty,
            'grandTotalAmount' => $grandTotalAmount,
            'grandTotalDiscount' => $grandTotalDiscount,
            'grandTotalSale' => $grandTotalSale,
            'filters' => $filters
        ]);
    }

    public function salesSummaryWithItemsPrint()
    {
        $filters = request()->only(['start_date', 'end_date']);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        // Get financial invoices with food_order type within date range
        $invoices = FinancialInvoice::where('invoice_type', 'food_order')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->orderBy('created_at', 'desc')
            ->get();

        // Process each invoice to get order and member details
        $salesData = [];
        $grandTotalQty = 0;
        $grandTotalAmount = 0;
        $grandTotalDiscount = 0;
        $grandTotalSale = 0;

        foreach ($invoices as $invoice) {
            $orderData = $invoice->data;
            $orderId = $orderData['order_id'] ?? null;

            if ($orderId) {
                $order = Order::with(['member', 'tenant', 'table', 'waiter'])
                    ->find($orderId);

                if ($order) {
                    $orderItems = [];
                    $invoiceTotalQty = 0;
                    $invoiceTotalAmount = 0;
                    $invoiceTotalDiscount = 0;
                    $invoiceTotalSale = 0;

                    // Process order items
                    foreach ($order->orderItems as $orderItem) {
                        $item = $orderItem->order_item;
                        $qty = (float) ($item['quantity'] ?? 0);
                        $price = (float) ($item['price'] ?? 0);
                        $totalPrice = (float) ($item['total_price'] ?? 0);
                        $subTotal = $price * $qty;
                        $discount = $subTotal - $totalPrice;

                        // Get menu_code from Product table
                        $menuCode = 'N/A';
                        $productId = $item['id'] ?? null;
                        if ($productId) {
                            $product = Product::find($productId);
                            if ($product) {
                                $menuCode = $product->menu_code ?? 'N/A';
                            }
                        }

                        $orderItems[] = [
                            'code' => $menuCode,
                            'name' => $item['name'] ?? 'Unknown Item',
                            'qty' => $qty,
                            'sale_price' => $price,
                            'sub_total' => $subTotal,
                            'discount' => $discount,
                            'total_sale' => $totalPrice
                        ];

                        $invoiceTotalQty += $qty;
                        $invoiceTotalAmount += $subTotal;
                        $invoiceTotalDiscount += $discount;
                        $invoiceTotalSale += $totalPrice;
                    }

                    $salesData[] = [
                        'invoice_no' => $invoice->invoice_no,
                        'date' => $invoice->created_at->format('d/M/Y'),
                        'customer' => $order->member ? $order->member->full_name : 'N/A',
                        'order_via' => $order->order_type ?? 'N/A',
                        'waiter' => $order->waiter ? $order->waiter->name : 'N/A',
                        'table' => $order->table ? $order->table->table_no : 'N/A',
                        'covers' => $order->person_count ?? 0,
                        'items' => $orderItems,
                        'total_qty' => $invoiceTotalQty,
                        'total_amount' => $invoiceTotalAmount,
                        'total_discount' => $invoiceTotalDiscount,
                        'total_sale' => $invoiceTotalSale,
                        'kot' => $order->kitchen_note ?? 'N/A',
                        'time' => $invoice->created_at->format('H:i:s')
                    ];

                    $grandTotalQty += $invoiceTotalQty;
                    $grandTotalAmount += $invoiceTotalAmount;
                    $grandTotalDiscount += $invoiceTotalDiscount;
                    $grandTotalSale += $invoiceTotalSale;
                }
            }
        }

        return Inertia::render('App/Admin/Reports/SalesSummaryWithItemsPrint', [
            'salesData' => $salesData,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotalQty' => $grandTotalQty,
            'grandTotalAmount' => $grandTotalAmount,
            'grandTotalDiscount' => $grandTotalDiscount,
            'grandTotalSale' => $grandTotalSale
        ]);
    }

    public function dailySalesListCashierWise()
    {
        $filters = request()->only(['start_date', 'end_date', 'cashier_id']);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();
        $cashierFilter = $filters['cashier_id'] ?? null;

        // Get all cashiers from Employee model (assuming cashier is an employee type)
        $allCashiers = Employee::select('id', 'name')
            ->get();
        Log::info('allCashiers: ' . $allCashiers);
        // Get financial invoices with food_order type within date range
        $invoicesQuery = FinancialInvoice::where('invoice_type', 'food_order')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        // Apply cashier filter if provided
        // Apply cashier filter if provided
        if ($cashierFilter) {
            // Since cashier info is in Order model accessed via data->order_id,
            // we need to get order IDs for the selected cashier first
            $orderIds = Order::where('cashier_id', $cashierFilter)
                ->pluck('id')
                ->toArray();

            if (!empty($orderIds)) {
                $invoicesQuery->where(function ($q) use ($orderIds) {
                    foreach ($orderIds as $orderId) {
                        $q->orWhereJsonContains('data->order_id', $orderId);
                    }
                });
            } else {
                // If no orders found for this cashier, return empty result
                $invoicesQuery->whereRaw('1 = 0');
            }
        }

        $invoices = $invoicesQuery->get();

        // Initialize cashier data structure with all cashiers
        $cashierData = [];

        // Initialize all cashiers (even if they have no sales)
        foreach ($allCashiers as $cashier) {
            $cashierData[$cashier->name] = [
                'id' => $cashier->id,
                'name' => $cashier->name,
                'sale' => 0,
                'discount' => 0,
                's_tax_amt' => 0,
                'cash' => 0,
                'credit' => 0,
                'paid' => 0,
                'unpaid' => 0,
                'total' => 0
            ];
        }

        // Initialize grand totals
        $grandTotalSale = 0;
        $grandTotalDiscount = 0;
        $grandTotalSTax = 0;
        $grandTotalCash = 0;
        $grandTotalCredit = 0;
        $grandTotalPaid = 0;
        $grandTotalUnpaid = 0;
        $grandTotal = 0;

        foreach ($invoices as $invoice) {
            $orderData = $invoice->data;
            $orderId = $orderData['order_id'] ?? null;

            if ($orderId) {
                $order = Order::with(['cashier'])
                    ->find($orderId);

                if ($order && $order->cashier) {
                    $cashierName = $order->cashier->name;

                    // Initialize cashier data if not exists
                    if (!isset($cashierData[$cashierName])) {
                        $cashierData[$cashierName] = [
                            'name' => $cashierName,
                            'sale' => 0,
                            'discount' => 0,
                            's_tax_amt' => 0,
                            'cash' => 0,
                            'credit' => 0,
                            'paid' => 0,
                            'unpaid' => 0,
                            'total' => 0
                        ];
                    }

                    // Calculate amounts from Order and FinancialInvoice
                    $saleAmount = (float) ($order->total_price ?? 0);
                    $discountAmount = (float) ($order->discount ?? 0);
                    $taxAmount = (float) ($order->tax ?? 0);

                    // Get payment info from FinancialInvoice
                    $invoiceAmount = (float) ($invoice->amount ?? 0);
                    $paidAmount = (float) ($invoice->paid_amount ?? 0);
                    $unpaidAmount = $invoiceAmount - $paidAmount;

                    // Get cash and credit based on payment_method
                    $paymentMethod = strtolower($invoice->payment_method ?? '');
                    $cashAmount = 0;
                    $creditAmount = 0;

                    if ($paymentMethod === 'cash') {
                        $cashAmount = $paidAmount;
                    } elseif (in_array($paymentMethod, ['credit', 'credit_card', 'card', 'debit_card'])) {
                        $creditAmount = $paidAmount;
                    } else {
                        // If payment method is unknown or empty, default to cash
                        $cashAmount = $paidAmount;
                    }

                    $totalAmount = $invoiceAmount;

                    // Add to cashier totals
                    $cashierData[$cashierName]['sale'] += $saleAmount;
                    $cashierData[$cashierName]['discount'] += $discountAmount;
                    $cashierData[$cashierName]['s_tax_amt'] += $taxAmount;
                    $cashierData[$cashierName]['cash'] += $cashAmount;
                    $cashierData[$cashierName]['credit'] += $creditAmount;
                    $cashierData[$cashierName]['paid'] += $paidAmount;
                    $cashierData[$cashierName]['unpaid'] += $unpaidAmount;
                    $cashierData[$cashierName]['total'] += $totalAmount;

                    // Add to grand totals
                    $grandTotalSale += $saleAmount;
                    $grandTotalDiscount += $discountAmount;
                    $grandTotalSTax += $taxAmount;
                    $grandTotalCash += $cashAmount;
                    $grandTotalCredit += $creditAmount;
                    $grandTotalPaid += $paidAmount;
                    $grandTotalUnpaid += $unpaidAmount;
                    $grandTotal += $totalAmount;
                }
            }
        }

        // Convert to array and sort by cashier name
        $cashierArray = array_values($cashierData);
        usort($cashierArray, function ($a, $b) {
            return strcmp($a['name'], $b['name']);
        });

        return Inertia::render('App/Admin/Reports/DailySalesListCashierWise', [
            'cashierData' => $cashierArray,
            'allCashiers' => $allCashiers,  // ADD THIS LINE
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotalSale' => $grandTotalSale,
            'grandTotalDiscount' => $grandTotalDiscount,
            'grandTotalSTax' => $grandTotalSTax,
            'grandTotalCash' => $grandTotalCash,
            'grandTotalCredit' => $grandTotalCredit,
            'grandTotalPaid' => $grandTotalPaid,
            'grandTotalUnpaid' => $grandTotalUnpaid,
            'grandTotal' => $grandTotal,
            'filters' => $filters
        ]);
    }

    public function dailySalesListCashierWisePrint()
    {
        $filters = request()->only(['start_date', 'end_date']);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        // Get financial invoices with food_order type within date range
        $invoices = FinancialInvoice::where('invoice_type', 'food_order')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->get();

        // Process cashier-wise data
        $cashierData = [];
        $grandTotalSale = 0;
        $grandTotalDiscount = 0;
        $grandTotalSTax = 0;
        $grandTotalCash = 0;
        $grandTotalCredit = 0;
        $grandTotalPaid = 0;
        $grandTotalUnpaid = 0;
        $grandTotal = 0;

        foreach ($invoices as $invoice) {
            $orderData = $invoice->data;
            $orderId = $orderData['order_id'] ?? null;

            if ($orderId) {
                $order = Order::with(['cashier'])
                    ->find($orderId);

                if ($order && $order->cashier) {
                    $cashierName = $order->cashier->name;

                    // Initialize cashier data if not exists
                    if (!isset($cashierData[$cashierName])) {
                        $cashierData[$cashierName] = [
                            'name' => $cashierName,
                            'sale' => 0,
                            'discount' => 0,
                            's_tax_amt' => 0,
                            'cash' => 0,
                            'credit' => 0,
                            'paid' => 0,
                            'unpaid' => 0,
                            'total' => 0
                        ];
                    }

                    // Calculate amounts from Order and FinancialInvoice
                    $saleAmount = (float) ($order->total_price ?? 0);
                    $discountAmount = (float) ($order->discount ?? 0);
                    $taxAmount = (float) ($order->tax ?? 0);

                    // Get payment info from FinancialInvoice
                    $invoiceAmount = (float) ($invoice->amount ?? 0);
                    $paidAmount = (float) ($invoice->paid_amount ?? 0);
                    $unpaidAmount = $invoiceAmount - $paidAmount;

                    // Get cash and credit based on payment_method
                    $paymentMethod = strtolower($invoice->payment_method ?? '');
                    $cashAmount = 0;
                    $creditAmount = 0;

                    if ($paymentMethod === 'cash') {
                        $cashAmount = $paidAmount;
                    } elseif (in_array($paymentMethod, ['credit', 'credit_card', 'card', 'debit_card'])) {
                        $creditAmount = $paidAmount;
                    } else {
                        // If payment method is unknown or empty, default to cash
                        $cashAmount = $paidAmount;
                    }

                    $totalAmount = $invoiceAmount;

                    // Add to cashier totals
                    $cashierData[$cashierName]['sale'] += $saleAmount;
                    $cashierData[$cashierName]['discount'] += $discountAmount;
                    $cashierData[$cashierName]['s_tax_amt'] += $taxAmount;
                    $cashierData[$cashierName]['cash'] += $cashAmount;
                    $cashierData[$cashierName]['credit'] += $creditAmount;
                    $cashierData[$cashierName]['paid'] += $paidAmount;
                    $cashierData[$cashierName]['unpaid'] += $unpaidAmount;
                    $cashierData[$cashierName]['total'] += $totalAmount;

                    // Add to grand totals
                    $grandTotalSale += $saleAmount;
                    $grandTotalDiscount += $discountAmount;
                    $grandTotalSTax += $taxAmount;
                    $grandTotalCash += $cashAmount;
                    $grandTotalCredit += $creditAmount;
                    $grandTotalPaid += $paidAmount;
                    $grandTotalUnpaid += $unpaidAmount;
                    $grandTotal += $totalAmount;
                }
            }
        }

        // Convert to array and sort by cashier name
        $cashierArray = array_values($cashierData);
        usort($cashierArray, function ($a, $b) {
            return strcmp($a['name'], $b['name']);
        });

        return Inertia::render('App/Admin/Reports/DailySalesListCashierWisePrint', [
            'cashierData' => $cashierArray,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'grandTotalSale' => $grandTotalSale,
            'grandTotalDiscount' => $grandTotalDiscount,
            'grandTotalSTax' => $grandTotalSTax,
            'grandTotalCash' => $grandTotalCash,
            'grandTotalCredit' => $grandTotalCredit,
            'grandTotalPaid' => $grandTotalPaid,
            'grandTotalUnpaid' => $grandTotalUnpaid,
            'grandTotal' => $grandTotal
        ]);
    }

    public function dailyDumpItemsReport()
    {
        $filters = request()->only(['start_date', 'end_date']);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        // Get cancelled order items within date range
        $cancelledItems = OrderItem::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->where('status', 'cancelled')
            ->with(['order' => function ($query) {
                $query->with(['table']);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        // Process cancelled items data with deduplication
        $dumpItemsData = [];
        $processedItems = [];  // To avoid duplicates
        $totalQuantity = 0;
        $totalSalePrice = 0;
        $totalFoodValue = 0;

        foreach ($cancelledItems as $orderItem) {
            $order = $orderItem->order;
            if (!$order)
                continue;

            // Get invoice number from FinancialInvoice
            $invoiceNo = 'N/A';
            $financialInvoice = FinancialInvoice::where('invoice_type', 'food_order')
                ->whereJsonContains('data', ['order_id' => $order->id])
                ->first();

            if ($financialInvoice) {
                $invoiceNo = $financialInvoice->invoice_no;
            }

            // Process the order_item JSON (single item object)
            $item = $orderItem->order_item;
            if ($item && is_array($item)) {
                $productId = $item['id'] ?? null;
                $itemName = $item['name'] ?? 'Unknown Item';

                // Create unique key to avoid duplicates
                $uniqueKey = $order->id . '_' . $productId . '_' . $itemName . '_' . $orderItem->id;

                // Skip if already processed
                if (!isset($processedItems[$uniqueKey])) {
                    $processedItems[$uniqueKey] = true;

                    $quantity = (float) ($item['quantity'] ?? 1);
                    $itemPrice = (float) ($item['price'] ?? 0);  // Price from order_item JSON
                    $totalPrice = (float) ($item['total_price'] ?? 0);  // Total price from order_item JSON
                    $salePrice = $itemPrice;  // Use price from order_item for SALE PRICE
                    $foodValue = $totalPrice;  // Use total_price from order_item for FOOD VALUE

                    // Get menu_code and product name from Product table
                    $menuCode = 'N/A';
                    $productName = $itemName;  // Default to order_item name

                    if ($productId) {
                        $product = Product::find($productId);
                        if ($product) {
                            $menuCode = $product->menu_code ?? 'N/A';
                            $productName = $product->name ?? $itemName;  // Use product name if available
                        }
                    }

                    $dumpItemsData[] = [
                        'invoice_kot' => $invoiceNo,
                        'table_no' => $order->table ? $order->table->table_no : 'N/A',
                        'date' => $orderItem->created_at->format('d/m/Y'),
                        'item_code' => $menuCode,
                        'item_name' => $productName,
                        'qty' => $quantity,
                        'status' => ucfirst($orderItem->status ?? 'Cancelled'),
                        'instructions' => $orderItem->instructions ?? 'N/A',
                        'reason' => $this->getCancelReason($orderItem->cancelType ?? ''),
                        'remarks' => $orderItem->remark ?? 'N/A',
                        'sale_price' => $salePrice,
                        'food_value' => $foodValue,
                        'cancelled_by' => 'N/A'  // As requested, set to N/A for now
                    ];

                    $totalQuantity += $quantity;
                    $totalSalePrice += $salePrice;
                    $totalFoodValue += $foodValue;
                }
            }
        }

        return Inertia::render('App/Admin/Reports/DailyDumpItemsReport', [
            'dumpItemsData' => $dumpItemsData,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'totalQuantity' => $totalQuantity,
            'totalSalePrice' => $totalSalePrice,
            'totalFoodValue' => $totalFoodValue,
            'filters' => $filters
        ]);
    }

    public function dailyDumpItemsReportPrint()
    {
        $filters = request()->only(['start_date', 'end_date']);
        $startDate = $filters['start_date'] ?? now()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        // Get cancelled order items within date range
        $cancelledItems = OrderItem::whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->where('status', 'cancelled')
            ->with(['order' => function ($query) {
                $query->with(['table']);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        // Process cancelled items data with deduplication
        $dumpItemsData = [];
        $processedItems = [];  // To avoid duplicates
        $totalQuantity = 0;
        $totalSalePrice = 0;
        $totalFoodValue = 0;

        foreach ($cancelledItems as $orderItem) {
            $order = $orderItem->order;
            if (!$order)
                continue;

            // Get invoice number from FinancialInvoice
            $invoiceNo = 'N/A';
            $financialInvoice = FinancialInvoice::where('invoice_type', 'food_order')
                ->whereJsonContains('data', ['order_id' => $order->id])
                ->first();

            if ($financialInvoice) {
                $invoiceNo = $financialInvoice->invoice_no;
            }

            // Process the order_item JSON (single item object)
            $item = $orderItem->order_item;
            if ($item && is_array($item)) {
                $productId = $item['id'] ?? null;
                $itemName = $item['name'] ?? 'Unknown Item';

                // Create unique key to avoid duplicates
                $uniqueKey = $order->id . '_' . $productId . '_' . $itemName . '_' . $orderItem->id;

                // Skip if already processed
                if (!isset($processedItems[$uniqueKey])) {
                    $processedItems[$uniqueKey] = true;

                    $quantity = (float) ($item['quantity'] ?? 1);
                    $itemPrice = (float) ($item['price'] ?? 0);  // Price from order_item JSON
                    $totalPrice = (float) ($item['total_price'] ?? 0);  // Total price from order_item JSON
                    $salePrice = $itemPrice;  // Use price from order_item for SALE PRICE
                    $foodValue = $totalPrice;  // Use total_price from order_item for FOOD VALUE

                    // Get menu_code and product name from Product table
                    $menuCode = 'N/A';
                    $productName = $itemName;  // Default to order_item name

                    if ($productId) {
                        $product = Product::find($productId);
                        if ($product) {
                            $menuCode = $product->menu_code ?? 'N/A';
                            $productName = $product->name ?? $itemName;  // Use product name if available
                        }
                    }

                    $dumpItemsData[] = [
                        'invoice_kot' => $invoiceNo,
                        'table_no' => $order->table ? $order->table->table_no : 'N/A',
                        'date' => $orderItem->created_at->format('d/m/Y'),
                        'item_code' => $menuCode,
                        'item_name' => $productName,
                        'qty' => $quantity,
                        'status' => ucfirst($orderItem->status ?? 'Cancelled'),
                        'instructions' => $orderItem->instructions ?? 'N/A',
                        'reason' => $this->getCancelReason($orderItem->cancelType ?? ''),
                        'remarks' => $orderItem->remark ?? 'N/A',
                        'sale_price' => $salePrice,
                        'food_value' => $foodValue,
                        'cancelled_by' => 'N/A'  // As requested, set to N/A for now
                    ];

                    $totalQuantity += $quantity;
                    $totalSalePrice += $salePrice;
                    $totalFoodValue += $foodValue;
                }
            }
        }

        return Inertia::render('App/Admin/Reports/DailyDumpItemsReportPrint', [
            'dumpItemsData' => $dumpItemsData,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'totalQuantity' => $totalQuantity,
            'totalSalePrice' => $totalSalePrice,
            'totalFoodValue' => $totalFoodValue
        ]);
    }

    private function getCancelReason($cancelType)
    {
        switch (strtolower($cancelType)) {
            case 'customer':
                return 'CANCELLED BY CUSTOMER';
            case 'guest':
                return 'GUEST MIND CHANGE';
            case 'kitchen':
                return 'KITCHEN ISSUE';
            case 'return':
                return 'Return';
            case 'void':
                return 'Void';
            default:
                return $cancelType ?: 'N/A';
        }
    }

    private function generateReportDataForTenant($tenantId, $startDate, $endDate)
    {
        // Get all orders within date range from ALL tenants (not just specific tenant)
        // We want to see all products sold that belong to this tenant
        $orders = Order::whereBetween('start_date', [$startDate, $endDate])
            ->whereIn('status', ['completed', 'paid'])
            ->get();

        // Initialize report structure
        $reportData = [];
        $totalQuantity = 0;

        // Group items by category - only include products that belong to this tenant
        foreach ($orders as $order) {
            foreach ($order->orderItems as $orderItem) {
                $items = $orderItem->order_item;
                Log::info('Items: ', $items);
                $this->processItem($items, $reportData, $totalQuantity, $tenantId);
            }
        }

        Log::info("Report data for tenant {$tenantId}:", $reportData);

        // Convert to array and sort
        $reportArray = array_values($reportData);

        // Sort categories by name
        usort($reportArray, function ($a, $b) {
            return strcmp($a['category_name'], $b['category_name']);
        });

        // Sort items within each category by quantity (descending)
        foreach ($reportArray as &$category) {
            $category['items'] = array_values($category['items']);
            usort($category['items'], function ($a, $b) {
                return $b['quantity'] - $a['quantity'];
            });
        }

        return [
            'categories' => $reportArray,
            'total_quantity' => $totalQuantity,
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate
            ]
        ];
    }

    private function processItem($item, &$reportData, &$totalQuantity, $currentTenantId)
    {
        // Handle single item (not array)
        $productId = $item['id'] ?? null;
        $quantity = $item['quantity'] ?? 1;
        $categoryName = $item['category'] ?? 'Uncategorized';

        if (!$productId)
            return;

        // Get the product to check its tenant_id
        $product = Product::find($productId);

        if (!$product) {
            Log::info("Product {$productId} not found");
            return;
        }

        Log::info("Product {$product->tenant_id} vs {$currentTenantId} - checking ownership");

        // Only include products that belong to this tenant
        if ($product->tenant_id != $currentTenantId) {
            Log::info("Skipping product {$productId} - belongs to tenant {$product->tenant_id}, not {$currentTenantId}");
            return;  // Skip products from other restaurants
        }

        // Initialize category if not exists
        if (!isset($reportData[$categoryName])) {
            $reportData[$categoryName] = [
                'category_name' => $categoryName,
                'items' => [],
                'total_quantity' => 0
            ];
        }

        // Initialize item if not exists
        $itemName = $item['name'] ?? 'Unknown Item';
        if (!isset($reportData[$categoryName]['items'][$itemName])) {
            $reportData[$categoryName]['items'][$itemName] = [
                'name' => $itemName,
                'quantity' => 0,
                'product_id' => $productId,
                'menu_code' => $product->menu_code ?? 'N/A'
            ];
        }

        // Add quantity
        $reportData[$categoryName]['items'][$itemName]['quantity'] += $quantity;
        $reportData[$categoryName]['total_quantity'] += $quantity;
        $totalQuantity += $quantity;

        Log::info("Added product {$productId} ({$itemName}) to {$categoryName} - Qty: {$quantity}");
    }

    private function generateFinancialReportDataForTenant($tenantId, $startDate, $endDate)
    {
        // Get all orders within date range
        $orders = Order::whereBetween('start_date', [$startDate, $endDate])
            ->whereIn('status', ['completed', 'paid'])
            ->get();

        // Initialize report structure
        $reportData = [];
        $totalQuantity = 0;
        $totalSubTotal = 0;
        $totalDiscount = 0;
        $totalSale = 0;

        // Group items by category - only include products that belong to this tenant
        foreach ($orders as $order) {
            // Get order-level discount
            $orderDiscount = (float) ($order->discount ?? 0);
            $orderSubTotal = 0;

            // First pass: calculate order subtotal for proportional discount distribution
            foreach ($order->orderItems as $orderItem) {
                $item = $orderItem->order_item;
                $itemTenantId = $item['tenant_id'] ?? null;
                if ($itemTenantId == $tenantId) {
                    $quantity = (float) ($item['quantity'] ?? 1);
                    $price = (float) ($item['price'] ?? 0);
                    $orderSubTotal += ($price * $quantity);
                }
            }

            // Second pass: process items with proportional discount
            foreach ($order->orderItems as $orderItem) {
                $item = $orderItem->order_item;
                $this->processFinancialItem($item, $reportData, $totalQuantity, $totalSubTotal, $totalDiscount, $totalSale, $tenantId, $orderDiscount, $orderSubTotal);
            }
        }

        // Convert to array format and sort
        $categories = [];
        foreach ($reportData as $categoryData) {
            // Convert items object to array and sort by quantity (descending)
            $itemsArray = array_values($categoryData['items']);
            usort($itemsArray, function ($a, $b) {
                return $b['quantity'] <=> $a['quantity'];
            });

            $categoryData['items'] = $itemsArray;
            $categories[] = $categoryData;
        }

        // Sort categories alphabetically
        usort($categories, function ($a, $b) {
            return strcmp($a['category_name'], $b['category_name']);
        });

        return [
            'categories' => $categories,
            'total_quantity' => $totalQuantity,
            'total_sub_total' => $totalSubTotal,
            'total_discount' => $totalDiscount,
            'total_sale' => $totalSale
        ];
    }

    private function processFinancialItem($item, &$reportData, &$totalQuantity, &$totalSubTotal, &$totalDiscount, &$totalSale, $currentTenantId, $orderDiscount = 0, $orderSubTotal = 0)
    {
        $itemId = $item['id'] ?? null;
        $quantity = (float) ($item['quantity'] ?? 1);
        $price = (float) ($item['price'] ?? 0);
        $totalPrice = (float) ($item['total_price'] ?? 0);
        $itemTenantId = $item['tenant_id'] ?? null;
        $categoryName = $item['category'] ?? 'Unknown Category';
        $itemName = $item['name'] ?? 'Unknown Item';

        // Only include items that belong to this tenant
        if ($itemTenantId != $currentTenantId) {
            return;
        }

        // Calculate financial values
        $subTotal = $price * $quantity;

        // Calculate proportional discount for this item
        $itemDiscount = 0;
        if ($orderSubTotal > 0 && $orderDiscount > 0) {
            $itemDiscount = ($subTotal / $orderSubTotal) * $orderDiscount;
        }

        $totalItemSale = $subTotal - $itemDiscount;

        // Get product to find menu_code (if exists)
        $menuCode = 'N/A';
        if ($itemId) {
            $product = Product::find($itemId);
            if ($product) {
                $menuCode = $product->menu_code ?? 'N/A';
            }
        }

        // Initialize category if not exists
        if (!isset($reportData[$categoryName])) {
            $reportData[$categoryName] = [
                'category_name' => $categoryName,
                'items' => [],
                'total_quantity' => 0,
                'total_sub_total' => 0,
                'total_discount' => 0,
                'total_sale' => 0
            ];
        }

        // Initialize item if not exists
        if (!isset($reportData[$categoryName]['items'][$itemName])) {
            $reportData[$categoryName]['items'][$itemName] = [
                'name' => $itemName,
                'quantity' => 0,
                'price' => $price,
                'sub_total' => 0,
                'discount' => 0,
                'total_sale' => 0,
                'menu_code' => $menuCode
            ];
        }

        // Add values
        $reportData[$categoryName]['items'][$itemName]['quantity'] += $quantity;
        $reportData[$categoryName]['items'][$itemName]['sub_total'] += $subTotal;
        $reportData[$categoryName]['items'][$itemName]['discount'] += $itemDiscount;
        $reportData[$categoryName]['items'][$itemName]['total_sale'] += $totalItemSale;

        // Update category totals
        $reportData[$categoryName]['total_quantity'] += $quantity;
        $reportData[$categoryName]['total_sub_total'] += $subTotal;
        $reportData[$categoryName]['total_discount'] += $itemDiscount;
        $reportData[$categoryName]['total_sale'] += $totalItemSale;

        // Update grand totals
        $totalQuantity += $quantity;
        $totalSubTotal += $subTotal;
        $totalDiscount += $itemDiscount;
        $totalSale += $totalItemSale;
    }
}
