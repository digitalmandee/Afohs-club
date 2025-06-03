<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            $table->integer('duration')->nullable(); // Change to integer if not already
            $table->decimal('fee', 10, 2)->nullable();
            $table->decimal('maintenance_fee', 10, 2)->nullable();
            $table->enum('discount_type', ['percentage', 'amount'])->default('percentage');
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->text('discount_authorized')->nullable();
            $table->json('benefit')->nullable(); // Change to JSON for array storage
        });
    }

    public function down(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            $table->dropColumn([
                'duration',
                'fee',
                'maintenance_fee',
                'discount_type',
                'discount_value',
                'discount_authorized',
                'benefit',
            ]);
        });
    }
};