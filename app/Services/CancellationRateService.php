<?php

namespace App\Services;

use App\Enums\TripStatus;
use App\Enums\UserBannedStatus;
use App\Enums\UserRole;
use App\Support\DateRange;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CancellationRateService
{
    public function getRates(DateRange $range): Collection
    {
        [$startDate, $endDate] = $range->toDateStrings();

        return DB::table('trips as t')
            ->selectRaw(
                "t.request_at as day," .
                "ROUND(" .
                "  SUM(CASE WHEN t.status IN (?, ?) THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) , 2" .
                ") as cancellation_rate",
                [
                    TripStatus::CancelledByDriver->value,
                    TripStatus::CancelledByClient->value,
                ]
            )
            ->join('users as c', function ($join) {
                $join->on('c.id', '=', 't.client_id')
                    ->where('c.banned', UserBannedStatus::No->value)
                    ->where('c.role', UserRole::Client->value);
            })
            ->join('users as d', function ($join) {
                $join->on('d.id', '=', 't.driver_id')
                    ->where('d.banned', UserBannedStatus::No->value)
                    ->where('d.role', UserRole::Driver->value);
            })
            ->whereBetween('t.request_at', [$startDate, $endDate])
            ->groupBy('t.request_at')
            ->orderBy('t.request_at')
            ->get()
            ->map(fn ($row) => [
                'day' => $row->day,
                'cancellation_rate' => (float) $row->cancellation_rate,
            ]);
    }
}
