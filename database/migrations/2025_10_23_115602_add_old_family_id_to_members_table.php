<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // Add old_family_id column to track original family member IDs from old system
            $table->bigInteger('old_family_id')->nullable()->after('id')->comment('Original family member ID from mem_families table');
            
            // Add index for faster lookups during migration
            $table->index('old_family_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // Drop index and column
            $table->dropIndex(['old_family_id']);
            $table->dropColumn('old_family_id');
        });
    }
};
