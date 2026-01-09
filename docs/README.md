# AFOHS Club - Financial Module Documentation

Welcome to the documentation for the AFOHS Club Financial System.

## Documentation Index

1.  [**Invoice Creation Workflow**](./invoice_creation_flow.md)
    - Detailed explanation of how the "Create Transaction" page works.
    - Frontend states, Backend processing, and Payment logic.
2.  [**System Architecture**](./system_architecture.md)
    - Entity Relationship Diagrams (ERD).
    - Model descriptions and relationships.
    - Directory structure.
3.  [**Validations**](./validations.md)
    - List of rules preventing invalid data.
    - Date overlap checks and status transitions.

## Quick Start

### Creating a Transaction

Go to `Finance > Transaction > Add`.

1.  **Select Member**: The system will auto-load their ledger balance.
2.  **Add Items**: Choose "Maintenance Fee" or "Subscription".
3.  **Review**: Check the "Quarter Payment Status" accordion.
4.  **Save**: Click "Save" (Unpaid) or "Save & Receive" (Paid).

### Viewing History

Go to `Finance > Transaction`.

- Use filters for **Status**, **Type**, and **Date Range**.
- Hover over "Multiple Items" to see breakdown.
