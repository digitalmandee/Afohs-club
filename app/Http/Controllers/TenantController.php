<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Stancl\Tenancy\Database\Models\Domain;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenants = Tenant::with('domains')->get();

        return Inertia::render('tenant/index', compact('tenants'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('tenant/register');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'domain_name' => 'required|string|max:255',
            'printer_ip' => 'required|string|max:255',
            'printer_port' => 'required',
        ]);

        // Custom domain validation
        if (Domain::where('domain', $request->input('domain_name'))->exists()) {
            return back()->withErrors(['domain_name' => 'The domain is already taken.'])->withInput();
        }

        $validatedData['id'] = $request->input('domain_name');

        $tenant = Tenant::create($validatedData);

        $tenant->domains()->create([
            'domain' => $request->input('domain_name'),
        ]);

        return to_route('locations.create');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tenant $tenant)
    {
        return Inertia::render('tenant/register', [
            'tenant' => $tenant,  // pass existing tenant
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'printer_ip' => 'required|string|max:255',
            'printer_port' => 'required',
        ]);

        // Update tenant
        $tenant->update($validatedData);

        return to_route('locations.index')->with('success', 'Tenant updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}