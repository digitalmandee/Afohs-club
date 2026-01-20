<?php

namespace App\Constants;

class AppConstants
{
    // Payroll & Allowance IDs
    const FOOD_ALLOWANCE_TYPE_ID = 4;

    // Deduction Types - lookup by name if not fixed, or add ID here if fixed
    const FOOD_BILL_DEDUCTION_NAME = 'Food Bill / CTS';

    // Transaction Types (Financial)
    const TRANSACTION_TYPE_ID_MEMBERSHIP = 3;

    const TRANSACTION_TYPE_ID_MAINTENANCE = 4;

    const TRANSACTION_TYPE_ID_SUBSCRIPTION = 5;

    const TRANSACTION_TYPE_ID_FINANCIAL_CHARGE = 6;
}
