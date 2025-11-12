<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeLog;
use App\Models\EmployeeType;
use App\Models\EmployeeSalaryStructure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
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

        $limit = $request->query('limit') ?? 10;
        $search = $request->query('search', '');
        $departmentFilters = $request->query('department_ids', []);
        $employeeTypeFilters = $request->query('employee_type_ids', []);

        // Employees with pagination - include deleted departments and employee types
        $employeesQuery = Employee::with([
            'department' => function ($query) {
                $query->withTrashed(); // Include soft deleted departments
            },
            'employeeType' => function ($query) {
                $query->withTrashed(); // Include soft deleted employee types
            }
        ]);

        // Apply search filter if provided
        if (!empty($search)) {
            $employeesQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('employee_id', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('designation', 'like', '%' . $search . '%');
            });
        }

        // Apply department filters if provided
        if (!empty($departmentFilters) && is_array($departmentFilters)) {
            $employeesQuery->whereIn('department_id', $departmentFilters);
        }

        // Apply employee type filters if provided
        if (!empty($employeeTypeFilters) && is_array($employeeTypeFilters)) {
            $employeesQuery->whereIn('employee_type_id', $employeeTypeFilters);
        }

        $employees = $employeesQuery->paginate($limit)->withQueryString();

        // Get filter options
        $departments = \App\Models\Department::select('id', 'name')->get();
        $employeeTypes = \App\Models\EmployeeType::select('id', 'name')->get();

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
            'departments' => $departments,
            'employeeTypes' => $employeeTypes,
            'filters' => [
                'search' => $search,
                'department_ids' => $departmentFilters,
                'employee_type_ids' => $employeeTypeFilters,
            ],
        ]);
    }

    public function create()
    {
        $employeeTypes = EmployeeType::select('id', 'name')->get();

        return Inertia::render('App/Admin/Employee/Create', compact('employeeTypes'));
    }

    public function edit($employeeId)
    {
        $employee = Employee::with(['department', 'employeeType'])
            ->where('id', $employeeId)
            ->first();

        if (!$employee) {
            return abort(404, 'Employee not found');
        }

        $employeeTypes = EmployeeType::select('id', 'name')->get();

        return Inertia::render('App/Admin/Employee/Create', [
            'employeeTypes' => $employeeTypes,
            'employee' => $employee,
            'isEdit' => true
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'employee_id' => 'required|unique:employees,employee_id',
            'email' => 'required|email|unique:employees,email',
            'designation' => 'nullable|string',
            'phone_no' => 'required',
            'gender' => 'required|in:male,female',
            'marital_status' => 'nullable|in:single,married,divorced,widowed',
            'national_id' => 'nullable|string',
            'account_no' => 'nullable|string',
            'address' => 'nullable|string',
            'emergency_no' => 'nullable|string',
            'department_id' => 'required|exists:departments,id',
            'salary' => 'nullable|numeric',
            'joining_date' => 'nullable|date',
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

            $employee = Employee::create([
                'user_id' => $user?->id,  // null if not cashier
                'department_id' => $request->department_id,
                'employee_type_id' => $request->employee_type_id,
                'employee_id' => $request->employee_id,
                'name' => $request->name,
                'email' => $request->email,
                'designation' => $request->designation,
                'phone_no' => $request->phone_no,
                'gender' => $request->gender,
                'marital_status' => $request->marital_status,
                'national_id' => $request->national_id,
                'account_no' => $request->account_no,
                'address' => $request->address,
                'emergency_no' => $request->emergency_no,
                'salary' => $request->salary,
                'joining_date' => $request->joining_date,
                'employment_type' => $request->employment_type,
                'created_by' => Auth::id(),
            ]);

            // Auto-create salary structure if salary is provided
            if ($request->filled('salary') && $request->salary > 0) {
                $this->createOrUpdateSalaryStructure($employee, $request->salary);
            }

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

    public function details($employeeId)
    {
        $employee = Employee::where('employee_id', $employeeId)->with(['user:id,name,email', 'department:id,name'])->first();
        if (!$employee)
            return abort(404);

        return Inertia::render('App/Admin/Employee/Detail', compact('employee'));
    }

    public function update(Request $request, $employeeId)
    {
        $request->validate([
            'name' => 'required|string',
            'employee_id' => 'required',
            'email' => 'required|email',
            'designation' => 'nullable|string',
            'phone_no' => 'required',
            'gender' => 'required|in:male,female',
            'marital_status' => 'required|in:single,married,divorced,widowed',
            'national_id' => 'nullable|string',
            'account_no' => 'nullable|string',
            'address' => 'nullable|string',
            'emergency_no' => 'nullable|string',
            'salary' => 'nullable|numeric',
            'joining_date' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            $employee = Employee::where('employee_id', $employeeId)->first();
            if (!$employee) {
                return response()->json(['success' => false, 'message' => 'Employee not found'], 404);
            }

            // Check if employee_id is being changed and if it already exists
            if ($request->employee_id !== $employee->employee_id) {
                if (Employee::where('employee_id', $request->employee_id)->exists()) {
                    return response()->json(['success' => false, 'message' => 'Employee ID already exists'], 400);
                }
            }

            // Store old salary before updating
            $oldSalary = $employee->salary;

            // Update employee data
            $employee->update($request->only([
                'name',
                'department_id',
                'employee_type_id',
                'employee_id',
                'email',
                'designation',
                'phone_no',
                'gender',
                'marital_status',
                'national_id',
                'account_no',
                'address',
                'emergency_no',
                'salary',
                'joining_date'
            ]));

            // Update associated user if exists
            if ($employee->user) {
                $employee->user->update([
                    'name' => $request->name,
                    'email' => $request->email,
                ]);
            }

            // Auto-create/update salary structure only if salary changed and > 0
            if ($request->filled('salary') && $request->salary > 0) {
                // Only update salary structure if salary actually changed
                if ($oldSalary != $request->salary) {
                    $this->createOrUpdateSalaryStructure($employee, $request->salary);
                }
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Employee updated successfully'], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }


    private function createOrUpdateSalaryStructure($employee, $newSalary)
    {
        // Get current active salary structure
        $currentStructure = EmployeeSalaryStructure::where('employee_id', $employee->id)
            ->where('is_active', true)
            ->first();

        if ($currentStructure) {
            // If active structure exists, check if salary actually changed
            if ($currentStructure->basic_salary != $newSalary) {
                // Only update the basic_salary, preserve allowances and deductions
                $currentStructure->update([
                    'basic_salary' => $newSalary,
                    'updated_by' => Auth::id(),
                ]);
            }
            // If salary is same, do nothing - preserve existing structure
        } else {
            // No active structure exists, check if admin intentionally deactivated it
            $hasInactiveStructure = EmployeeSalaryStructure::where('employee_id', $employee->id)
                ->where('is_active', false)
                ->exists();

            if (!$hasInactiveStructure) {
                // No salary structure exists at all, create new one (first time)
                EmployeeSalaryStructure::create([
                    'employee_id' => $employee->id,
                    'basic_salary' => $newSalary,
                    'is_active' => true,
                    'effective_from' => now(),
                    'created_by' => Auth::id(),
                ]);
            }
            // If inactive structure exists, respect admin's decision - don't auto-create
        }
    }
}
