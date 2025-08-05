<?php

namespace App\Http\Controllers\App;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\AddressType;
use App\Models\Member;
use App\Models\MemberType;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class MembersController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->query('limit') ?? 10;

        $users = User::with(['memberType', 'userDetail'])->role('user', 'web')->latest()->paginate($limit);

        return Inertia::render('App/Member/Dashboard', compact('users'));
    }

    public function create(Request $request)
    {
        $limit = $request->query('limit') ?? 10;

        $users = User::with(['memberType', 'userDetail'])->latest()->paginate($limit);

        $memberTypes = MemberType::all(['id', 'name']);
        $addressTypes = AddressType::all(['id', 'name']);

        return Inertia::render('App/Member/AddCustomer', [
            'users' => $users,
            'memberTypes' => $memberTypes,
            'addressTypes' => $addressTypes,
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
                'profile_photo' => 'nullable|image|max:4096',
                'addresses' => 'nullable|array',
                'addresses.*.type' => 'required|string|exists:address_types,name',  // Validate against address_types table
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
            $customer->user_id = User::max('user_id') ? (string) (intval(User::max('user_id')) + 1) : '1';

            if ($request->hasFile('profile_photo')) {
                $path = FileHelper::saveImage($request->file('profile_photo'), 'profiles');
                $customer->profile_photo = $path;
            }

            $customer->save();
            $customer->assignRole(Role::findByName('user', 'web'));

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

            return redirect()->back()->with(['success' => 'Customer added successfully!']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors());
        } catch (\Exception $e) {
            Log::error('Failed to store customer: ' . $e->getMessage());
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

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $customer->id,
                'phone' => 'required|string',
                'customer_type' => 'required|string|exists:member_types,name',
                'member_type_id' => 'required|exists:member_types,id',
                'profile_pic' => 'nullable|image|max:4096',
                'addresses' => 'nullable|array',
                'addresses.*.address_type' => 'required|string|exists:address_types,name',  // Validate against address_types table
                'addresses.*.address' => 'required|string|max:255',
                'addresses.*.city' => 'required|string|max:255',
                'addresses.*.state' => 'required|string|max:255',
                'addresses.*.country' => 'required|string|max:255',
                'addresses.*.zip' => 'required|string|max:20',
                // 'addresses.*.status' => 'boolean',
            ]);

            $memberType = MemberType::where('name', $request->customer_type)->first();
            if (!$memberType) {
                return redirect()->back()->withErrors(['customer_type' => 'Selected customer type does not exist.']);
            }

            $customer->name = $request->name;
            $customer->email = $request->email;
            $customer->phone_number = $request->phone;
            $customer->member_type_id = $memberType->id;

            if ($request->hasFile('profile_pic')) {
                if ($customer->profile_photo) {
                    Storage::disk('public')->delete($customer->profile_photo);
                }
                $path = FileHelper::saveImage($request->file('profile_pic'), 'profiles');
                $customer->profile_photo = $path;
            }

            $customer->save();

            // Update addresses: Delete existing and recreate
            $customer->userDetails()->delete();
            if (!empty($request->addresses)) {
                foreach ($request->addresses as $address) {
                    UserDetail::create([
                        'user_id' => $customer->id,  // Fixed: Use $customer->id instead of user_id
                        'address_type' => $address['address_type'],
                        'country' => $address['country'],
                        'state' => $address['state'],
                        'city' => $address['city'],
                        'zip' => $address['zip'],
                        'address' => $address['address'],
                        'status' => $address['status'] ? 'active' : 'inactive',
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
                    'userDetails',
                ]),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return redirect()->back()->withErrors($e->errors());
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Database error: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Failed to update customer: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to update customer: ' . $e->getMessage()]);
        }
    }

    public function edit(string $id)
    {
        $customer = User::with(['memberType', 'userDetail'])->findOrFail($id);

        $memberTypes = MemberType::all(['id', 'name']);
        $addressTypes = AddressType::all(['id', 'name']);

        return Inertia::render('App/Member/EditCustomer', [
            'customer' => $customer,
            'memberTypes' => $memberTypes,
            'addressTypes' => $addressTypes,
        ]);
    }

    public function byUser($userId)
    {
        $member = Member::with([
            'memberCategory',
            'pausedHistories' => function ($q) {
                $q->orderBy('start_date');
            }
        ])->where('user_id', $userId)->firstOrFail();

        return response()->json($member);
    }
}