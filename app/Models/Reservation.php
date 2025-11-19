<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Reservation extends BaseModel
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'member_id',
        'customer_id',
        'employee_id',
        'table_id',
        'nature_of_function',
        'theme_of_function',
        'special_request',
        'person_count',
        'down_payment',
        'date',
        'start_time',
        'end_time',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
        'tenant_id'
    ];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    // Reservation.php

    public function order()
    {
        return $this->hasOne(Order::class, 'reservation_id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id', 'id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }
}