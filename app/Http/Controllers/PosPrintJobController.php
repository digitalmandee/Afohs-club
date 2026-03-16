<?php

namespace App\Http\Controllers;

use App\Models\PosPrintDevice;
use App\Models\PosPrintJob;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PosPrintJobController extends Controller
{
    private function authenticateDevice(Request $request, string $deviceId): PosPrintDevice
    {
        $auth = (string) $request->header('Authorization', '');
        $token = '';
        if (str_starts_with($auth, 'Bearer ')) {
            $token = trim(substr($auth, 7));
        }

        if ($token === '') {
            abort(401, 'Missing device token.');
        }

        $device = PosPrintDevice::query()
            ->where('device_id', $deviceId)
            ->where('status', 'active')
            ->first();

        if (!$device) {
            abort(401, 'Invalid device.');
        }

        $expectedHash = (string) $device->api_token_hash;
        $tokenHash = hash('sha256', $token);
        if (!hash_equals($expectedHash, $tokenHash)) {
            abort(401, 'Invalid device token.');
        }

        $device->forceFill(['last_seen_at' => now()])->save();

        return $device;
    }

    public function pull(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|string|max:100',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $deviceId = (string) $validated['device_id'];
        $limit = (int) ($validated['limit'] ?? 5);

        $this->authenticateDevice($request, $deviceId);

        $jobs = DB::transaction(function () use ($deviceId, $limit) {
            $staleBefore = Carbon::now()->subMinutes(2);
            $staleCount = PosPrintJob::query()
                ->where('printer_device_id', $deviceId)
                ->where('status', 'printing')
                ->whereNotNull('locked_at')
                ->where('locked_at', '<', $staleBefore)
                ->update([
                    'status' => 'pending',
                    'locked_at' => null,
                    'locked_by_device_id' => null,
                ]);

            if ($staleCount > 0) {
                Log::warning('pos_print_agent_unlock_stale', [
                    'device_id' => $deviceId,
                    'stale_unlocked' => $staleCount,
                ]);
            }

            $rows = PosPrintJob::query()
                ->where('printer_device_id', $deviceId)
                ->where('status', 'pending')
                ->orderBy('id')
                ->limit($limit)
                ->lockForUpdate()
                ->get();

            if ($rows->isEmpty()) {
                return collect();
            }

            $now = Carbon::now();
            foreach ($rows as $row) {
                $row->forceFill([
                    'status' => 'printing',
                    'attempts' => (int) $row->attempts + 1,
                    'locked_at' => $now,
                    'locked_by_device_id' => $deviceId,
                ])->save();
            }

            return $rows->fresh();
        });

        Log::info('pos_print_agent_pull', [
            'device_id' => $deviceId,
            'limit' => $limit,
            'jobs_count' => $jobs->count(),
            'job_ids' => $jobs->pluck('id')->values()->all(),
        ]);

        return response()->json([
            'device_id' => $deviceId,
            'jobs' => $jobs->map(function (PosPrintJob $job) {
                return [
                    'id' => $job->id,
                    'printer_type' => $job->printer_type,
                    'printer_name' => $job->printer_name,
                    'payload' => $job->payload,
                    'created_at' => optional($job->created_at)->toIso8601String(),
                ];
            })->values(),
        ]);
    }

    public function ack(Request $request, int $id)
    {
        $validated = $request->validate([
            'device_id' => 'required|string|max:100',
            'status' => 'required|in:printed,failed',
            'error' => 'nullable|string|max:5000',
        ]);

        $deviceId = (string) $validated['device_id'];
        $this->authenticateDevice($request, $deviceId);

        $job = PosPrintJob::query()->findOrFail($id);

        if ((string) $job->printer_device_id !== $deviceId) {
            abort(403, 'Job is not assigned to this device.');
        }

        if ($validated['status'] === 'printed') {
            $job->forceFill([
                'status' => 'printed',
                'printed_at' => now(),
                'last_error' => null,
            ])->save();

            Log::info('pos_print_agent_ack', [
                'device_id' => $deviceId,
                'job_id' => $job->id,
                'status' => 'printed',
            ]);
        } else {
            $maxAttempts = 5;
            $shouldRetry = ((int) $job->attempts) < $maxAttempts;
            $err = $validated['error'] ?? 'Print failed';
            if (is_string($err) && strlen($err) > 800) {
                $err = substr($err, 0, 800);
            }
            $job->forceFill([
                'status' => $shouldRetry ? 'pending' : 'failed',
                'failed_at' => $shouldRetry ? null : now(),
                'locked_at' => null,
                'locked_by_device_id' => null,
                'last_error' => $validated['error'] ?? 'Print failed',
            ])->save();

            Log::warning('pos_print_agent_ack', [
                'device_id' => $deviceId,
                'job_id' => $job->id,
                'status' => $shouldRetry ? 'pending' : 'failed',
                'attempts' => (int) $job->attempts,
                'error' => $err,
            ]);
        }

        return response()->json(['success' => true]);
    }
}
