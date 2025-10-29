<?php

namespace App\Http\Controllers;

use App\Models\EventMenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventMenuCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('super.admin:events.menuCategory.view')->only('index');
        $this->middleware('super.admin:events.menuCategory.create')->only('create', 'store');
        $this->middleware('super.admin:events.menuCategory.edit')->only('edit', 'update');
        $this->middleware('permission:events.menuCategory.delete')->only('destroy');
    }
    public function index()
    {
        $eventMenuCategoriesData = EventMenuCategory::orderBy('created_at', 'desc')->get();

        return Inertia::render('App/Admin/Events/Category/Index', compact('eventMenuCategoriesData'));
    }

    // Store a new event menu category
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:event_menu_categories,name',
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $eventMenuCategory = EventMenuCategory::create([
            'name' => $request->name,
            'status' => $request->status, // ✅ store status
        ]);

        return response()->json([
            'message' => 'Event Menu Category created successfully.',
            'data' => $eventMenuCategory,
        ], 201);
    }

    // Update an existing event menu category
    public function update(Request $request, $id)
    {
        $eventMenuCategory = EventMenuCategory::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:event_menu_categories,name,' . $eventMenuCategory->id,
            'status' => 'required|in:active,inactive', // ✅ validate status
        ]);

        $eventMenuCategory->update([
            'name' => $request->name,
            'status' => $request->status, // ✅ update status
        ]);

        return response()->json([
            'message' => 'Event Menu Category updated successfully.',
            'data' => $eventMenuCategory,
        ], 200);
    }

    // Delete an event menu category
    public function destroy($id)
    {
        $eventMenuCategory = EventMenuCategory::findOrFail($id);
        $eventMenuCategory->delete();

        return response()->json(['message' => 'Event Menu Category deleted successfully.']);
    }
}