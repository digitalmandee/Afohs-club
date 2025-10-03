<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('financial_invoices', function (Blueprint $table) {
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_invoices', function (Blueprint $table) {
            $table->dropColumn('period_start');
            $table->dropColumn('period_end');
        });
    }
};