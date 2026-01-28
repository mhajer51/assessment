<?php

namespace Database\Seeders;

use App\Enums\TripStatus;
use App\Enums\UserBannedStatus;
use App\Enums\UserRole;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaxiTripsSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::factory()->count(2)->create([
            'role' => UserRole::Client->value,
            'banned' => UserBannedStatus::No->value,
        ]);

        $drivers = User::factory()->count(2)->create([
            'role' => UserRole::Driver->value,
            'banned' => UserBannedStatus::No->value,
        ]);

        $bannedClient = User::factory()->create([
            'role' => UserRole::Client->value,
            'banned' => UserBannedStatus::Yes->value,
        ]);

        $bannedDriver = User::factory()->create([
            'role' => UserRole::Driver->value,
            'banned' => UserBannedStatus::Yes->value,
        ]);

        Trip::query()->insert([
            [
                'client_id' => $clients[0]->id,
                'driver_id' => $drivers[0]->id,
                'city_id' => 1,
                'status' => TripStatus::CancelledByDriver->value,
                'request_at' => '2013-10-01',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'client_id' => $clients[1]->id,
                'driver_id' => $drivers[0]->id,
                'city_id' => 1,
                'status' => TripStatus::Completed->value,
                'request_at' => '2013-10-01',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'client_id' => $clients[0]->id,
                'driver_id' => $drivers[1]->id,
                'city_id' => 2,
                'status' => TripStatus::Completed->value,
                'request_at' => '2013-10-02',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'client_id' => $clients[1]->id,
                'driver_id' => $drivers[1]->id,
                'city_id' => 2,
                'status' => TripStatus::CancelledByClient->value,
                'request_at' => '2013-10-03',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'client_id' => $bannedClient->id,
                'driver_id' => $drivers[0]->id,
                'city_id' => 3,
                'status' => TripStatus::CancelledByClient->value,
                'request_at' => '2013-10-03',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'client_id' => $clients[0]->id,
                'driver_id' => $bannedDriver->id,
                'city_id' => 3,
                'status' => TripStatus::CancelledByDriver->value,
                'request_at' => '2013-10-03',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
