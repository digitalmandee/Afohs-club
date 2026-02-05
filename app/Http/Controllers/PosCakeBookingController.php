<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Member;
use App\Models\PosCakeBooking;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosCakeBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PosCakeBooking::query()
            ->with(['member', 'customer', 'employee', 'cakeType', 'createdBy']);

        // Search Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q
                    ->where('booking_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('booking_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('booking_date', '<=', $request->end_date);
        }

        // Apply Tenant Scope if needed (assuming trait or manual scope)
        if (session()->has('tenant_id')) {
            $query->where('tenant_id', session('tenant_id'));
        }

        $bookings = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('App/CakeBooking/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Fetch Cake Types (Category 'Cakes' or similar)
        // Assuming we need to find products in 'Cakes' category.
        // For now, I'll fetch all products or filter by category if I knew the ID.
        // I'll fetch generic products for now, user might need to configure category.
        $cakeTypes = Product::where('status', 'active')->get();  // This might be too many. Ideally filter by Category 'Cakes'.
        // Better: Fetch Category 'Cakes' first.

        $members = Member::select('id', 'full_name', 'membership_no', 'mobile_number_a as phone_number')->limit(50)->get();
        $guestTypes = \App\Models\GuestType::all();

        return Inertia::render('App/CakeBooking/Create', [
            'cakeTypes' => $cakeTypes,
            'guestTypes' => $guestTypes,
            'nextBookingNumber' => $this->getNextBookingNumber()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_type' => 'required|string',
            'booking_date' => 'required|date',
            'delivery_date' => 'nullable|date',
            'pickup_time' => 'nullable|string',
            'cake_type_id' => 'required|exists:products,id',
            'weight' => 'nullable|numeric',
            'total_price' => 'required|numeric',
            'advance_amount' => 'nullable|numeric',
            'payment_mode' => 'nullable|required_with:advance_amount',
        ]);

        DB::transaction(function () use ($request) {
            $booking = new PosCakeBooking();
            $booking->fill($request->all());

            // Auto-generate booking number if not provided
            if (!$request->booking_number) {
                $booking->booking_number = $this->getNextBookingNumber();
            }

            $booking->tenant_id = session('tenant_id');
            $booking->created_by = Auth::id();

            // Calculate Balance
            $total = $request->total_price ?? 0;
            $tax = $request->tax_amount ?? 0;
            $discount = $request->discount_amount ?? 0;
            $advance = $request->advance_amount ?? 0;

            $booking->balance_amount = ($total + $tax - $discount) - $advance;

            // Handle Attachment
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('cake_attachments', 'public');
                $booking->attachment_path = $path;
                $booking->has_attachment = true;
            }

            $booking->save();
        });

        return redirect()->route('cake-bookings.index')->with('success', 'Booking created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PosCakeBooking $posCakeBooking)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $booking = PosCakeBooking::with(['member', 'corporateMember', 'employee'])->findOrFail($id);
        // Same data as Create
        $cakeTypes = Product::all();
        $guestTypes = \App\Models\GuestType::all();

        return Inertia::render('App/CakeBooking/Create', [
            'booking' => $booking,
            'cakeTypes' => $cakeTypes,
            'guestTypes' => $guestTypes,
            'isEdit' => true
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $booking = PosCakeBooking::findOrFail($id);

        $booking->fill($request->except(['booking_number']));  // Don't change booking number

        // Recalculate Balance
        $total = $request->total_price ?? $booking->total_price;
        $tax = $request->tax_amount ?? $booking->tax_amount;
        $discount = $request->discount_amount ?? $booking->discount_amount;
        $advance = $request->advance_amount ?? $booking->advance_amount;

        $booking->balance_amount = ($total + $tax - $discount) - $advance;

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('cake_attachments', 'public');
            $booking->attachment_path = $path;
            $booking->has_attachment = true;
        }

        $booking->save();

        return redirect()->route('cake-bookings.index')->with('success', 'Booking updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $booking = PosCakeBooking::findOrFail($id);
        $booking->delete();
        return redirect()->back()->with('success', 'Booking deleted.');
    }

    // API for POS Search
    public function search(Request $request)
    {
        $query = $request->query('query');

        if (!$query)
            return response()->json([]);

        $booking = PosCakeBooking::with(['member', 'cakeType'])
            ->where(function ($q) use ($query) {
                $q
                    ->where('booking_number', $query)
                    ->orWhere('customer_phone', 'like', "%{$query}%");
            })
            ->where('status', '!=', 'completed')  // Only pending/active bookings
            ->where('status', '!=', 'cancelled')
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Booking not found or already completed.'], 404);
        }

        return response()->json($booking);
    }

    private function getNextBookingNumber()
    {
        $max = PosCakeBooking::max('booking_number');
        return $max ? $max + 1 : 1;
    }

    public function printInvoice($id)
    {
        $booking = PosCakeBooking::with(['member', 'cakeType', 'createdBy'])->findOrFail($id);
        return Inertia::render('App/CakeBooking/Invoice', [
            'booking' => $booking
        ]);
    }
}
