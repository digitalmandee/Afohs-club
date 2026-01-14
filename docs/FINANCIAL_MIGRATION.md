# Financial Migration Flow & Architecture

## Overview

This document outlines the architecture and flow of the new Financial System following the refactoring involved in the "Deep Migration". The primary goal was to transition from a legacy system where transactions were loosely coupled to a strict, double-entry inspired system where every financial action is tracked via `Transactions` and `TransactionRelations`.

## Key Components

1.  **FinancialInvoice (`financial_invoices`)**: The header record for a bill (e.g., Monthly Subscription, Maintenance Fee).
2.  **FinancialInvoiceItem (`financial_invoice_items`)**: The granular line items within an invoice. **Critically**, the new system links financial transactions primarily to these _Items_, not just the invoice header, allowing for per-item balance tracking.
3.  **FinancialReceipt (`financial_receipts`)**: Records of payments received (Cash, Cheque, Online).
4.  **Transaction (`transactions`)**: The ledger. Every charge (Debit) and payment (Credit) is a row here.
    - **Debit**: created when an Invoice Item is created.
    - **Credit**: Created when a payment (Receipt) is applied.
5.  **TransactionRelation (`transaction_relations`)**: A pivot table linking Invoices to Receipts with specific amounts. This is the source of truth for "How much of this Invoice is paid?".

---

## The Migration Logic (`migrateInvoicesDeep`)

The migration process transforms legacy data into this new structure through the following steps:

### 1. Invoice & Item Creation

- Legacy invoices are read and active items (`is_active=1`) are filtered.
- A `FinancialInvoice` is created.
- `FinancialInvoiceItem`s are created for each legacy row.

### 2. Transaction Migration (The "Ledger")

For _each_ Invoice Item, we look up its legacy transactions:

- **Debits**: A `Transaction` (type='debit') is created, linked to the `FinancialInvoiceItem` (`reference_type`).
- **Credits**: A `Transaction` (type='credit') is created, also linked to the `FinancialInvoiceItem`.
    - If the legacy credit has a `receipt_id`, we try to find or migrate that `FinancialReceipt`.
    - If found, the `Transaction` is linked to the `FinancialReceipt` via `receipt_id`.

### 3. Relation Linking (The "Payment Status")

After transactions are migrated, we ensure the _Invoice Level_ knows it has been paid.

- We populate `transaction_relations` mapping the `FinancialInvoice` to the `FinancialReceipt`.
- **Crucial Fix**: We verify the _exact amount_ allocated from that receipt to this invoice.
- **Logic**: `TransactionRelation::updateOrCreate(..., ['amount' => ...])`.

### 4. Status Update (The "Final Check")

At the very end of processing an invoice, we force a status recalculation:

- **Function**: `updateInvoiceStatus($invoice)`
- **Logic**:
    1.  Sum all `amount` values in `transaction_relations` for this invoice.
    2.  Compare `Total Paid` vs `Invoice Total`.
    3.  **Set Status**:
        - `Total Paid >= Invoice Total` -> **PAID**
        - `Total Paid > 0` -> **PARTIAL**
        - `Total Paid == 0` -> **UNPAID**

---

## Data Integrity & Constraints

- **Nullable Receipt IDs**: The `transaction_relations` table allows `receipt_id` to be nullable (via recent migration) to handle legacy data inconsistencies where a credit transaction exists but the physical receipt record is missing.
- **Legacy IDs**: We maintain `legacy_transaction_id` in `transaction_relations` to trace back to the exact source record in the old system.
- **Audit Columns**: All tables now include `created_by`, `updated_by`, `deleted_by`, and `deleted_at` for full audit trails.

## How to Verify

1.  **Check Invoices**: Go to the Invoice List. Statuses should accurately reflect 'Paid' or 'Partial'.
2.  **Check Balance**: Inside an invoice, the "Balance Due" is calculated as validation of (Total - Paid).
3.  **Cross-Reference**: The "Transactions" tab shows the granular Debits/Credits per item, matching the ledger.
