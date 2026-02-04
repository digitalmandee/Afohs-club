<?php

namespace App\Http\Controllers;

use App\Models\PosUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PosUnitController extends Controller
{
    public function index(Request $request)
    {
        $units = PosUnit::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Inventory/Units/Index', [
            'units' => $units,
            'filters' => $request->only(['search']),
        ]);
    }

    public function getUnits()
    {
        $units = PosUnit::where('tenant_id', tenant()->id)->where('status', 'active')->select('id', 'name')->get();
        return response()->json(['units' => $units]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:pos_units,name|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        PosUnit::create($request->merge(['created_by' => Auth::id(), 'tenant_id' => tenant()->id])->all());

        return redirect()->back()->with('success', 'Unit created successfully.');
    }

    public function update(Request $request, $id)
    {
        $unit = PosUnit::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:50|unique:pos_units,name,' . $unit->id,
            'status' => 'required|in:active,inactive',
        ]);

        $unit->update($request->merge(['updated_by' => Auth::id(), 'tenant_id' => tenant()->id])->all());

        return redirect()->back()->with('success', 'Unit updated successfully.');
    }

    public function destroy($id)
    {
        $unit = PosUnit::findOrFail($id);
        $unit->update(['deleted_by' => Auth::id()]);
        $unit->delete();

        return redirect()->back()->with('success', 'Unit deleted successfully.');
    }

    public function trashed(Request $request)
    {
        $trashedUnits = PosUnit::onlyTrashed()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Inventory/Units/Trashed', [
            'trashedUnits' => $trashedUnits,
            'filters' => $request->only(['search']),
        ]);
    }

    public function restore($id)
    {
        $unit = PosUnit::withTrashed()->findOrFail($id);
        $unit->restore();

        return redirect()->back()->with('success', 'Unit restored successfully.');
    }

    public function forceDelete($id)
    {
        $unit = PosUnit::withTrashed()->findOrFail($id);
        $unit->forceDelete();

        return redirect()->back()->with('success', 'Unit permanently deleted.');
    }
}
