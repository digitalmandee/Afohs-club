<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentAccount extends BaseModel
{
    use SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'payment_method',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }
}

