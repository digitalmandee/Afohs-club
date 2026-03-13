<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\PosPrintDevice;
use App\Models\PosPrintJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PosPrintJobManagementController extends Controller
{
    private function activeTenantId(Request $request = null)
    {
        $request = $request ?? request();
        return $request->session()->get('active_restaurant_id') ?? $request->route('tenant') ?? tenant('id');
    }

    private function selectedRestaurantId(Request $request = null)
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
        $filters = $request->only(['status', 'device_id', 'order_id', 'category_id']);

        $query = PosPrintJob::query()
            ->with([
                'category:id,name',
                'order:id,tenant_id,table_id,start_date,start_time',
                'order.table:id,table_no',
            ])
            ->whereHas('order', fn($q) => $q->where('tenant_id', $restaurantId));

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['device_id'])) {
            $query->where('printer_device_id', $filters['device_id']);
        }
        if (!empty($filters['order_id'])) {
            $query->where('order_id', (int) $filters['order_id']);
        }
        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        $jobs = $query
            ->orderByDesc('id')
            ->paginate(50)
            ->withQueryString();

        $devices = PosPrintDevice::query()
            ->orderBy('device_id')
            ->get(['device_id', 'name', 'status', 'last_seen_at'])
            ->map(fn($d) => [
                'device_id' => $d->device_id,
                'name' => $d->name,
                'status' => $d->status,
                'last_seen_at' => optional($d->last_seen_at)->toIso8601String(),
            ])
            ->values();

        $categories = Category::query()
            ->where('tenant_id', $restaurantId)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->name])
            ->values();

        return Inertia::render('App/Settings/PrintJobs', [
            'jobs' => $jobs,
            'devices' => $devices,
            'categories' => $categories,
            'filters' => $filters,
            'activeTenantId' => $restaurantId,
        ]);
    }

    public function retry(Request $request, PosPrintJob $job)
    {
        $job->forceFill([
            'status' => 'pending',
            'locked_at' => null,
            'locked_by_device_id' => null,
            'failed_at' => null,
            'last_error' => null,
        ])->save();

        return redirect()->back();
    }
}

