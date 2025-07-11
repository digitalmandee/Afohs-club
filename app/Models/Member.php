<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'application_no',
        'member_type_id',
        'member_category_id',
        'family_suffix',
        'full_name',
        'relation',
        'cnic',
        'phone_number',
        'start_date',
        'end_date',
        'picture',
        'membership_no',
        'membership_date',
        'card_status',
        'card_issue_date',
        'card_expiry_date',
        'from_date',
        'to_date',
        'picture',
        'member_image',
        'qr_code',
        'invoice_id'
    ];

    protected $casts = [
        'member_type' => 'array',
        'category_ids' => 'array'
    ];

    public static function generateNextMembershipNumber(): string
    {
        $lastNumber = self::orderBy('id', 'desc')
            ->pluck('membership_no')
            ->map(function ($number) {
                // Extract the base numeric part (e.g., from "AR 002", "PR 1000-1")
                preg_match('/\b(\d+)\b/', $number, $matches);
                return isset($matches[1]) ? (int) $matches[1] : 0;
            })
            ->max() ?? 0;

        $next = $lastNumber + 1;

        // Minimum 3 digits, but will grow if needed (e.g., "001", "099", "1000")
        return str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }

    public static function generateNextApplicationNo(): string
    {
        $last = self::whereNotNull('application_no')
            ->pluck('application_no')
            ->map(fn($no) => (int) $no)
            ->max() ?? 0;

        $next = $last + 1;

        // Optional cap, e.g., if max is 99
        if ($next > 99) {
            throw new \Exception('Application number limit reached.');
        }

        return $next;
    }

    // public function userDetail()
    // {
    //     return $this->belongsTo(UserDetail::class);
    // }

    public function memberType()
    {
        return $this->belongsTo(MemberType::class);
    }

    public function memberCategory()
    {
        return $this->belongsTo(MemberCategory::class);
    }

    public function primaryMember()
    {
        return $this->belongsTo(Member::class, 'primary_member_id');
    }

    public function userDetail()
    {
        return $this->belongsTo(UserDetail::class);
    }
}