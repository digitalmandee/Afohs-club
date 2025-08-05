<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::getGroup('billing');
        return inertia('App/Admin/Settings/Billing', ['settings' => $settings]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'overdue_charge_pct' => 'required|numeric|min:0',
            'penalty_quarter_pct' => 'required|array',
            'penalty_quarter_pct.*' => 'required|numeric|min:0',
            'reinstatement_fees' => 'required|array',
            'reinstatement_fees.*' => 'required|numeric|min:0',
        ]);

        Setting::updateGroup('billing', $validated);

        return back()->with('success', 'Billing settings updated.');
    }
}