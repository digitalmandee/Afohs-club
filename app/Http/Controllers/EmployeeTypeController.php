<?php

namespace App\Http\Controllers;

use App\Models\EmployeeType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EmployeeTypeController extends Controller
{
    public function index(Request $request)
    {
        $employeeTypes = EmployeeType::select('id', 'name', 'slug')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Admin/Employee/Type/Index', [
            'employeeTypes' => $employeeTypes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:employee_types,name',
        ]);

        try {
            $employeeType = EmployeeType::create([
                'name' => $request->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Employee Type created successfully',
                'employeeType' => $employeeType
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|unique:employee_types,name,' . $id,
        ]);

        try {
            $employeeType = EmployeeType::findOrFail($id);
            $employeeType->update([
                'name' => $request->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Employee Type updated successfully',
                'employeeType' => $employeeType
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $employeeType = EmployeeType::findOrFail($id);
            $employeeType->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee Type deleted successfully'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
}
