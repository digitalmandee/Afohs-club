<?php

namespace App\Http\Controllers;

use App\Models\EventMenu;
use App\Models\EventMenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventMenuController extends Controller
{
    public function __construct()
    {
        $this->middleware('super.admin:events.menu.view')->only('index');
        $this->middleware('super.admin:events.menu.create')->only('create', 'store');
        $this->middleware('super.admin:events.menu.edit')->only('edit', 'update');
        $this->middleware('permission:events.menu.delete')->only('destroy');
    }
    public function index()
    {
        $eventMenusData = EventMenu::orderBy('created_at', 'desc')->get();

        return Inertia::render('App/Admin/Events/Menu/Index', compact('eventMenusData'));
    }

    public function create()
    {
        $menuItems = EventMenuCategory::all();
        return Inertia::render('App/Admin/Events/Menu/CreateOrEdit', compact('menuItems'));
    }

    public function edit($id)
    {
        $menu = EventMenu::with('items')->findOrFail($id);
        $menuItems = EventMenuCategory::all();
        return Inertia::render('App/Admin/Events/Menu/CreateOrEdit', [
            'eventMenu' => $menu,
            'menuItems' => $menuItems
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'status' => 'required|in:active,inactive',
            'items' => 'array',
            'items.*.id' => 'required|exists:event_menu_categories,id',
        ]);

        $menu = EventMenu::create([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status,
        ]);

        foreach ($request->items as $item) {
            $category = EventMenuCategory::find($item['id']);
            if ($category) {
                $menu->items()->create([
                    'name' => $category->name,
                    'status' => 'active',
                ]);
            }
        }

        return redirect()->route('event-menu.index')->with('success', 'Menu created successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'status' => 'required|in:active,inactive',
            'items' => 'array',
            'items.*.id' => 'required|exists:event_menu_categories,id',
        ]);

        $menu = EventMenu::findOrFail($id);

        $menu->update([
            'name' => $request->name,
            'amount' => $request->amount,
            'status' => $request->status,
        ]);

        // Remove old items
        $menu->items()->delete();

        // Add new items
        foreach ($request->items as $item) {
            $category = EventMenuCategory::find($item['id']);
            if ($category) {
                $menu->items()->create([
                    'name' => $category->name,
                    'status' => 'active',
                ]);
            }
        }

        return redirect()->route('event-menu.index')->with('success', 'Menu updated successfully.');
    }
}