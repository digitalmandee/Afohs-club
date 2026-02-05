<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\PosUnit;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CakeTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Ensure 'Cakes' category exists, or find it
        $category = Category::firstOrCreate(['name' => 'Cakes'], ['status' => 'active']);

        $query = Product::where('category_id', $category->id);

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $cakeTypes = $query->latest()->paginate(10);

        return Inertia::render('App/CakeType/Index', [
            'cakeTypes' => $cakeTypes,
            'filters' => $request->all(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Flexible: Fetch units if needed, or just hardcode as per screenshot which has a select
        // Assuming Unit model or hardcoded list
        // Let's assume Unit model is 'Unit'
        $units = PosUnit::where('status', 'active')->get();

        return Inertia::render('App/CakeType/Create', [
            'units' => $units
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'unit_id' => 'required|exists:pos_units,id',
            'status' => 'required|in:active,inactive',
        ]);

        $category = Category::firstOrCreate(['name' => 'Cakes'], ['status' => 'active']);

        Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'unit_id' => $request->unit_id,
            'category_id' => $category->id,
            'status' => $request->status,
            'manage_stock' => false,  // Default for cakes usually? Or let user decide? Screenshot didn't show stock.
            'is_taxable' => true,  // Default
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('cake-types.index')->with('success', 'Cake Type created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $cakeType = Product::findOrFail($id);
        $units = PosUnit::where('status', 'active')->get();

        return Inertia::render('App/CakeType/Create', [
            'cakeType' => $cakeType,
            'isEdit' => true,
            'units' => $units
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'unit_id' => 'required|exists:pos_units,id',
            'status' => 'required|in:active,inactive',
        ]);

        $cakeType = Product::findOrFail($id);

        $cakeType->update([
            'name' => $request->name,
            'price' => $request->price,
            'unit_id' => $request->unit_id,
            'status' => $request->status,
        ]);

        return redirect()->route('cake-types.index')->with('success', 'Cake Type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $cakeType = Product::findOrFail($id);
        $cakeType->delete();

        return redirect()->back()->with('success', 'Cake Type deleted successfully.');
    }
}
