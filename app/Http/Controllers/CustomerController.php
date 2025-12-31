<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerRequest;
use App\Models\Customer;
use App\Models\EventVenue;
use App\Models\GuestType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customerData = Customer::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('App/Admin/Customers/Index', compact('customerData'));
    }

    public function create()
    {
        $guestTypes = GuestType::where('status', 1)->get();
        $customerNo = $this->getCustomerNo();
        return Inertia::render('App/Admin/Customers/CustomerForm', compact('guestTypes', 'customerNo'));
    }

    public function edit(Request $request, $id)
    {
        $customer = Customer::find($id);
        return Inertia::render('App/Admin/Customers/CustomerForm', [
            'customer' => $customer,
            'guestTypes' => GuestType::where('status', 1)->get(),
            'isEdit' => true,
        ]);
    }

    public function store(CustomerRequest $request)
    {
        $data = $request->validated();
        $data['customer_no'] = $this->getCustomerNo();
        Customer::create($data);
        return redirect()->route('guests.index')->with('success', 'Customer created successfully.');
    }

    public function update(CustomerRequest $request, Customer $customer)
    {
        $data = $request->validated();
        $customer->update($data);
        return redirect()->route('guests.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy($id)
    {
        $eventVenue = Customer::findOrFail($id);
        $eventVenue->delete();

        return response()->json(['message' => 'Event Venue deleted successfully.']);
    }

    // Delete an Customer
    public function trashed()
    {
        $customerData = Customer::onlyTrashed()->orderBy('deleted_at', 'desc')->paginate(10);
        return Inertia::render('App/Admin/Customers/Trashed', compact('customerData'));
    }

    public function restore($id)
    {
        $customer = Customer::onlyTrashed()->findOrFail($id);
        $customer->restore();
        return redirect()->route('guests.trashed')->with('success', 'Customer restored successfully.');
    }

    private function getCustomerNo()
    {
        $customer_no = (int) Customer::withTrashed()->max('customer_no');
        return $customer_no + 1;
    }
}
