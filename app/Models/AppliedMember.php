<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class AppliedMember extends Model
{
    protected $table = 'applied_member';

    protected $fillable = [
        'member_id',
        'name',
        'email',
        'phone_number',
        'address',
        'amount_paid',
        'cnic',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // ✅ Accessor to return start_date in YYYY-MM-DD format
    public function getStartDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    // ✅ Accessor to return end_date in YYYY-MM-DD format
    public function getEndDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }
}
