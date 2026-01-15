# Finance Module Architecture

## Overview

This document outlines the architecture of the **Finance Module**, specifically the refactored **Item-Level Transaction Logic** and the dedicated **Payment Flow**. The system has moved from a single-transaction-per-invoice model to a more granular model where transactions are linked to specific invoice items (`financial_invoice_items`).

## Core Concepts

### 1. Item-Level Transactions

- **Previous Model**: Revenue was calculated based on the invoice total.
- **New Model**: Revenue and payments are tracked at the **Item Level**.
- **Data Structure**:
    - `financial_invoices`: The parent record.
    - `financial_invoice_items`: The line items (e.g., Membership Fee, Maintenance Fee).
    - `transactions`: now linked to `financial_invoice_items` (polymorphic relationship) for specific credits/payments.

### 2. Transaction Types (Numeric IDs)

The system now uses numeric IDs for `fee_type` in `financial_invoice_items` and `transaction_types` table, replacing older string enums for better scalability.

- **3**: Membership Fee
- **4**: Maintenance Fee
- **5**: Subscription Fee
- **6**: Financial Charge (etc.)

## Routes & Controllers

The finance routes are defined in `routes/web.php` under the `admin/finance` prefix.

### Dashboard & Manage

- **`GET admin/finance/dashboard`** (`finance.dashboard`)

    - **Controller**: `FinancialController@index`
    - **Logic**: Aggregates revenue by summing `transactions` linked to `financial_invoice_items`.
    - **View**: `Dashboard.jsx` (Displays revenue stats and recent transactions).

- **`GET admin/finance/manage`** (`finance.transaction`)
    - **Controller**: `FinancialController@getAllTransactions`
    - **Logic**: Lists invoices with calculated `paid_amount` and `balance`.
    - **Calculation**:
        ```php
        $paid = $invoice->items->sum(function ($item) {
            return $item->transactions->where('type', 'credit')->sum('amount');
        });
        ```
    - **View**: `Transaction.jsx` (Grid view of all invoices).

### Transaction Operations

- **`GET admin/finance/create`** (`finance.transaction.create`)

    - **Controller**: `MemberTransactionController@create`
    - **Purpose**: UI to create new transactions/invoices.

- **`POST admin/finance/store`** (`finance.transaction.store`)
    - **Controller**: `MemberTransactionController@store`
    - **Purpose**: Stores the new invoice and its items.

### Payment Flow (Dedicated Page)

- **`GET admin/finance/invoice/{id}/pay`** (`finance.invoice.pay`)

    - **Controller**: `MemberTransactionController@payInvoiceView`
    - **Purpose**: Displays the "Pay Invoice" page.
    - **View**: `PayInvoice.jsx`
    - **Features**:
        - Shows generic invoice details.
        - Allows partial or full payment against specific items.
        - Calculates totals dynamically on the frontend.

- **`POST admin/finance/transaction/update-status/{id}`** (`finance.transaction.update-status`)
    - **Controller**: `MemberTransactionController@updateStatus`
    - **Purpose**: Processes the payment. It creates `credit` transactions linked to the specific `FinancialInvoiceItem`s being paid.

## Frontend Architecture

- **Dashboard (`Dashboard.jsx`)**:
    - Displays aggregated revenue charts.
    - Shows "Recent Transactions" table with `Paid` and `Balance` columns.
- **Manage (`Transaction.jsx`)**:
    - Main grid for finance admins.
    - "Pay" button redirects to the dedicated payment page if balance > 0.
- **Payment Page (`PayInvoice.jsx`)**:
    - Specialized UI for handling payments.
    - Supports multiple payment methods (Cash, Card, Online).
    - Updates the ledger in real-time.

## Key Database Tables

- `financial_invoices`
- `financial_invoice_items`
- `transactions`
- `transaction_types`
