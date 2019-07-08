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
    phoneNum,
    ext,
    summary,
    type,
    priority,
    category,
    subcategory,
    details
  } = request.body;

  pool.query(
    "INSERT INTO tickets (name, email, phoneNum, ext, summary, type, priority, category, subcategory, details) VALUES ($1, $2)",
    [
      name,
      email,
      phoneNum,
      ext,
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
      response.status(201).send(`User added with ID: ${results.insertId}`);
      console.log(results.insertId);
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
    phoneNum,
    ext,
    summary,
    type,
    priority,
    category,
    subcategory,
    details
  } = request.body;

  pool.query(
    "UPDATE tickets SET name = $2, email = $3, phoneNum = $4, ext = $5, summary = $6, priority = $7, category = $8, subcategory = $9, details = $10 WHERE id = $1",
    [
      id,
      name,
      email,
      phoneNum,
      ext,
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
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket
  //deleteUser
};
