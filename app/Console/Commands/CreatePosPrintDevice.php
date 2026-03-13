<?php

namespace App\Console\Commands;

use App\Models\PosPrintDevice;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreatePosPrintDevice extends Command
{
    protected $signature = 'pos:print-device-create {device_id} {--name=} {--rotate}';

    protected $description = 'Create or rotate API token for a POS print device';

    public function handle(): int
    {
        $deviceId = (string) $this->argument('device_id');
        $name = $this->option('name') ? (string) $this->option('name') : null;
        $rotate = (bool) $this->option('rotate');

        $device = PosPrintDevice::query()->where('device_id', $deviceId)->first();
        if ($device && !$rotate) {
            $this->error('Device already exists. Use --rotate to rotate token.');
            return self::FAILURE;
        }

        $token = Str::random(48);
        $hash = hash('sha256', $token);

        if (!$device) {
            $device = new PosPrintDevice();
            $device->device_id = $deviceId;
        }
        if ($name !== null) {
            $device->name = $name;
        }
        $device->api_token_hash = $hash;
        $device->status = 'active';
        $device->save();

        $this->line('device_id: ' . $deviceId);
        $this->line('api_token: ' . $token);

        return self::SUCCESS;
    }
}

