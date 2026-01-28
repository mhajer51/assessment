<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\CancellationRateRequest;
use App\Services\CancellationRateService;
use App\Support\DateRange;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CancellationRateController extends Controller
{

    public function __construct(
        private readonly CancellationRateService $service
    ) {}

    public function index(CancellationRateRequest $request): JsonResponse
    {
        $range = DateRange::fromStrings(
            $request->validated('start_date'),
            $request->validated('end_date')
        );

        $rates = $this->service->getRates($range);

        return response()->json([
            'data' => $rates,
        ]);
    }
}
