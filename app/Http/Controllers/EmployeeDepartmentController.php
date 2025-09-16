<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EmployeeDepartmentController extends Controller
{
    public function index(Request $request)
    {
        $departments = Department::select('id', 'name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Admin/Employee/Department/Index', [
            'departments' => $departments,
        ]);
    }

    public function listAll(Request $request)
    {
        try {
            $type = $request->query('type', 'list');
            $query = $request->query('query');

            if ($type == 'search') {
                if (empty($query)) {
                    $departments = Department::latest()->select('id', 'name')->take(5)->get();
                } else {
                    $departments = Department::where('name', 'like', "%$query%")->select('id', 'name')->get();
                }

                return response()->json(['success' => true, 'results' => $departments], 200);
            } else {
                $limit = $request->query('limit') ?? 10;

                $departments = Department::select('id', 'name')->paginate($limit);
                return response()->json(['success' => true, 'message' => 'Departments retrieved successfully', 'deparments' => $departments], 200);
            }
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        try {
            $department = Department::create([
                'name' => $request->name,
            ]);

            return response()->json(['success' => true, 'message' => 'Department created successfully', 'department' => $department], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        try {
            $department = Department::find($id);
            $department->update([
                'name' => $request->name,
            ]);

            return response()->json(['success' => true, 'message' => 'Department updated successfully', 'department' => $department], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $department = Department::find($id);
            $department->delete();

            return response()->json(['success' => true, 'message' => 'Department deleted successfully'], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }
}
