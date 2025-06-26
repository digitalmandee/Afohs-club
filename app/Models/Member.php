<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'application_no',
        // 'primary_member_id', // Added
        'member_type_id',
        'member_category_id',
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
        $year = now()->format('y');
        $lastNumber = self::where('membership_no', 'like', '%-' . $year)
            ->orderBy('id', 'desc')
            ->pluck('membership_no')
            ->map(function ($number) {
                return (int) explode('-', $number)[0];
            })
            ->max() ?? 0;

        $newSerial = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        return "$newSerial-$year";
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
            throw new \Exception("Application number limit reached.");
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