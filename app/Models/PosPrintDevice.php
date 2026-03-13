<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosPrintDevice extends Model
{
    protected $table = 'pos_print_devices';

    protected $fillable = [
        'device_id',
        'name',
        'api_token_hash',
        'status',
        'last_seen_at',
    ];

    protected $casts = [
        'last_seen_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}

