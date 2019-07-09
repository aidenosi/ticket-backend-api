const { Pool } = require("pg");
// Database settings
const pool = new Pool({
  user: "aiden",
  host: "localhost",
  database: "api",
  password: "102938",
  port: 5432
});

/**
 * Query for all tickets.
 */
const getTickets = (request, response) => {
  pool.query("SELECT * FROM tickets ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

/**
 * Query for a specific ticket by ID.
 */
const getTicketById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("SELECT * FROM tickets WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

/**
 * Query for new ticket.
 */
const createTicket = (request, response) => {
  const {
    name,
    email,
    phone,
    extension,
    summary,
    type,
    priority,
    category,
    subcategory,
    details
  } = request.body;

  pool.query(
    "INSERT INTO tickets (name, email, phone, extension, summary, type, priority, category, subcategory, details) VALUES ($1, $2, NULLIF($3,''), NULLIF($4,'')::smallint, $5, $6, $7, $8, $9, $10)",
    [
      name,
      email,
      phone,
      extension,
      summary,
      type,
      priority,
      category,
      subcategory,
      details
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Ticket created with ID: ${results.insertId}`);
    }
  );
};

/**
 * Query to update ticket information.
 */
const updateTicket = (request, response) => {
  const id = parseInt(request.params.id);
  const {
    name,
    email,
    phone,
    extension,
    summary,
    type,
    priority,
    category,
    subcategory,
    details
  } = request.body;

  pool.query(
    "UPDATE tickets SET name = $2, email = $3, phone = $4, extension = $5, summary = $6, type = $7,  priority = $8, category = $9, subcategory = $10, details = $11 WHERE id = $1",
    [
      id,
      name,
      email,
      phone,
      extension,
      summary,
      type,
      priority,
      category,
      subcategory,
      details
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`Ticket modified with ID: ${id}`);
    }
  );
};

/**
 * Query to delete user by ID.
 */
const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`Ticket deleted with ID: ${id}`);
  });
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket
  //deleteUser
};
