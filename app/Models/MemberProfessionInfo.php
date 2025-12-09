<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberProfessionInfo extends Model
{
    protected $guarded = [];

    protected $casts = [
        'other_club_membership' => 'array',
        'applied_before' => 'boolean',
        'foreign_affiliation' => 'boolean',
        'stayed_abroad' => 'boolean',
        'criminal_conviction' => 'boolean',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function businessDeveloper()
    {
        return $this->belongsTo(Employee::class, 'business_developer_id');
    }
}
