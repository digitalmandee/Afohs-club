<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TransactionType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',  // default 'debit' or 'credit' if applicable
        'status',  // 'active', 'inactive'
        'is_system',  // boolean, if true, cannot be deleted (e.g., Room Booking)
        'default_amount',
        'is_fixed'
    ];
}
