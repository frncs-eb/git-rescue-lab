const { calculateTotal } = require('./pricing');

let failures = 0;

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    console.error(`FAIL: ${label} — expected ${expected}, got ${actual}`);
    failures++;
  } else {
    console.log(`PASS: ${label}`);
  }
}

const items = [
  { price: 10, qty: 2 },
  { price: 5, qty: 4 },
];
// subtotal = 20 + 20 = 40

assertEqual(calculateTotal(items, null), 40, 'no discount');
assertEqual(calculateTotal(items, 'SAVE10'), 36, '10% off with SAVE10');

const bulkItems = [
  { price: 10, qty: 1 },
  { price: 10, qty: 1 },
  { price: 10, qty: 1 },
  { price: 10, qty: 1 },
  { price: 10, qty: 1 },
]; // subtotal = 50

assertEqual(calculateTotal(bulkItems, 'BULK20'), 40, '20% off with BULK20 (5+ items)');
assertEqual(calculateTotal(items, 'HOLIDAY25'), 30, '25% off with HOLIDAY25');

process.exitCode = failures > 0 ? 1 : 0;
