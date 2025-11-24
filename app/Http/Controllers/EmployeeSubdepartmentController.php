<?php

namespace App\Http\Controllers;

use App\Models\Subdepartment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeSubdepartmentController extends Controller
{
    /**
     * Display a listing of subdepartments
     */
    public function index(Request $request)
    {
        $subdepartments = Subdepartment::with('department:id,name')
            ->select('id', 'name', 'department_id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Admin/Employee/Subdepartment/Index', [
            'subdepartments' => $subdepartments,
        ]);
    }

    /**
     * List all subdepartments with optional filtering
     */
    public function listAll(Request $request)
    {
        try {
            $type = $request->query('type', 'list');
            $query = $request->query('query');
            $departmentId = $request->query('department_id');

            if ($type == 'search') {
                $subdepartmentsQuery = Subdepartment::select('id', 'name', 'department_id');

                // Filter by department if provided
                if ($departmentId) {
                    $subdepartmentsQuery->where('department_id', $departmentId);
                }

                // Search by name if query provided
                if (!empty($query)) {
                    $subdepartmentsQuery->where('name', 'like', "%$query%");
                } else {
                    $subdepartmentsQuery->latest()->take(5);
                }

                $subdepartments = $subdepartmentsQuery->get();

                return response()->json(['success' => true, 'results' => $subdepartments], 200);
            } else {
                $limit = $request->query('limit') ?? 10;

                $subdepartmentsQuery = Subdepartment::with('department:id,name')
                    ->select('id', 'name', 'department_id');

                if ($departmentId) {
                    $subdepartmentsQuery->where('department_id', $departmentId);
                }

                $subdepartments = $subdepartmentsQuery->paginate($limit);
                return response()->json(['success' => true, 'message' => 'Subdepartments retrieved successfully', 'subdepartments' => $subdepartments], 200);
            }
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    /**
     * Store a newly created subdepartment
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'department_id' => 'required|exists:departments,id',
            ]);

            $subdepartment = Subdepartment::create($validated);

            return response()->json(['success' => true, 'message' => 'Subdepartment created successfully', 'subdepartment' => $subdepartment], 201);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    /**
     * Update the specified subdepartment
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'department_id' => 'required|exists:departments,id',
            ]);

            $subdepartment = Subdepartment::findOrFail($id);
            $subdepartment->update($validated);

            return response()->json(['success' => true, 'message' => 'Subdepartment updated successfully', 'subdepartment' => $subdepartment], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    /**
     * Remove the specified subdepartment
     */
    public function destroy($id)
    {
        try {
            $subdepartment = Subdepartment::find($id);
            $subdepartment->delete();

            return response()->json(['success' => true, 'message' => 'Subdepartment deleted successfully'], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }
}
