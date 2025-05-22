<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            // Drop existing columns and redefine them
            $table->string('name', 255)->unique()->change();
            $table->integer('duration')->nullable()->change();
            $table->decimal('fee', 10, 2)->change();
            $table->decimal('maintenance_fee', 10, 2)->change();
            $table->decimal('discount', 10, 2)->nullable()->change();
            $table->string('discount_authorized', 255)->change();
            $table->json('benefit')->change(); // Convert to JSON
        });
    }

    public function down(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            $table->string('name', 255)->unique()->change();
            $table->string('duration', 255)->nullable()->change();
            $table->decimal('fee', 10, 2)->change();
            $table->decimal('maintenance_fee', 10, 2)->change();
            $table->decimal('discount', 10, 2)->nullable()->change();
            $table->string('discount_authorized', 255)->change();
            $table->string('benefit', 1000)->change();
        });
    }
};
