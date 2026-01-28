<?php

namespace App\Services;

use App\Enums\TripStatus;
use App\Enums\UserBannedStatus;
use App\Support\DateRange;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CancellationRateService
{
    public function getRates(DateRange $range): Collection
    {
        [$startDate, $endDate] = $range->toDateStrings();

        return DB::table('trips as trips')
            ->selectRaw(
                "trips.request_at as day,\n" .
                "ROUND(\n" .
                "  SUM(CASE WHEN trips.status IN (?, ?) THEN 1 ELSE 0 END) / COUNT(*),\n" .
                "  2\n" .
                ") as cancellation_rate",
                [
                    TripStatus::CancelledByDriver->value,
                    TripStatus::CancelledByClient->value,
                ]
            )
            ->join('users as clients', function ($join) {
                $join->on('clients.id', '=', 'trips.client_id')
                    ->where('clients.banned', UserBannedStatus::No->value);
            })
            ->join('users as drivers', function ($join) {
                $join->on('drivers.id', '=', 'trips.driver_id')
                    ->where('drivers.banned', UserBannedStatus::No->value);
            })
            ->whereBetween('trips.request_at', [$startDate, $endDate])
            ->groupBy('trips.request_at')
            ->orderBy('trips.request_at')
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,
                'cancellation_rate' => (float) $row->cancellation_rate,
            ]);
    }
}
