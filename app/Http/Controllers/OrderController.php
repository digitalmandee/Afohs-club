<?php

namespace App\Http\Controllers;

use App\Models\MemberType;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orderNo = $this->getOrderNo();
        $memberTypes = MemberType::select('id', 'name')->get();
        return Inertia::render('App/Order/New/Index', compact(['orderNo', 'memberTypes']));
    }

    private function getOrderNo()
    {
        $orderNo = Order::max('order_number');
        $orderNo = $orderNo + 1;
        return $orderNo;
    }
}
