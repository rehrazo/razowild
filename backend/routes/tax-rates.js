const express = require('express');

const router = express.Router();

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// GET /api/tax-rates — list all tax groups (public, no auth required for reads)
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const [rows] = await pool.execute(
      'SELECT tax_group_id AS id, name, rate FROM tax_groups ORDER BY tax_group_id ASC'
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tax-rates — create a new tax group (admin write)
router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const name = String(req.body?.name || '').trim();
  const rate = toNumber(req.body?.rate);

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  if (rate === null || rate < 0 || rate > 1) {
    return res.status(400).json({ error: 'rate must be a decimal fraction between 0 and 1 (e.g. 0.1 for 10%)' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO tax_groups (name, rate) VALUES (?, ?)',
      [name, rate]
    );

    const [[row]] = await pool.execute(
      'SELECT tax_group_id AS id, name, rate FROM tax_groups WHERE tax_group_id = ?',
      [result.insertId]
    );

    return res.status(201).json(row);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/tax-rates/:id — update a tax group (admin write)
router.put('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const id = toNumber(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const name = String(req.body?.name || '').trim();
  const rate = toNumber(req.body?.rate);

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  if (rate === null || rate < 0 || rate > 1) {
    return res.status(400).json({ error: 'rate must be a decimal fraction between 0 and 1 (e.g. 0.1 for 10%)' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE tax_groups SET name = ?, rate = ? WHERE tax_group_id = ?',
      [name, rate, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Tax group not found' });
    }

    const [[row]] = await pool.execute(
      'SELECT tax_group_id AS id, name, rate FROM tax_groups WHERE tax_group_id = ?',
      [id]
    );

    return res.json(row);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tax-rates/:id — delete a tax group (admin write)
router.delete('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const id = toNumber(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    const [result] = await pool.execute(
      'DELETE FROM tax_groups WHERE tax_group_id = ?',
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Tax group not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
