const express = require('express');
const redis = require('redis');
const { promisify } = require('util');

// Create an Express app
const app = express();
const port = 1245;

// Sample product list
const listProducts = [
  { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
  { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
  { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
  { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 },
];

// Redis client setup
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Function to get a product by ID
function getItemById(id) {
  return listProducts.find(product => product.itemId === id);
}

// Reserve stock for a product by itemId
async function reserveStockById(itemId, stock) {
  await setAsync(`item.${itemId}`, stock);
}

// Get current reserved stock for a product by itemId
async function getCurrentReservedStockById(itemId) {
  const reservedStock = await getAsync(`item.${itemId}`);
  return reservedStock ? parseInt(reservedStock, 10) : 0;
}

// List all products
app.get('/list_products', (req, res) => {
  const products = listProducts.map(({ itemId, itemName, price, initialAvailableQuantity }) => ({
    itemId,
    itemName,
    price,
    initialAvailableQuantity,
  }));
  res.json(products);
});

// Get product details by itemId
app.get('/list_products/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const product = getItemById(parseInt(itemId, 10));

  if (!product) {
    return res.status(404).json({ status: 'Product not found' });
  }

  const reservedStock = await getCurrentReservedStockById(itemId);
  const availableStock = product.initialAvailableQuantity - reservedStock;

  res.json({
    ...product,
    currentQuantity: availableStock,
  });
});

// Reserve product by itemId
app.get('/reserve_product/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const product = getItemById(parseInt(itemId, 10));

  if (!product) {
    return res.status(404).json({ status: 'Product not found' });
  }

  const reservedStock = await getCurrentReservedStockById(itemId);
  const availableStock = product.initialAvailableQuantity - reservedStock;

  if (availableStock <= 0) {
    return res.status(400).json({ status: 'Not enough stock available', itemId });
  }

  // Reserve one item
  await reserveStockById(itemId, reservedStock + 1);
  res.json({ status: 'Reservation confirmed', itemId });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

