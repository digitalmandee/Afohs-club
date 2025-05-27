<?php

namespace App\Http\Controllers\App;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CategoryController extends Controller
{


    public function index(Request $request)
    {
        $category_id = $request->query('category_id');

        $query = Product::latest()->with(['category', 'variants', 'variants.values']);

        if ($category_id) {
            $query->where('category_id', $category_id);
        }

        // $productLists = $query->get();

        $categoriesList = Category::select('id', 'name')->get(); // ← Make sure this line is present

        return Inertia::render('App/Inventory/Category', [
            // 'productLists' => $productLists,
            'categoriesList' => $categoriesList, // ← Make sure this key matches the React destructuring
        ]);
    }


    public function getCategories()
    {
        $categories = Category::latest()->get();

        return response()->json(['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = FileHelper::saveImage($request->file('image'), 'categories');
            $validated['image'] = $path;
        }

        Category::create($validated);

        return redirect()->back()->with('success', 'Category created.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => "required|string|max:255|unique:categories,name,{$category->id}",
            'image' => 'nullable|image |mimes:jpeg,png,jpg,gif,svg|max:2048',
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

        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated.');
    }


    public function destroy(Request $request, Category $category)
    {
        $newCategoryId = $request->input('new_category_id');

        // Reassign products if a new category is selected
        if ($newCategoryId) {
            Product::where('category_id', $category->id)
                ->update(['category_id' => $newCategoryId]);
        } else {
            Product::where('category_id', $category->id)
                ->update(['category_id' => null]);
        }

        if ($category->image && Storage::disk('public')->exists($category->image)) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted.');
    }
}