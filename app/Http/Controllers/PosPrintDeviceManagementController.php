<?php

namespace App\Http\Controllers;

use App\Models\PosPrintDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PosPrintDeviceManagementController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('App/Settings/PrintDevices', [
            'devices' => PosPrintDevice::query()
                ->orderBy('device_id')
                ->get()
                ->map(function (PosPrintDevice $d) {
                    return [
                        'id' => $d->id,
                        'device_id' => $d->device_id,
                        'name' => $d->name,
                        'status' => $d->status,
                        'last_seen_at' => optional($d->last_seen_at)->toIso8601String(),
                        'created_at' => optional($d->created_at)->toIso8601String(),
                        'updated_at' => optional($d->updated_at)->toIso8601String(),
                    ];
                }),
            'lastToken' => session('print_device_token'),
            'lastTokenDeviceId' => session('print_device_device_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string|max:100|unique:pos_print_devices,device_id',
            'name' => 'nullable|string|max:255',
        ]);

        $token = Str::random(48);
        $hash = hash('sha256', $token);

        $device = PosPrintDevice::create([
            'device_id' => $validated['device_id'],
            'name' => $validated['name'] ?? null,
            'api_token_hash' => $hash,
            'status' => 'active',
        ]);

        return redirect()
            ->back()
            ->with('print_device_token', $token)
            ->with('print_device_device_id', $device->device_id);
    }

    public function update(Request $request, PosPrintDevice $device)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);

        $device->update([
            'name' => $validated['name'] ?? null,
            'status' => $validated['status'],
        ]);

        return redirect()->back();
    }

    public function rotate(Request $request, PosPrintDevice $device)
    {
        $token = Str::random(48);
        $hash = hash('sha256', $token);

        $device->update([
            'api_token_hash' => $hash,
            'status' => 'active',
        ]);

        return redirect()
            ->back()
            ->with('print_device_token', $token)
            ->with('print_device_device_id', $device->device_id);
    }

    public function destroy(Request $request, PosPrintDevice $device)
    {
        $device->delete();
        return redirect()->back();
    }
}
