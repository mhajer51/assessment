<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\CancellationRateService;
use App\Support\DateRange;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CancellationRateController extends Controller
{
    public function __construct(private readonly CancellationRateService $service)
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $range = DateRange::fromStrings($validated['start_date'], $validated['end_date']);
        $rates = $this->service->getRates($range);

        return response()->json([
            'data' => $rates,
        ]);
    }
}
