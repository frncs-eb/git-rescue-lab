# Checkout Pricing Service

Calculates order totals with support for discount codes.

## Usage

```js
const { calculateTotal } = require('./pricing');
calculateTotal(items, 'SAVE10');
```

## Discount Codes

- `SAVE10` — 10% off any order
- `BULK20` — 20% off orders of 5+ items

## Testing

```
node test.js
```
