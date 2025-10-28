<?php

namespace App\Http\Controllers;

use App\Models\MemberCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MemberCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:member-categories.view')->only('index');
        $this->middleware('permission:member-categories.create')->only('create', 'store');
        $this->middleware('permission:member-categories.edit')->only('edit', 'update');
        $this->middleware('permission:member-categories.delete')->only('destroy');
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $memberCategories = MemberCategory::all();
        return Inertia::render('App/Admin/Membership/Category/Index', compact('memberCategories'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return Inertia::render('App/Admin/Membership/Category/AddEdit');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
            'fee' => 'required',
            'subscription_fee' => 'required',
            'status' => 'required',
        ]);

        MemberCategory::create($request->all());

        return response()->json(['message' => 'Member Category created successfully']);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\MemberCategory  $memberCategory
     * @return \Illuminate\Http\Response
     */
    public function edit(MemberCategory $memberCategory)
    {
        return Inertia::render('App/Admin/Membership/Category/AddEdit', compact('memberCategory'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\MemberCategory  $memberCategory
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'required',
            'fee' => 'required',
            'subscription_fee' => 'required',
            'status' => 'required',
        ]);

        $memberCategory = MemberCategory::find($id);

        if (!$memberCategory) {
            return response()->json(['error' => 'Member category not found'], 404);
        }

        $memberCategory->update($request->all());

        return response()->json(['message' => 'Member category updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\MemberCategory  $memberCategory
     * @return \Illuminate\Http\Response
     */
    public function destroy(MemberCategory $memberCategory)
    {
        $memberCategory->delete();

        return response()->json(['message' => 'Member category deleted successfully']);
    }
}