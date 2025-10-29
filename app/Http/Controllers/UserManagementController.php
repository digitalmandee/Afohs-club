<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

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
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->paginate(10)->withQueryString();
        $roles = Role::all();

        return Inertia::render('App/Admin/Settings/UserManagement', [
            'users' => $users,
            'roles' => $roles,
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
            'password' => Hash::make($request->password),
        ]);

        // Assign role with web guard
        $user->assignRole($request->role);

        return redirect()->route('admin.users.index')
            ->with('success', 'Super Admin user created successfully!');
    }

    /**
     * Create user from Employee (for POS/Tenant system)
     */
    public function createEmployeeUser(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'password' => 'required|string|min:8',
        ]);

        $employee = Employee::findOrFail($request->employee_id);

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
        $user->assignRole('staff'); // or whatever role you want for POS users

        return redirect()->back()
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
