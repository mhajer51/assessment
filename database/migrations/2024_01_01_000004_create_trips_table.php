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
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('driver_id')->constrained('users');
            $table->unsignedBigInteger('city_id');
            $table->enum('status', ['completed', 'cancelled_by_driver', 'cancelled_by_client']);
            $table->date('request_at');
            $table->timestamps();

            $table->index(['request_at', 'client_id', 'driver_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
