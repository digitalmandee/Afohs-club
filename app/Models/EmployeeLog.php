<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class EmployeeLog extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = ['employee_id', 'type', 'logged_at', 'tenant_id'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}