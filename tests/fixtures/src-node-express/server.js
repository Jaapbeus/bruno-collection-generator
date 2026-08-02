// Synthetic fixture. Routes are mounted under a prefix, which the card says to follow.
const express = require('express');
const app = express();
const router = express.Router();

router.get('/', async (req, res) => {
  const { country, limit } = req.query;
  res.json({ widgets: [] });
});

router.get('/:id', async (req, res) => {
  res.json({ id: req.params.id });
});

router.post('/', async (req, res) => {
  const { widgetName, quantity } = req.body;
  res.status(201).json({ widgetName, quantity });
});

app.use('/api/widgets', router);
module.exports = app;
