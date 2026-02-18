<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\PosSubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PosSubCategoryController extends Controller
{
    public function index(Request $request)
    {
        $restaurantId = session('active_restaurant_id') ?? tenant('id');

        $subCategories = PosSubCategory::with('category')
            ->when($restaurantId, fn($q) => $q->where('tenant_id', $restaurantId))
            ->when($request->search, function ($query, $search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Category::when($restaurantId, fn($q) => $q->where('tenant_id', $restaurantId))
            ->select('id', 'name')
            ->get();

        return Inertia::render('App/Inventory/SubCategories/Index', [
            'subCategories' => $subCategories,
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:pos_categories,id',
            'name' => 'required|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        PosSubCategory::create($request->merge(['created_by' => Auth::id(), 'tenant_id' => tenant()->id])->all());

        return redirect()->back()->with('success', 'Sub Category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $restaurantId = session('active_restaurant_id') ?? tenant('id');
        $subCategory = PosSubCategory::when($restaurantId, fn($q) => $q->where('tenant_id', $restaurantId))
            ->findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:pos_categories,id',
            'name' => 'required|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        $subCategory->update($request->merge(['updated_by' => Auth::id(), 'tenant_id' => tenant()->id])->all());

        return redirect()->back()->with('success', 'Sub Category updated successfully.');
    }

    public function destroy($id)
    {
        $restaurantId = session('active_restaurant_id') ?? tenant('id');
        $subCategory = PosSubCategory::when($restaurantId, fn($q) => $q->where('tenant_id', $restaurantId))
            ->findOrFail($id);
        $subCategory->update(['deleted_by' => Auth::id()]);
        $subCategory->delete();

        return redirect()->back()->with('success', 'Sub Category deleted successfully.');
    }

    public function trashed(Request $request)
    {
        $trashedSubCategories = PosSubCategory::onlyTrashed()
            ->with('category')
            ->when(session('active_restaurant_id') ?? tenant('id'), fn($q, $restaurantId) => $q->where('tenant_id', $restaurantId))
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Inventory/SubCategories/Trashed', [
            'trashedSubCategories' => $trashedSubCategories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function restore($id)
    {
        $restaurantId = session('active_restaurant_id') ?? tenant('id');
        $subCategory = PosSubCategory::withTrashed()
            ->when($restaurantId, fn($q) => $q->where('tenant_id', $restaurantId))
            ->findOrFail($id);
        $subCategory->restore();

        return redirect()->back()->with('success', 'Sub Category restored successfully.');
    }

    public function forceDelete($id)
    {
        $restaurantId = session('active_restaurant_id') ?? tenant('id');
        $subCategory = PosSubCategory::withTrashed()
            ->when($restaurantId, fn($q) => $q->where('tenant_id', $restaurantId))
            ->findOrFail($id);
        $subCategory->forceDelete();

        return redirect()->back()->with('success', 'Sub Category permanently deleted.');
    }

    public function getByCategory($categoryId)
    {
        $subCategories = PosSubCategory::where('category_id', $categoryId)
            ->when(session('active_restaurant_id') ?? tenant('id'), fn($q, $restaurantId) => $q->where('tenant_id', $restaurantId))
            ->select('id', 'name')
            ->get();

        return response()->json(['subCategories' => $subCategories]);
    }
}
