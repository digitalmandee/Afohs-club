# Target Manual Invoice Flow (Post-Migration Standard)

This document outlines the **Required Architecture** for manual invoice creation to align with the "Deep Migration" refactor. The code in `FinancialController` must be updated to match this flow.

## Core Principle: Item-Level Ledger

Unlike the old system where Key Transactions linked to the Invoice Header, the new system requires that **Debit Transactions (Charges)** are linked specifically to **Financial Invoice Items**. This ensures granular tracking of what exactly was charged.

---

## 2. Scenario A: Unpaid Invoice Creation (Target Flow)

_Use Case: Generating Quarterly Fees or Manual Unpaid Bills_

### Step-by-Step Flow:

1.  **Invoice Creation**:

    - Create **`financial_invoices`**.
    - `status` = `'unpaid'`.

2.  **Item Creation**:

    - Create **`financial_invoice_items`**.
    - **Crucial**: This is the "Source of Truth" for the charge.

3.  **Approve/Post to Ledger (Debit) - [CHANGED]**:
    - Create **`transactions`** (Debit).
    - `amount`: Item Amount.
    - **Linkage (New Standard)**:
        - `reference_type`: **`App\Models\FinancialInvoiceItem`** (NOT `FinancialInvoice`).
        - `reference_id`: **Item ID** (NOT Invoice ID).
        - `invoice_id`: Invoice ID (for faster querying).
    - _Note: If an invoice has multiple items, you loop and create multiple Debit Transactions._

---

## 3. Scenario B: Paid Invoice Creation (Target Flow)

_Use Case: "Quick Pay" / POS_

### Step-by-Step Flow:

1.  **Invoice Creation**:

    - Create **`financial_invoices`** (Status: 'paid').

2.  **Item Creation**:

    - Create **`financial_invoice_items`**.

3.  **Ledger Debit (The Charge) - [CHANGED]**:

    - Create **`transactions`** (Debit).
    - **Linkage**: `reference_type` = `FinancialInvoiceItem`.
    - _Reason_: Consistent reporting. We can see "Membership Fee" vs "Maintenance Fee" in the ledger.

4.  **Receipt Creation**:

    - Create **`financial_receipts`**.

5.  **Ledger Credit (The Payment)**:

    - Create **`transactions`** (Credit).
    - **Linkage**: `reference_type` = `FinancialReceipt`.
    - `invoice_id`: Linked for convenience.

6.  **Linking (The Reconciliation) - [CHANGED]**:
    - Create **`transaction_relations`**.
    - `invoice_id`: Invoice ID.
    - `receipt_id`: Receipt ID.
    - `amount`: Allocated Amount.
    - _(Optional/Advanced)_: If we want perfect item matching, we could trace which items this pays, but normally `transaction_relations` is Invoice-Level Payment linking. The Debit is Item-Level Charge.

---

## 4. Summary of Changes Required in `FinancialController`

To align with the migration, `FinancialController` needs the following updates:

1.  **Stop** linking Debit Transactions to `FinancialInvoice`.
2.  **Start** linking Debit Transactions to `FinancialInvoiceItem`.
3.  **Ensure** every manual charge creates an Item first, then the Transaction.

| Feature             | Old Flow (Current Code)     | New Flow (Target)            |
| :------------------ | :-------------------------- | :--------------------------- |
| **Debit Reference** | `FinancialInvoice`          | **`FinancialInvoiceItem`**   |
| **Granularity**     | One Transaction per Invoice | One Transaction per **Item** |
| **Reporting**       | "Invoice #123"              | "Item: Quarterly Fee (Q1)"   |
