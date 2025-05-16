<?php

namespace App\Http\Controllers\App\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function checkUserId(Request $request)
    {
        $request->validate([
            'user_id' => 'required|numeric',
        ]);

        $user = User::where('user_id', $request->user_id)->first();

        if (!$user) {
            return back()->withErrors(['user_id' => 'Employee ID not found.'])->withInput();
        }

        // You can redirect to the employee sign-in tab or dashboard
        return redirect()->route('tenant.login');
    }
}