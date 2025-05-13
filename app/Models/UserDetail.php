<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDetail extends Model
{
    use HasFactory;

    protected $table = 'user_details';

    protected $fillable = [
        'user_id',
        'address_type',
        'country',
        'state',
        'city',
        'zip',
        'address',
        'status',
        'application_number',
        'name_comments',
        'guardian_name',
        'guardian_membership',
        'nationality',
        'cnic_no',
        'passport_no',
        'gender',
        'ntn',
        'date_of_birth',
        'education',
        'membership_reason',
    ];
    protected $casts = [
        'education' => 'array',
        'date_of_birth' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
