<?php

namespace App\Enums;

enum TripStatus: string
{
    case Completed = 'completed';
    case CancelledByDriver = 'cancelled_by_driver';
    case CancelledByClient = 'cancelled_by_client';
}
