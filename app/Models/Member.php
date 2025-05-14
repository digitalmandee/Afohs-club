<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'user_detail_id',
        'primary_member_id', // Added
        'member_type_id',
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
        'member_image',
    ];

    public function userDetail()
    {
        return $this->belongsTo(UserDetail::class);
    }

    public function memberType()
    {
        return $this->belongsTo(MemberType::class);
    }

    public function primaryMember()
    {
        return $this->belongsTo(Member::class, 'primary_member_id');
    }
}
