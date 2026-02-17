<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CategoryController extends Controller
{
    private function restaurantId(Request $request = null)
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

        return $request->session()->get('active_restaurant_id') ?? $request->route('tenant');
    }

    public function index(Request $request)
    {
        $restaurantId = $this->restaurantId($request);
        $user = Auth::guard('tenant')->user() ?? Auth::user();
        $allrestaurants = $user ? $user->getAccessibleTenants() : collect();

        $query = Category::query();
        if ($restaurantId) {
            $query->where('tenant_id', $restaurantId);
        }

        $categoriesList = $query
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->withCount('products')
            ->latest()
            ->paginate(10)  // Changed to pagination to match other modules
            ->withQueryString();

        return Inertia::render('App/Inventory/Categories/Index', [
            'categories' => $categoriesList,
            'filters' => $request->only(['search', 'restaurant_id']),
            'allrestaurants' => $allrestaurants->map(fn($t) => ['id' => $t->id, 'name' => $t->name])->values(),
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function getCategories(Request $request)
    {
        $restaurantId = $this->restaurantId($request);

        $query = Category::query();
        if ($restaurantId) {
            $query->where('tenant_id', $restaurantId);
        }

        $categories = $query->latest()->get();

        return response()->json(['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $restaurantId = $this->restaurantId($request);
        if (!$restaurantId) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:pos_categories,name',
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = FileHelper::saveImage($request->file('image'), 'categories');
            $validated['image'] = $path;
        }

        $validated['tenant_id'] = $restaurantId;
        $validated['location_id'] = $restaurantId;
        $validated['created_by'] = Auth::id();

        Category::create($validated);

        return redirect()->back()->with('success', 'Category created.');
    }

    public function update(Request $request, Category $category)
    {
        $restaurantId = $this->restaurantId($request);
        if ($restaurantId && $category->tenant_id !== $restaurantId) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => "required|string|max:255|unique:pos_categories,name,{$category->id}",
            'status' => 'required|in:active,inactive',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'existingImage' => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            if ($category->image && Storage::disk('public')->exists($category->image)) {
                Storage::disk('public')->delete($category->image);
            }
            $path = FileHelper::saveImage($request->file('image'), 'categories');
            $validated['image'] = $path;
        } elseif ($request->input('existingImage')) {
            $validated['image'] = $request->input('existingImage');
        } else {
            if ($category->image && Storage::disk('public')->exists($category->image)) {
                Storage::disk('public')->delete($category->image);
            }
            $validated['image'] = null;
        }

        $validated['updated_by'] = Auth::id();

        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated.');
    }

    public function destroy(Request $request, Category $category)
    {
        $restaurantId = $this->restaurantId($request);
        if ($restaurantId && $category->tenant_id !== $restaurantId) {
            abort(404);
        }

        $newCategoryId = $request->input('new_category_id');

        // Reassign products logic
        if ($newCategoryId) {
            $productQuery = Product::where('category_id', $category->id);
            if ($restaurantId) {
                $productQuery->where('tenant_id', $restaurantId);
            }

            $productQuery
                ->update(['category_id' => $newCategoryId]);
        } else {
            $productQuery = Product::where('category_id', $category->id);
            if ($restaurantId) {
                $productQuery->where('tenant_id', $restaurantId);
            }

            $productQuery
                ->update(['category_id' => null]);
        }

        $category->update(['deleted_by' => Auth::id()]);
        $category->delete();

        return redirect()->back()->with('success', 'Category deleted.');
    }

    public function trashed(Request $request)
    {
        $restaurantId = $this->restaurantId($request);
        $user = Auth::guard('tenant')->user() ?? Auth::user();
        $allrestaurants = $user ? $user->getAccessibleTenants() : collect();

        $query = Category::onlyTrashed();
        if ($restaurantId) {
            $query->where('tenant_id', $restaurantId);
        }

        $trashedCategories = $query
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('deleted_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('App/Inventory/Categories/Trashed', [
            'trashedCategories' => $trashedCategories,
            'filters' => $request->only(['search', 'restaurant_id']),
            'allrestaurants' => $allrestaurants->map(fn($t) => ['id' => $t->id, 'name' => $t->name])->values(),
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function restore($id)
    {
        $restaurantId = $this->restaurantId();

        $query = Category::withTrashed();
        if ($restaurantId) {
            $query->where('tenant_id', $restaurantId);
        }

        $category = $query->findOrFail($id);
        $category->restore();

        return redirect()->back()->with('success', 'Category restored successfully.');
    }

    public function forceDelete($id)
    {
        $restaurantId = $this->restaurantId();

        $query = Category::withTrashed();
        if ($restaurantId) {
            $query->where('tenant_id', $restaurantId);
        }

        $category = $query->findOrFail($id);

        if ($category->image && Storage::disk('public')->exists($category->image)) {
            Storage::disk('public')->delete($category->image);
        }

        $category->forceDelete();

        return redirect()->back()->with('success', 'Category permanently deleted.');
    }
}
