<?php

namespace App\Http\Controllers\App;

use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\AddressType;
use App\Models\Member;
use App\Models\MemberType;
use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class MembersController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->query('limit') ?? 10;

        $users = User::with(['memberType', 'userDetail'])->role('user', 'web')->latest()->paginate($limit);

        return Inertia::render('App/Member/Dashboard', compact('users'));
    }

    public function byUser($userId)
    {
        $member = Member::with([
            'memberCategory',
            'pausedHistories' => function ($q) {
                $q->orderBy('start_date');
            }
        ])->where('user_id', $userId)->firstOrFail();

        return response()->json($member);
    }
}
