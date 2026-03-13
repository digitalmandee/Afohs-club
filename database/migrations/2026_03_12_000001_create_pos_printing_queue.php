<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pos_categories', function (Blueprint $table) {
            if (!Schema::hasColumn('pos_categories', 'printer_device_id')) {
                $table->string('printer_device_id')->nullable()->after('status');
            }
            if (!Schema::hasColumn('pos_categories', 'printer_type')) {
                $table->string('printer_type')->nullable()->after('printer_device_id');
            }
            if (!Schema::hasColumn('pos_categories', 'printer_name')) {
                $table->string('printer_name')->nullable()->after('printer_type');
            }
        });

        Schema::create('pos_print_devices', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->unique();
            $table->string('name')->nullable();
            $table->string('api_token_hash', 64);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });

        Schema::create('pos_print_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('pos_categories')->nullOnDelete();
            $table->string('printer_device_id')->index();
            $table->string('printer_type')->nullable();
            $table->string('printer_name')->nullable();
            $table->json('payload');
            $table->enum('status', ['pending', 'printing', 'printed', 'failed'])->default('pending')->index();
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('locked_at')->nullable();
            $table->string('locked_by_device_id')->nullable();
            $table->timestamp('printed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();

            $table->index(['printer_device_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_print_jobs');
        Schema::dropIfExists('pos_print_devices');

        Schema::table('pos_categories', function (Blueprint $table) {
            $cols = [];
            foreach (['printer_device_id', 'printer_type', 'printer_name'] as $col) {
                if (Schema::hasColumn('pos_categories', $col)) {
                    $cols[] = $col;
                }
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};

