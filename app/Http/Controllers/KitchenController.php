<?php

namespace App\Http\Controllers;

use App\Models\MemberType;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\UserDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class KitchenController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $orders = Order::with([
            'table:id,table_no', // Load only needed table fields
            'orderItems' => function ($query) use ($userId) {
                $query->where('kitchen_id', $userId)
                    ->select('id', 'order_id', 'kitchen_id', 'order_item', 'status');
            },
        ])->whereHas('orderItems', function ($query) use ($userId) {
            $query->where('kitchen_id', $userId);
        })->latest()->get();

        return Inertia::render('App/Kitchen/Dashboard', [
            'kitchenOrders' => $orders,
        ]);
    }


    public function updateAll(Request $request, $orderId)
    {

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed',
            'items' => 'required|json',
            'order_time' => 'nullable|date_format:Y-m-d\TH:i:s.v\Z', // Validate order_time if provided in the specified format
            'end_time' => 'nullable|date_format:Y-m-d\TH:i:s.v\Z', // Validate end_time if provided in the specified format
        ]);

        if ($validator->fails()) {

            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed.');
        }

        // Update overall order status, order_time, and end_time
        $order = Order::findOrFail($orderId);
        $order->status = $request->input('status');

        if ($request->filled('order_time')) {
            $orderTimeIso = $request->input('order_time');
            Log::info('Order time ISO: ' . $orderTimeIso);
            $order->order_time = Carbon::parse($orderTimeIso)->format('Y-m-d H:i:s');
        } elseif ($request->input('status') === 'in_progress') {
            $order->order_time = Carbon::now()->format('Y-m-d H:i:s');
        }

        if ($request->filled('end_time')) {
            $orderTimeIso = $request->input('end_time');
            Log::info('Order time ISO: ' . $orderTimeIso);
            $order->end_time = Carbon::parse($orderTimeIso)->format('Y-m-d H:i:s');
        } elseif ($request->input('status') === 'completed') {
            $order->end_time = Carbon::now()->format('Y-m-d H:i:s');
        }

        $order->save();

        // Update item-level statuses
        $items = json_decode($request->input('items'), true);

        foreach ($items as $item) {
            $orderItem = OrderItem::where('id', $item['id'])
                ->where('order_id', $orderId)
                ->first();

            if ($orderItem) {
                $orderItem->status = $item['status'];
                $orderItem->save();
            }
        }

        Log::info('Order updated successfully:', [
            'orderId' => $orderId,
            'status' => $order->status,
            'order_time' => $order->order_time,
            'end_time' => $order->end_time,
        ]);

        return redirect()->back()->with('success', 'Order and item statuses updated successfully.');
    }

    public function updateItemStatus(Request $request, $orderId, $itemId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,completed',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed for item status.');
        }

        $orderItem = OrderItem::where('id', $itemId)
            ->where('order_id', $orderId)
            ->firstOrFail();

        $orderItem->status = $request->input('status');
        $orderItem->save();

        return redirect()->back()->with('success', 'Item status updated successfully.');
    }


    // CRUD actions
    public function indexPage(Request $request)
    {
        $limit = $request->query('limit') ?? 10;

        $users = User::role('kitchen', 'web')
            ->with('memberType')
            ->latest()
            ->paginate($limit);

        $userDetail = User::role('kitchen', 'web')
            ->with('userDetail')
            ->latest()
            ->paginate($limit);

        return Inertia::render('App/Kitchen/Main', [
            'users' => $users,
            'userDetail' => $userDetail,
        ]);
    }



    public function create(Request $request)
    {
        $limit = $request->query('limit') ?? 10;

        $users = User::with(['memberType', 'userDetail'])->latest()->paginate($limit);

        $memberTypes = MemberType::all(['id', 'name']);

        return Inertia::render('App/Kitchen/AddCustomer', [
            'users' => $users,
            'memberTypes' => $memberTypes,
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Parse addresses
            $addresses = $request->input('addresses');
            if (is_string($addresses)) {
                $addresses = json_decode($addresses, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid JSON format for addresses.');
                }
            }
            $request->merge(['addresses' => $addresses ?? []]);

            // Validate request data
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email',
                'phone' => 'required|string|max:20',
                'customer_type' => 'required|string|exists:member_types,name',
                'profile_pic' => 'nullable|image|max:4096',
                'addresses' => 'nullable|array',
                'addresses.*.type' => 'required|string|in:House,Apartment,Office',
                'addresses.*.address' => 'required|string|max:255',
                'addresses.*.city' => 'required|string|max:255',
                'addresses.*.province' => 'required|string|max:255',
                'addresses.*.country' => 'required|string|max:255',
                'addresses.*.zipCode' => 'required|string|max:20',
                'addresses.*.isMain' => 'boolean',
            ]);

            $memberType = MemberType::where('name', $validated['customer_type'])->first();
            if (!$memberType) {
                return redirect()->back()->withErrors(['customer_type' => 'Selected customer type does not exist.']);
            }

            $customer = new User();
            $customer->name = $validated['name'];
            $customer->email = $validated['email'];
            $customer->phone_number = $validated['phone'];
            $customer->member_type_id = $memberType->id;
            $customer->password = Hash::make(Str::random(16));
            $customer->user_id = User::max('user_id') ? (string)(intval(User::max('user_id')) + 1) : '1';

            if ($request->hasFile('profile_pic')) {
                $path = $request->file('profile_pic')->store('profiles', 'public');
                $customer->profile_photo = Storage::url($path);
            }

            $customer->save();
            $customer->assignRole(Role::findByName('kitchen', 'web'));

            // Create addresses if provided
            if (!empty($validated['addresses'])) {
                foreach ($validated['addresses'] as $address) {
                    UserDetail::create([
                        'user_id' => $customer->id,
                        'address_type' => $address['type'],
                        'country' => $address['country'],
                        'state' => $address['province'],
                        'city' => $address['city'],
                        'zip' => $address['zipCode'],
                        'address' => $address['address'],
                        'status' => $address['isMain'] ? 'active' : 'inactive',
                    ]);
                }
            }

            return redirect()->back()->with(['success' => 'Customer added successfully!',]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log::error('Validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors());
        } catch (\Exception $e) {
            // Log::error('Failed to store customer: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to add customer: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $customer = User::findOrFail($id);

            // Parse addresses if sent as JSON string
            $addresses = $request->input('addresses');
            if (is_string($addresses)) {
                $addresses = json_decode($addresses, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception('Invalid JSON format for addresses.');
                }
            }
            $request->merge(['addresses' => $addresses ?? []]);

            Log::info('Raw update request data: ' . json_encode($request->all()));
            Log::info('Merged update addresses: ' . json_encode($addresses));

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $customer->id,
                'phone' => 'required|string|max:20',
                'customer_type' => 'required|string|exists:member_types,name',
                'member_type_id' => 'required|exists:member_types,id',
                'profile_pic' => 'nullable|image|max:4096',
                'addresses' => 'nullable|array',
                'addresses.*.type' => 'required|string|in:House,Apartment,Office',
                'addresses.*.address' => 'required|string|max:255',
                'addresses.*.city' => 'required|string|max:255',
                'addresses.*.province' => 'required|string|max:255',
                'addresses.*.country' => 'required|string|max:255',
                'addresses.*.zipCode' => 'required|string|max:20',
                'addresses.*.isMain' => 'boolean',
            ]);

            Log::info('Validated update data: ' . json_encode($validated));

            $memberType = MemberType::where('name', $validated['customer_type'])->first();
            if (!$memberType) {
                return redirect()->back()->withErrors(['customer_type' => 'Selected customer type does not exist.']);
            }

            $customer->name = $validated['name'];
            $customer->email = $validated['email'];
            $customer->phone_number = $validated['phone'];
            $customer->member_type_id = $memberType->id;

            if ($request->hasFile('profile_pic')) {
                if ($customer->profile_photo) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $customer->profile_photo));
                }
                $path = $request->file('profile_pic')->store('profiles', 'public');
                $customer->profile_photo = Storage::url($path);
            }

            $customer->save();

            // Update addresses: Delete existing and recreate
            $customer->userDetails()->delete();
            if (!empty($validated['addresses'])) {
                foreach ($validated['addresses'] as $address) {
                    UserDetail::create([
                        'user_id' => $customer->user_id,
                        'address_type' => $address['type'],
                        'country' => $address['country'],
                        'state' => $address['province'],
                        'city' => $address['city'],
                        'zip' => $address['zipCode'],
                        'address' => $address['address'],
                        'status' => $address['isMain'] ? 'active' : 'inactive',
                    ]);
                }
            }

            return redirect()->back()->with([
                'success' => 'Customer updated successfully!',
                'customer' => $customer->load('userDetails')->only([
                    'id',
                    'user_id',
                    'name',
                    'email',
                    'phone_number',
                    'member_type_id',
                    'profile_photo',
                ]),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log::error('Validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors());
        } catch (\Illuminate\Database\QueryException $e) {
            // Log::error('Database error: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Database error: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            // Log::error('Failed to update customer: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to update customer: ' . $e->getMessage()]);
        }
    }

    public function edit(string $id)
    {
        $customer = User::with(['memberType', 'userDetails'])->findOrFail($id);
        $memberTypes = MemberType::all(['id', 'name']);

        return Inertia::render('App/Kitchen/AddCustomer', [
            'customer' => $customer,
            'memberTypes' => $memberTypes,
        ]);
    }
}
