<?php

namespace App\Support;

use Carbon\CarbonImmutable;

final class DateRange
{
    public function __construct(
        public readonly CarbonImmutable $start,
        public readonly CarbonImmutable $end
    ) {
    }

    public static function fromStrings(string $start, string $end): self
    {
        return new self(
            CarbonImmutable::parse($start)->startOfDay(),
            CarbonImmutable::parse($end)->startOfDay()
        );
    }

    public function toDateStrings(): array
    {
        return [$this->start->toDateString(), $this->end->toDateString()];
    }
}
