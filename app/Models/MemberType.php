<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MemberType extends Model
{
    protected $fillable = [
        'name',
        'duration',
        'fee',
        'maintenance_fee',
        'discount',
        'discount_authorized',
        'benefit',
    ];

    protected $casts = [
        'benefit' => 'array',
    ];
}