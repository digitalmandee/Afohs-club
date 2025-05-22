<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            // Drop old boolean column first
            if (Schema::hasColumn('member_types', 'discount_authorized')) {
                $table->dropColumn('discount_authorized');
            }

            // Add new updated columns

            $table->text('discount_authorized')->nullable()->after('discount'); // updated to text
        });
    }

    public function down(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            $table->dropColumn([
                'discount_authorized',
                'benefit',
            ]);

            // If you want to re-add the old boolean column on rollback:
            $table->boolean('discount_authorized')->default(false)->after('discount');
        });
    }
};
