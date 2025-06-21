<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'primary_member_id', // Added
        'member_type_id',
        'member_type',
        'full_name',
        'relation',
        'cnic',
        'phone_number',
        'membership_type',
        'membership_category',
        'start_date',
        'end_date',
        'picture',
        'membership_number',
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
        'category_ids' => 'array'
    ];

    // public function userDetail()
    // {
    //     return $this->belongsTo(UserDetail::class);
    // }

    public function memberType()
    {
        return $this->belongsTo(MemberType::class);
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
