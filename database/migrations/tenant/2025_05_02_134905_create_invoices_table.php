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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('order_id')->nullable()->constrained();
            $table->decimal('amount', 10, 2);
            $table->decimal('cash_total', 10, 2);
            $table->decimal('customer_change', 10, 2);
            $table->string('payment_method')->nullable();
            $table->enum('status', ['paid', 'unpaid', 'refund', 'cancelled'])->default('unpaid');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
