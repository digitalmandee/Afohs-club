<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'fee',
        'subscription_fee',
        'status',
    ];

    public function members()
    {
        return $this->hasMany(Member::class, 'member_category_id');
    }
}
