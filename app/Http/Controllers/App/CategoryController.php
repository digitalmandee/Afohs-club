<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::latest()->get();

        return Inertia::render('App/Inventory/Category', [
            'categoriesList' => $categories->map(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'image' => $category->image,
            ]),
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
            $validated['image'] = $request->file('image')->store('categories', 'public');
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
            $validated['image'] = $request->file('image')->store('categories', 'public');
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

    public function destroy(Category $category)
    {
        if ($category->image && Storage::disk('public')->exists($category->image)) {
            Storage::disk('public')->delete($category->image);
        }
        $category->delete();
        return redirect()->back()->with('success', 'Category deleted.');
    }
}