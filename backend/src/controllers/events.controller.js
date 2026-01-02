const pool = require("../db");

exports.createEvent = async (req, res) => {
  const { name, description, start_date_time, end_date_time, category_ids } = req.body;
  // Required input validation
  if (!name || !start_date_time || !end_date_time) {
    return res.status(400).json({ message: "Fields: name, start and end date/time are required" });
  }

  try {
    const overlapQuery = `
      SELECT 1
      FROM events
      WHERE start_date_time < $1
      AND end_date_time > $2
      LIMIT 1
    `;
    const overlapResult = await pool.query(overlapQuery, [end_date_time, start_date_time]);
    if (overlapResult.rowCount > 0) {
      return res.status(409).json({ message: "Event overlaps with existing event" });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const insertEventQuery = `
        INSERT INTO events (name, description, start_date_time, end_date_time)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, description, start_date_time, end_date_time
      `;
      const eventRes = await client.query(insertEventQuery, [name, description, start_date_time, end_date_time]);
      const event = eventRes.rows[0];

      // Insert into intermediate table if categories exist
      if (category_ids && category_ids.length > 0) {
        const insertCategoryQuery = `
          INSERT INTO event_categories (event_id, category_id)
          VALUES ($1, $2)
        `;
        for (const catId of category_ids) {
          await client.query(insertCategoryQuery, [event.id, catId]);
        }
      }
      await client.query("COMMIT");
      res.status(201).json({ message: "Event created successfully", event });

    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ message: `Server error during event creation: ${err.message}` });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ message: `Internal server error: ${err.message}` });
  }
};

exports.getEvents = async (req, res) => {
  try {
    // Query params for pagination & filter
    let { page = 1, limit = 10, category_id } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let query, params;
    if (category_id) {
      // Filter by category
      query = `
        SELECT e.id, e.name, e.description, e.start_date_time, e.end_date_time,
               json_agg(c.name) AS categories
        FROM events e
        JOIN event_categories ec ON e.id = ec.event_id
        JOIN categories c ON c.id = ec.category_id
        WHERE c.id = $1
        GROUP BY e.id
        ORDER BY e.start_date_time ASC
        LIMIT $2 OFFSET $3
      `;
      params = [category_id, limit, offset];
    } else {
      query = `
        SELECT e.id, e.name, e.description, e.start_date_time, e.end_date_time,
               json_agg(c.name) AS categories
        FROM events e
        LEFT JOIN event_categories ec ON e.id = ec.event_id
        LEFT JOIN categories c ON c.id = ec.category_id
        GROUP BY e.id
        ORDER BY e.start_date_time ASC
        LIMIT $1 OFFSET $2
      `;
      params = [limit, offset];
    }

    const result = await pool.query(query, params);
    res.status(200).json({ page, limit, count: result.rowCount, events: result.rows, message: "Events fetched successfully" });
  } catch (err) {
    res.status(500).json({ message: "Events not fetched!" });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, start_date_time, end_date_time, category_ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE events
       SET name=$1, description=$2, start_date_time=$3, end_date_time=$4, updated_at=NOW()
       WHERE id=$5`,
      [name, description, start_date_time, end_date_time, id]
    );

    await client.query(`DELETE FROM event_categories WHERE event_id=$1`, [id]);
    if (category_ids?.length) {
      for (const catId of category_ids) {
        await client.query(
          `INSERT INTO event_categories (event_id, category_id)
           VALUES ($1,$2)`,
          [id, catId]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Event updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: `Server error: ${err.message}` });
  } finally {
    client.release();
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM events WHERE id=$1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: `Error deleting event: ${err.message}` });
  }
};

exports.getCategories = async () => {
  const result = await pool.query("SELECT * FROM categories ORDER BY name");
  return result.rows;
};
