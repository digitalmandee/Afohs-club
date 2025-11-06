<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LeaveApplication;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    //
    public function index(Request $request)
    {
        $limit = $request->query('limit') ?? 10;
        $date = $request->query('date', now()->format('Y-m-d'));
        $search = $request->query('search', '');

        // Load Employee with User and apply search filter
        $attendanceQuery = Attendance::with([
            'employee:id,employee_id,name,designation',
            'leaveCategory:id,name',
        ])
            ->where('date', $date);

        // Apply search filter if provided
        if (!empty($search)) {
            $attendanceQuery->whereHas('employee', function($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                      ->orWhere('employee_id', 'like', '%' . $search . '%');
            });
        }

        $attendance = $attendanceQuery->paginate($limit);

        return response()->json(['success' => true, 'attendance' => $attendance], 200);
    }

    public function dashboard(Request $request)
    {
        // Get total employees (excluding deleted)
        $totalEmployees = Employee::whereNull('deleted_at')->count();

        // Attendance stats for today
        $currentDay = now()->format('Y-m-d');
        $attendanceStats = Attendance::where('date', $currentDay)
            ->selectRaw("
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as total_absent,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as total_present,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late
            ")
            ->first();

        $limit = $request->query('limit') ?? 10;
        $search = $request->query('search', '');
        $departmentFilters = $request->query('department_ids', []);
        $employeeTypeFilters = $request->query('employee_type_ids', []);
        
        // Employees with pagination - include deleted departments and employee types
        $employeesQuery = Employee::with([
                'department' => function($query) {
                    $query->withTrashed(); // Include soft deleted departments
                }, 
                'employeeType' => function($query) {
                    $query->withTrashed(); // Include soft deleted employee types
                }
            ]);

        // Apply search filter if provided
        if (!empty($search)) {
            $employeesQuery->where(function($query) use ($search) {
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

        return Inertia::render('App/Admin/Employee/Attendance/Dashboard', [
            'stats' => [
                'total_employees' => $totalEmployees,
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

    public function attendanceReport(Request $request)
    {
        $limit = (int) $request->query('limit', 10);
        $month = $request->query('month', now()->format('Y-m'));

        // Define start and end date for efficient filtering
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));  // Last date of the month

        // Get employees with user details
        $employees = Employee::with(['department:id,name'])
            ->select('employees.id', 'employees.employee_id', 'employees.name as employee_name')
            ->paginate($limit);

        // Fetch all employee IDs for attendance and leave lookup
        $employeeIds = $employees->pluck('id')->toArray();

        // Get attendances in a single optimized query
        $attendances = Attendance::whereIn('employee_id', $employeeIds)
            ->whereBetween('date', [$startDate, $endDate])
            ->with('leaveCategory:id,name')
            ->select('employee_id', 'leave_category_id', 'date', 'status')
            ->get()
            ->groupBy('employee_id');  // Grouped by employee ID for quick lookup

        // Get approved leave applications for employees in the selected month
        $leaves = LeaveApplication::whereIn('employee_id', $employeeIds)
            ->where('status', 'approved')  // Only approved leaves
            ->where(function ($query) use ($startDate, $endDate) {
                $query
                    ->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<', $startDate)->where('end_date', '>', $endDate);
                    });
            })
            ->with('leaveCategory:id,name')
            ->select('employee_id', 'start_date', 'end_date', 'leave_category_id')
            ->get();

        // Organize leaves by employee ID for quick lookup
        $leaveData = [];
        foreach ($leaves as $leave) {
            $leaveCategory = optional($leave->leaveCategory)->name;
            $start = max($leave->start_date, $startDate);
            $end = min($leave->end_date, $endDate);

            $current = strtotime($start);
            while ($current <= strtotime($end)) {
                $date = date('Y-m-d', $current);
                $dayOfWeek = date('w', $current);  // 0 = Sunday

                if ($dayOfWeek != 0) {  // Exclude Sundays
                    $leaveData[$leave->employee_id][$date] = [
                        'date' => $date,
                        'status' => 'leave',
                        'leave_category' => $leaveCategory
                    ];
                }

                $current = strtotime('+1 day', $current);
            }
        }

        // Get all dates in the selected month
        $allDates = [];
        $current = strtotime($startDate);
        $end = strtotime($endDate);

        while ($current <= $end) {
            $allDates[date('Y-m-d', $current)] = null;
            $current = strtotime('+1 day', $current);
        }

        // Format data ensuring all dates exist
        $reportData = $employees->map(function ($employee) use ($attendances, $leaveData, $allDates) {
            $employeeAttendances = $attendances[$employee->id] ?? collect();

            // Convert attendance data to date-keyed array
            $attendanceMap = $employeeAttendances->mapWithKeys(function ($record) {
                return [
                    $record->date => [
                        'date' => $record->date,
                        'status' => $record->status,
                        'leave_category' => optional($record->leaveCategory)->name
                    ]
                ];
            })->toArray();

            // Fill attendance for all dates
            $filledAttendance = [];
            foreach ($allDates as $date => $value) {
                if (isset($attendanceMap[$date])) {
                    // Use attendance data if exists
                    $filledAttendance[$date] = $attendanceMap[$date];
                } elseif (isset($leaveData[$employee->id][$date])) {
                    // Use leave data if attendance does not exist
                    $filledAttendance[$date] = $leaveData[$employee->id][$date];
                } else {
                    // Default to null status
                    $filledAttendance[$date] = ['date' => $date, 'status' => null, 'leave_category' => null];
                }
            }

            return [
                'employee_id' => $employee->employee_id,
                'name' => $employee->employee_name,
                'attendances' => array_values($filledAttendance)  // Ensure array format for JSON
            ];
        });

        return response()->json([
            'success' => true,
            'report_data' => [
                'employees' => $reportData,
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
            ]
        ]);
    }

    public function updateAttendance(Request $request, $attendanceId)
    {
        // Validate
        $request->validate([
            'leave_category_id' => 'nullable|integer|exists:leave_categories,id',
            'check_in' => 'nullable|date_format:H:i:s|before:check_out',
            'check_out' => 'nullable|date_format:H:i:s|after:check_in',
            'status' => [
                'required',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->leave_category_id && $value !== 'leave') {
                        $fail("Status must be 'leave' when a leave category is selected.");
                    }
                },
            ],
        ]);

        // Find attendance or fail
        $attendance = Attendance::findOrFail($attendanceId);

        // Update attendance fields
        $attendance->fill([
            'leave_category_id' => $request->leave_category_id,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'status' => $request->status,
        ])->save();

        // Return success response
        return response()->json(['success' => true, 'message' => 'Attendance updated successfully'], 200);
    }

    public function allEmployeesReport(Request $request)
    {
        // Get the start and end dates of the current month by default
        $month = $request->query('month', now()->format('Y-m'));  // Default to current month
        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = Carbon::parse($month . '-01')->endOfMonth();

        // Fetch attendance records for all employees in the branch for the selected month
        $attendance = Attendance::whereBetween('date', [$startDate, $endDate])->get();

        // Group attendance by employee
        $groupedAttendance = $attendance->groupBy('employee_id');

        // Prepare the summary report for each employee
        $report = [];

        foreach ($groupedAttendance as $employeeId => $records) {
            $employee = Employee::find($employeeId);

            if ($employee) {
                $report[] = [
                    'employee_id' => $employee->employee_id,
                    'name' => $employee->user->name,
                    'designation' => $employee->user->designation,
                    'profile_image' => $employee->user->profile_image,
                    'total_present' => $records->where('status', 'present')->count(),
                    'total_leave' => $records->where('status', 'leave')->count(),
                    'total_late' => $records->where('status', 'late')->count(),
                    'total_absent' => $records->where('status', 'absent')->count(),
                ];
            }
        }

        return response()->json(['success' => true, 'report' => $report]);
    }

    public function profileReport(Request $request, $employeeId)
    {
        // Get the start and end dates of the current month by default
        $month = $request->query('month', now()->format('Y-m'));  // Default to current month
        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = Carbon::parse($month . '-01')->endOfMonth();

        // Fetch attendance records for all employees in the branch for the selected month
        $attendance = Attendance::where('employee_id', $employeeId)->whereBetween('date', [$startDate, $endDate])->get();

        return response()->json(['success' => true, 'report' => $attendance]);
    }

    /**
     * Display the attendance management page.
     *
     * @return \Inertia\Response
     */
    public function managementPage()
    {
        return Inertia::render('App/Admin/Employee/Attendance/ManageAttendance');
    }

    /**
     * Display the attendance report page.
     *
     * @return \Inertia\Response
     */
    public function reportPage()
    {
        return Inertia::render('App/Admin/Employee/Attendance/AttendanceReport');
    }

    /**
     * Display the monthly attendance report page.
     *
     * @return \Inertia\Response
     */
    public function monthlyReportPage()
    {
        return Inertia::render('App/Admin/Employee/Attendance/MonthlyReport');
    }
}