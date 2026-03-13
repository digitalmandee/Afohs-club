<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosPrintJob extends Model
{
    protected $table = 'pos_print_jobs';

    protected $fillable = [
        'order_id',
        'category_id',
        'printer_device_id',
        'printer_type',
        'printer_name',
        'payload',
        'status',
        'attempts',
        'locked_at',
        'locked_by_device_id',
        'printed_at',
        'failed_at',
        'last_error',
    ];

    protected $casts = [
        'payload' => 'array',
        'locked_at' => 'datetime',
        'printed_at' => 'datetime',
        'failed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}

