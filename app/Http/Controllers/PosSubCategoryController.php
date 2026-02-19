<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\PosSubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PosSubCategoryController extends Controller
{
    private function activeTenantId(Request $request = null): int|string|null
    {
        $request = $request ?? request();
        return $request->session()->get('active_restaurant_id') ?? tenant('id');
    }

    private function selectedRestaurantId(Request $request = null): int|string|null
    {
        $request = $request ?? request();
        $requestedId = $request->query('restaurant_id');
        $user = Auth::guard('tenant')->user() ?? Auth::user();
        $tenants = $user ? $user->getAccessibleTenants() : collect();

        if ($requestedId !== null && $requestedId !== '') {
            if ($tenants->contains(fn($t) => (string) $t->id === (string) $requestedId)) {
                return $requestedId;
            }
        }

        return $this->activeTenantId($request);
    }

    public function index(Request $request)
    {
        $restaurantId = $this->selectedRestaurantId($request);
        $user = Auth::guard('tenant')->user() ?? Auth::user();
        $allrestaurants = $user ? $user->getAccessibleTenants() : collect();

        $subCategories = PosSubCategory::with('category')
            ->when($restaurantId, fn($q) => $q->where('location_id', $restaurantId))
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

        $categories = Category::when($restaurantId, fn($q) => $q->where('location_id', $restaurantId))
            ->select('id', 'name')
            ->get();

        return Inertia::render('App/Inventory/SubCategories/Index', [
            'subCategories' => $subCategories,
            'categories' => $categories,
            'filters' => $request->only(['search', 'restaurant_id']),
            'allrestaurants' => $allrestaurants->map(fn($t) => ['id' => $t->id, 'name' => $t->name])->values(),
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->activeTenantId($request);
        $locationId = $this->selectedRestaurantId($request);
        $request->validate([
            'category_id' => 'required|exists:pos_categories,id',
            'name' => 'required|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        PosSubCategory::create($request->merge([
            'created_by' => Auth::id(),
            'tenant_id' => $tenantId,
            'location_id' => $locationId,
        ])->all());

        return redirect()->back()->with('success', 'Sub Category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $restaurantId = $this->selectedRestaurantId($request);
        $subCategory = PosSubCategory::when($restaurantId, fn($q) => $q->where('location_id', $restaurantId))
            ->findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:pos_categories,id',
            'name' => 'required|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        $subCategory->update($request->merge([
            'updated_by' => Auth::id(),
        ])->all());

        return redirect()->back()->with('success', 'Sub Category updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $restaurantId = $this->selectedRestaurantId($request);
        $subCategory = PosSubCategory::when($restaurantId, fn($q) => $q->where('location_id', $restaurantId))
            ->findOrFail($id);
        $subCategory->update(['deleted_by' => Auth::id()]);
        $subCategory->delete();

        return redirect()->back()->with('success', 'Sub Category deleted successfully.');
    }

    public function trashed(Request $request)
    {
        $restaurantId = $this->selectedRestaurantId($request);
        $trashedSubCategories = PosSubCategory::onlyTrashed()
            ->with('category')
            ->when($restaurantId, fn($q, $rid) => $q->where('location_id', $rid))
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Inventory/SubCategories/Trashed', [
            'trashedSubCategories' => $trashedSubCategories,
            'filters' => $request->only(['search', 'restaurant_id']),
        ]);
    }

    public function restore(Request $request, $id)
    {
        $restaurantId = $this->selectedRestaurantId($request);
        $subCategory = PosSubCategory::withTrashed()
            ->when($restaurantId, fn($q) => $q->where('location_id', $restaurantId))
            ->findOrFail($id);
        $subCategory->restore();

        return redirect()->back()->with('success', 'Sub Category restored successfully.');
    }

    public function forceDelete(Request $request, $id)
    {
        $restaurantId = $this->selectedRestaurantId($request);
        $subCategory = PosSubCategory::withTrashed()
            ->when($restaurantId, fn($q) => $q->where('location_id', $restaurantId))
            ->findOrFail($id);
        $subCategory->forceDelete();

        return redirect()->back()->with('success', 'Sub Category permanently deleted.');
    }

    public function getByCategory(Request $request, $categoryId)
    {
        $restaurantId = $this->selectedRestaurantId($request);
        $subCategories = PosSubCategory::where('category_id', $categoryId)
            ->when($restaurantId, fn($q, $rid) => $q->where('location_id', $rid))
            ->select('id', 'name')
            ->get();

        return response()->json(['subCategories' => $subCategories]);
    }
}
