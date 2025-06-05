<?php

namespace App\Http\Controllers;

use App\Models\CardPayment;
use App\Models\Member;
use Inertia\Inertia;
use App\Models\MembershipInvoice;
use App\Models\MemberType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $memberId = $request->query('member_id'); // or $request->member_id

        $member = null;

        if ($memberId) {
            $member = User::with('member.memberType')->find($memberId);
        }

        return Inertia::render('App/Admin/Membership/Payment', compact('member'));
    }


    public function store(Request $request)
    {
        $request->validate([
            'subscription_type' => 'required|in:one_time,monthly,annual',
            'amount' => 'required|numeric|min:0.01',
            'customer_charges' => 'required|numeric|min:0',
            'member_type_id' => 'required|exists:member_types,id',
            'user_id' => 'required|exists:users,id',
            'duration' => 'required|integer|min:1',
        ]);

        try {
            $paidForMonth = Carbon::parse($request->input('paid_for_month', now()->format('Y-m-d')));
            $duration = (int) $request->input('duration');
            $expiryDate = $paidForMonth->copy()->addMonths($duration)->subDay();

            // Check for overlapping subscription
            $hasActiveSubscription = CardPayment::where('user_id', $request->user_id)->whereDate('expiry_date', '>=', $paidForMonth->startOfMonth())->exists();

            if ($hasActiveSubscription) {
                return response()->json(['message' => 'User already has an active subscription during this month.'], 422);
            }

            $memberType = MemberType::findOrFail($request->member_type_id);

            DB::beginTransaction();

            $payment = CardPayment::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'user_id' => $request->user_id,
                'member_type' => $memberType,
                'subscription_type' => $request->subscription_type,
                'amount_paid' => $request->amount,
                'customer_charges' => $request->customer_charges,
                'total_amount' => $request->total_amount,
                'paid_for_month' => $paidForMonth,
                'expiry_date' => $expiryDate,
                'payment_method' => $request->payment_method,
                'reciept' => $request->reciept,
                'payment_date' => now(),
            ]);

            Member::where('user_id', $request->user_id)->update(['payment_id' => $payment->id, 'card_status' => 'active']);

            DB::commit();

            return response()->json(['message' => 'Payment processed successfully'], 200);
        } catch (\Exception $e) {
            // Log::error('Payment processing failed: ' . $e->getMessage());
            DB::rollBack();
            return response()->json(['message' => 'Failed to process payment: ' . $e->getMessage()], 500);
        }
    }


    function generateInvoiceNumber()
    {
        $lastPayment = CardPayment::latest('id')->first();
        $nextId = $lastPayment ? $lastPayment->id + 1 : 1;
        $year = date('Y');
        return 'INV-' . $year . '-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
    }
}
