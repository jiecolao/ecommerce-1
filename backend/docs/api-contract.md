# API Contract (Placeholder)

All responses follow:

```json
{
  "ok": true,
  "data": {}
}
```

or

```json
{
  "ok": false,
  "error": "message"
}
```

## Buyer Checkout

- Method: `POST`
- Path: `/api/buyer/checkout`
- Body:

```json
{
  "billingName": "Jane Doe",
  "billingEmail": "jane@example.com",
  "notes": "optional",
  "items": [
    { "productId": "cuid", "quantity": 2 }
  ]
}
```

- Behavior:
  - Verifies product status and stock.
  - Creates order and order items.
  - Decrements inventory.
  - Creates invoice.

## Seller Reports

- Method: `GET`
- Path: `/api/seller/reports`
- Output:
  - totals (productCount, unitsSold, revenueCents)
  - topProducts list
