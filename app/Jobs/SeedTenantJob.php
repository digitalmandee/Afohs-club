<?php

namespace App\Jobs;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SeedTenantJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    protected $tenant;

    public function __construct(Tenant $tenant)
    {
        $this->tenant = $tenant;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->tenant->run(function () {
            // $user = User::create([
            //     'user_id' => 12345678,
            //     'name' => $this->tenant->name,
            //     'email' => $this->tenant->email,
            //     'password' => $this->tenant->password,
            // ]);

            // $user->assignRole('admin');
        });
    }
}