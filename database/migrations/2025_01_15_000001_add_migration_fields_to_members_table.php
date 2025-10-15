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
            // Add fields to help with migration tracking
            $table->bigInteger('old_member_id')->nullable()->after('id')->comment('Original ID from old system');
            $table->string('migration_source', 50)->nullable()->after('old_member_id')->comment('Source table: memberships or mem_families');
            $table->json('migration_notes')->nullable()->after('migration_source')->comment('Migration issues or notes');
            $table->timestamp('migrated_at')->nullable()->after('migration_notes')->comment('When this record was migrated');
            
            // Add index for faster lookups during migration
            $table->index('old_member_id');
            $table->index('migration_source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex(['old_member_id']);
            $table->dropIndex(['migration_source']);
            $table->dropColumn(['old_member_id', 'migration_source', 'migration_notes', 'migrated_at']);
        });
    }
};
