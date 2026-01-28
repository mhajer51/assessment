<?php

namespace Database\Factories;

use App\Enums\TripStatus;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Trip>
 */
class TripFactory extends Factory
{
    protected $model = Trip::class;

    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'driver_id' => User::factory(),
            'city_id' => fake()->numberBetween(1, 10),
            'status' => fake()->randomElement(array_column(TripStatus::cases(), 'value')),
            'request_at' => fake()->date(),
        ];
    }
}
