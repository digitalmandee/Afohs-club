<?php

namespace App\Http\Controllers;

use App\Models\PosManufacturer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PosManufacturerController extends Controller
{
    public function index(Request $request)
    {
        $manufacturers = PosManufacturer::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Inventory/Manufacturers/Index', [
            'manufacturers' => $manufacturers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:pos_manufacturers,name|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        PosManufacturer::create($request->merge(['created_by' => Auth::id(), 'tenant_id' => tenant()->id])->all());

        return redirect()->back()->with('success', 'Manufacturer created successfully.');
    }

    public function update(Request $request, $id)
    {
        $manufacturer = PosManufacturer::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:50|unique:pos_manufacturers,name,' . $manufacturer->id,
            'status' => 'required|in:active,inactive',
        ]);

        $manufacturer->update($request->merge(['updated_by' => Auth::id(), 'tenant_id' => tenant()->id])->all());

        return redirect()->back()->with('success', 'Manufacturer updated successfully.');
    }

    public function destroy($id)
    {
        $manufacturer = PosManufacturer::findOrFail($id);
        $manufacturer->update(['deleted_by' => Auth::id()]);
        $manufacturer->delete();

        return redirect()->back()->with('success', 'Manufacturer deleted successfully.');
    }

    public function trashed(Request $request)
    {
        $trashedManufacturers = PosManufacturer::onlyTrashed()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Inventory/Manufacturers/Trashed', [
            'trashedManufacturers' => $trashedManufacturers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function restore($id)
    {
        $manufacturer = PosManufacturer::withTrashed()->findOrFail($id);
        $manufacturer->restore();

        return redirect()->back()->with('success', 'Manufacturer restored successfully.');
    }

    public function forceDelete($id)
    {
        $manufacturer = PosManufacturer::withTrashed()->findOrFail($id);
        $manufacturer->forceDelete();

        return redirect()->back()->with('success', 'Manufacturer permanently deleted.');
    }

    public function getManufacturers()
    {
        $manufacturers = PosManufacturer::select('id', 'name')
            ->get();

        return response()->json(['manufacturers' => $manufacturers]);
    }
}
