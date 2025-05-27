<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMembershipInvoicesTable extends Migration
{
    public function up()
    {
        Schema::create('membership_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('subscription_type')->nullable();
            $table->bigInteger('total_price')->default(0);
            $table->bigInteger('amount')->default(0);
            $table->bigInteger('customer_charges')->default(0);
            $table->enum('status', ['paid', 'unpaid', 'cancelled'])->default('unpaid');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('membership_invoices');
    }
}