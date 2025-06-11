<?php

namespace App\Enums;

enum InvoiceType: string
{
    case MEMBERSHIP = 'membership';
    case SUBSCRIPTION = 'subscription';
}

// ['invoice_type' => ['required', new Enum(InvoiceType::class)]]