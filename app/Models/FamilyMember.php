<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyMember extends Model
{
    // use HasFactory;

    protected $table = 'family_members';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_detail_id',
        'full_name',
        'relation',
        'cnic',
        'phone_number',
        'membership_type',
        'membership_category',
        'start_date',
        'end_date',
        'picture',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the user detail that this family member belongs to.
     */
    public function userDetail()
    {
        return $this->belongsTo(UserDetail::class, 'user_detail_id');
    }
}
