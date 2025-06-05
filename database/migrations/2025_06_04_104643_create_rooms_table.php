<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Room Name (e.g., Standard)
            $table->unsignedTinyInteger('number_of_beds'); // e.g., 3
            $table->unsignedInteger('max_capacity'); // e.g., "2 Adults"
            $table->decimal('price_per_night', 8, 2); // e.g., 100.00
            $table->unsignedTinyInteger('number_of_bathrooms'); // e.g., 1
            $table->string('photo_path')->nullable(); // Store uploaded image path
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
