<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            $table->integer('duration')->nullable()->change(); // Change to integer if not already
            $table->decimal('fee', 10, 2)->nullable()->change();
            $table->decimal('maintenance_fee', 10, 2)->nullable()->change();
            $table->decimal('discount', 10, 2)->nullable()->change();
            $table->text('discount_authorized')->nullable()->change();
            $table->json('benefit')->nullable()->change(); // Change to JSON for array storage
        });
    }

    public function down(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            $table->string('duration', 255)->nullable()->change(); // Revert if needed
            $table->decimal('fee', 10, 2)->nullable()->change();
            $table->decimal('maintenance_fee', 10, 2)->nullable()->change();
            $table->decimal('discount', 10, 2)->nullable()->change();
            $table->string('discount_authorized', 255)->nullable()->change();
            $table->string('benefit', 1000)->nullable()->change(); // Revert to string
        });
    }
};
