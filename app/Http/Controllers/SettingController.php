<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $setting = Setting::firstOrCreate([], ['tax' => 12]); // Default tax to 12 if no record exists

        return Inertia::render('App/Settings/EditTax', [
            'taxx' => $setting->tax,
        ]);
    }
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tax' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $setting = Setting::firstOrCreate([], ['tax' => 12]);
        $setting->tax = $request->tax;
        $setting->save();

        return response()->json([
            'message' => 'Tax updated successfully',
            'tax' => $setting->tax,
        ], 200);
    }
    public function showTax()
    {
        $setting = Setting::first();

        return response()->json($setting);
    }
}
