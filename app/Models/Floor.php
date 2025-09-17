<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Floor extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'area', 'status', 'tenant_id'];

    public function tables()
    {
        return $this->hasMany(Table::class);
    }
}
