<?php

namespace App\Enums;

enum InvoiceType: string
{
    case MEMBERSHIP = 'membership';
    case SUBSCRIPTION = 'subscription';
    case ROOMEVENTBOOKING = 'room_event_booking';
}

// ['invoice_type' => ['required', new Enum(InvoiceType::class)]]
