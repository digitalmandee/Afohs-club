<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    /**
     * Display a listing of users (Super Admin Panel - Web Guard)
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'employee']);

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q
                    ->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->paginate(10)->withQueryString();
        $roles = Role::all();
        $tenants = Tenant::select('id', 'name')->get();

        return Inertia::render('App/Admin/Settings/UserManagement', [
            'users' => $users,
            'roles' => $roles,
            'tenants' => $tenants,
            'filters' => $request->only(['search']),
            'can' => [
                'create' => Auth::guard('web')->user()->can('users.create'),
                'edit' => Auth::guard('web')->user()->can('users.edit'),
                'delete' => Auth::guard('web')->user()->can('users.delete'),
            ]
        ]);
    }

    /**
     * Create user for Super Admin Panel (Web Guard)
     */
    public function createSuperAdminUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,  // Model's 'hashed' cast handles hashing
        ]);

        // Assign role with web guard
        $user->assignRole($request->role);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Super Admin user created successfully!');
    }

    /**
     * Create user from Employee (for POS/Tenant system)
     */
    public function createEmployeeUser(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            'password' => 'required|min:6',
            'tenant_ids' => 'required|array|min:1',
            'tenant_ids.*' => 'exists:tenants,id',
        ]);

        $employee = Employee::where('employee_id', $request->employee_id)->first();

        // Check if employee already has a user
        if ($employee->user_id) {
            return back()->with('error', 'Employee already has a user account!');
        }

        $user = User::create([
            'name' => $employee->name,
            'email' => $employee->email,
            'password' => Hash::make($request->password),
        ]);

        // Update employee with user_id
        $employee->update(['user_id' => $user->id]);

        // Assign default role for POS system (you can customize this)
        $user->assignRole('cashier');  // or whatever role you want for POS users

        // Sync allowed tenants (restaurants) for order punching
        $user->allowedTenants()->sync($request->tenant_ids);

        return redirect()
            ->back()
            ->with('success', 'Employee user account created successfully!');
    }

    /**
     * Assign role to user
     */
    public function assignRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_name' => 'required|exists:roles,name',
        ]);

        $user = User::findOrFail($request->user_id);
        $user->assignRole($request->role_name);

        return response()->json([
            'message' => 'Role assigned successfully!',
            'user' => $user->load('roles'),
        ]);
    }

    /**
     * Remove role from user
     */
    public function removeRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_name' => 'required|exists:roles,name',
        ]);

        $user = User::findOrFail($request->user_id);
        $user->removeRole($request->role_name);

        return response()->json([
            'message' => 'Role removed successfully!',
            'user' => $user->load('roles'),
        ]);
    }
}
