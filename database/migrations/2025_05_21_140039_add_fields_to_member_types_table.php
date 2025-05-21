<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            $table->integer('duration')->nullable()->after('name'); // in months or your unit
            $table->decimal('fee', 10, 2)->nullable()->after('duration');
            $table->decimal('maintenance_fee', 10, 2)->nullable()->after('fee');
            $table->decimal('discount', 10, 2)->nullable()->after('maintenance_fee');
            $table->boolean('discount_authorized')->default(false)->after('discount');
            $table->text('benefit')->nullable()->after('discount_authorized');
        });
    }

    public function down(): void
    {
        Schema::table('member_types', function (Blueprint $table) {
            $table->dropColumn([
                'duration',
                'fee',
                'maintenance_fee',
                'discount',
                'discount_authorized',
                'benefit',
            ]);
        });
    }
};
