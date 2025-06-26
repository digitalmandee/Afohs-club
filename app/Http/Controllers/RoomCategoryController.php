<?php

namespace App\Http\Controllers;

use App\Models\RoomCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomCategoryController extends Controller
{
    public function index()
    {
        $roomCategoriesData = RoomCategory::orderBy('created_at', 'desc')->get();
        return Inertia::render('App/Admin/Rooms/Categories/Index', compact('roomCategoriesData'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:room_categories,name',
            'status' => 'required|in:active,inactive',
        ]);

        $roomCategory = RoomCategory::create([
            'name' => $request->name,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Room Category created successfully.', 'data' => $roomCategory], 201);
    }

    public function update(Request $request, $id)
    {
        $roomCategory = RoomCategory::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:room_categories,name,' . $roomCategory->id,
            'status' => 'required|in:active,inactive',
        ]);

        $roomCategory->update([
            'name' => $request->name,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Room Category updated successfully.', 'data' => $roomCategory], 200);
    }

    public function destroy($id)
    {
        $roomCategory = RoomCategory::findOrFail($id);
        $roomCategory->delete();

        return response()->json(['message' => 'Room Category deleted successfully.']);
    }
}
