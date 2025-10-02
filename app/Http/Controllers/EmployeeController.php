<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeLog;
use App\Models\EmployeeType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function dashboard(Request $request)
    {
        // Get total employees (excluding deleted)
        $totalEmployees = Employee::whereNull('deleted_at')->count();

        // Attendance stats for today
        $currentDay = now()->format('Y-m-d');
        $attendanceStats = null;
        // $attendanceStats = Attendance::where('date', $currentDay)
        //     ->selectRaw("
        //     SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as total_absent,
        //     SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as total_present,
        //     SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late
        // ")
        //     ->first();

        // Employees with pagination
        $employees = Employee::with(['user', 'department', 'employeeType'])
            ->paginate(10);

        return Inertia::render('App/Admin/Employee/Dashboard1', [
            'stats' => [
                'total_employees' => $totalEmployees,
                // 'total_present' => $attendanceStats->total_present ?? 0,
                // 'total_absent' => $attendanceStats->total_absent ?? 0,
                // 'total_late' => $attendanceStats->total_late ?? 0,
                'total_present' => $attendanceStats->total_present ?? 0,
                'total_absent' => $attendanceStats->total_absent ?? 0,
                'total_late' => $attendanceStats->total_late ?? 0,
            ],
            'employees' => $employees,
        ]);
    }

    public function create()
    {
        $employeeTypes = EmployeeType::select('id', 'name')->get();

        return Inertia::render('App/Admin/Employee/Create', compact('employeeTypes'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'employee_id' => 'required',
            'email' => 'required|email',
            'designation' => 'required|string',
            'phone_no' => 'required',
            'gender' => 'required|in:male,female',
            'department_id' => 'required|exists:departments,id',
            'salary' => 'required|numeric',
            'joining_date' => 'required|date',
            'employment_type' => 'required|in:full_time,part_time,contract',
            'employee_type_id' => 'required|exists:employee_types,id',
        ]);

        try {
            DB::beginTransaction();

            if (Employee::where('employee_id', $request->employee_id)->exists()) {
                return response()->json(['success' => false, 'message' => 'Employee ID already exists'], 400);
            }

            // fetch employee type
            $employeeType = EmployeeType::find($request->employee_type_id);

            $user = null;

            // only create user if type slug is cashier
            if ($employeeType && $employeeType->slug === 'cashier') {
                if (User::where('email', $request->email)->exists()) {
                    return response()->json(['success' => false, 'message' => 'Employee already has an account'], 400);
                }

                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    // 'phone_number' => $request->phone_no,
                    'password' => bcrypt('1234'),
                ]);

                $user->assignRole('cashier');
            }

            Employee::create([
                'user_id' => $user?->id,  // null if not cashier
                'department_id' => $request->department_id,
                'employee_type_id' => $request->employee_type_id,
                'employee_id' => $request->employee_id,
                'name' => $request->name,
                'email' => $request->email,
                'designation' => $request->designation,
                'phone_no' => $request->phone_no,
                'gender' => $request->gender,
                'salary' => $request->salary,
                'joining_date' => $request->joining_date,
                'employment_type' => $request->employment_type,
            ]);

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Employee created successfully'], 201);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    public function employeeLog(Request $request)
    {
        $employeeId = Auth::user()->employee->id;
        $logs = EmployeeLog::where('employee_id', $employeeId)
            ->orderByDesc('logged_at')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'employee_id' => $log->employee_id,
                    'type' => $log->type,
                    // Format as string without timezone conversion
                    'logged_at' => $log->logged_at->format('Y-m-d H:i:s'),
                    'created_at' => $log->created_at,
                    'updated_at' => $log->updated_at,
                ];
            });

        return response()->json($logs);
    }
}
