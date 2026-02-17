<?php

namespace App\Models;

use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    public $incrementing = true;

    protected $keyType = 'int';

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'branch_id',
            'status',
            'printer_ip',
            'printer_port',
            'expeditor_printer_ip',
            'expeditor_printer_port',
        ];
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = bcrypt($value);
    }
}
