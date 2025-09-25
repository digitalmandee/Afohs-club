<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Step 2: Nullify any waiter_id that still doesn't exist in employees
        DB::table('orders')
            ->whereNotIn('waiter_id', DB::table('employees')->pluck('id'))
            ->update(['waiter_id' => null]);

        // Step 3: Add foreign key to employees table
        Schema::table('orders', function (Blueprint $table) {
            $table
                ->foreign('waiter_id')
                ->references('id')
                ->on('employees')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['waiter_id']);
        });
    }
};