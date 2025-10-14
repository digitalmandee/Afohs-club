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
        Schema::table('financial_invoices', function (Blueprint $table) {
            // Add credit card type field
            $table->string('credit_card_type')->nullable()->after('payment_method');
            
            // Rename misspelled 'reciept' to 'receipt'
            $table->renameColumn('reciept', 'receipt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_invoices', function (Blueprint $table) {
            // Drop credit card type field
            $table->dropColumn('credit_card_type');
            
            // Rename back to original misspelled name
            $table->renameColumn('receipt', 'reciept');
        });
    }
};
