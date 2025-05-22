<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\MembershipInvoice;
use App\Models\MemberType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $memberTypes = MemberType::all();

        return Inertia::render('App/Admin/Membership/Payment', [
            'error' => null,
            'memberTypes' => $memberTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subscription_type' => 'required|in:One Time,Monthly,Annual',
            'amount' => 'required|numeric|min:0.01',
            'customer_charges' => 'required|numeric|min:0',
            'user_id' => 'required|exists:users,id', // Make user_id required
        ]);

        try {
            $invoice = MembershipInvoice::create([
                'user_id' => $validated['user_id'],
                'subscription_type' => $validated['subscription_type'],
                'amount' => $validated['amount'],
                'customer_charges' => $validated['customer_charges'],
            ]);

            return redirect()->route('membership.allpayment')->with('success', 'Payment processed successfully');
        } catch (\Exception $e) {
            Log::error('Payment processing failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to process payment: ' . $e->getMessage());
        }
    }
}
