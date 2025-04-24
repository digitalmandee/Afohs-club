<?php

namespace Database\Seeders\Tenant;

use App\Models\MemberType;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class MemberTypeSeeder extends Seeder
{
    public function run(): void
    {
        //
        MemberType::create(['name' => 'Silver']);
        MemberType::create(['name' => 'Gold']);
        MemberType::create(['name' => 'Corporate Member']);
        MemberType::create(['name' => 'Applied Member']);
        MemberType::create(['name' => 'Affiliated Member']);
        MemberType::create(['name' => 'VIP Guest']);
        MemberType::create(['name' => 'Employee']);
    }
}
