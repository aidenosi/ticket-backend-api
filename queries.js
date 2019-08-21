const { Pool } = require("pg");
// Database settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
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
const getTicketById = async (request, response) => {
  const id = parseInt(request.params.id);

  try {
    // Get individual results from each query
    var ticketResults = await pool.query(
      "SELECT * FROM tickets WHERE id = $1",
      [id]
    );
    var detailsResults = await pool.query(
      "SELECT timestamp AS timestamp, details AS details FROM details WHERE ticket_id = $1",
      [id]
    );
    let details = "";
    // Append all timestamps and details together
    for (i = detailsResults.rows.length - 1; i >= 0; i--) {
      details +=
        detailsResults.rows[i].timestamp + detailsResults.rows[i].details;
    }
    // Join results from each query
    ticketResults.rows[0].details = details;
    ticketResults.fields = [...ticketResults.fields, ...detailsResults.fields];
    ticketResults._parsers = [
      ...ticketResults._parsers,
      ...detailsResults._parsers
    ];

    response.status(200).json(ticketResults.rows);
  } catch (err) {
    console.log(err.stack);
  }
};

/**
 * Query for a search of tickets by a value.
 */
const searchTicketsAllColumns = async (request, response) => {
  const term = request.params.term;
  var query;
  query =
    "SELECT DISTINCT id, summary, status, type, priority, category, subcategory FROM tickets, details WHERE name ILIKE '%" +
    term +
    "%' OR email ILIKE '%" +
    term +
    "%' OR phone LIKE '%" +
    term +
    "%' OR CAST(extension AS TEXT) LIKE '%" +
    term +
    "%' OR summary ILIKE '%" +
    term +
    "%' OR details ILIKE '%" +
    term +
    "%' AND id=ticket_id";

  try {
    const results = await pool.query(query, []);
    response.status(200).json(results.rows);
  } catch (err) {
    console.log(error.stack);
  }
};

/**
 * Query for a search of tickets by column and value.
 */
const searchTickets = async (request, response) => {
  const column = request.params.column;
  const term = request.params.term;
  var query;
  switch (column) {
    case "contact":
      query =
        "SELECT * FROM tickets WHERE name ILIKE '%" +
        term +
        "%' OR email ILIKE '%" +
        term +
        "%' OR phone LIKE '%" +
        term +
        "%' OR CAST(extension AS TEXT) LIKE '%" +
        term +
        "%'";
      break;
    case "summary":
      query = "SELECT * FROM tickets WHERE summary ILIKE '%" + term + "%'";
      break;
    case "details":
      query =
        "SELECT * FROM tickets, details WHERE details ILIKE '%" +
        term +
        "%' AND id=ticket_id";
      break;
    default:
      query =
        "SELECT * FROM tickets WHERE " + column + " ILIKE '%" + term + "%'";
      break;
  }
  try {
    const results = await pool.query(query, []);
    response.status(200).json(results.rows);
  } catch (err) {
    console.log(err.stack);
  }
};

/**
 * Query for new ticket.
 */
const createTicket = async (request, response) => {
  var ticketID;
  const {
    name,
    email,
    phone,
    extension,
    summary,
    status,
    type,
    priority,
    category,
    subcategory,
    timestamp,
    details,
    history
  } = request.body;

  try {
    const results = await pool.query(
      "INSERT INTO tickets (name, email, phone, extension, summary, status, type, priority, category, subcategory, history) VALUES ($1, $2, NULLIF($3,''), NULLIF($4,'')::smallint, $5, $6, $7, $8, $9, $10, NULLIF($11,'')) RETURNING id",
      [
        name,
        email,
        phone,
        extension,
        summary,
        status,
        type,
        priority,
        category,
        subcategory,
        history
      ]
    );
    ticketID = results.rows[0].id;
    try {
      const results = await pool.query(
        "INSERT INTO details (ticket_id, entry_id, timestamp, details) VALUES ($1, $2, $3, $4)",
        [ticketID, 1, timestamp, details]
      );
    } catch (err) {
      console.log(err.stack);
    }
    response.status(200).send(`Ticket submitted with ID: ${ticketID}`);
  } catch (err) {
    console.log(err.stack);
  }
};

/**
 * Query to update ticket information.
 */
const updateTicket = async (request, response) => {
  const id = parseInt(request.params.id);
  const {
    name,
    email,
    phone,
    extension,
    summary,
    status,
    type,
    priority,
    category,
    subcategory,
    details,
    timestamp,
    history
  } = request.body;

  try {
    // First update information in 'tickets' table
    const results = await pool.query(
      "UPDATE tickets SET name = $2, email = $3, phone = NULLIF($4, ''), extension = NULLIF($5, '')::smallint, summary = $6, status = $7,  type = $8, priority = $9, category = $10, subcategory = $11, history = $12 WHERE id = $1",
      [
        id,
        name,
        email,
        phone,
        extension,
        summary,
        status,
        type,
        priority,
        category,
        subcategory,
        history
      ]
    );
    try {
      // Get max entry ID for corresponding ticket
      const entry_id = await pool.query(
        "SELECT MAX(entry_id) FROM details WHERE ticket_id = $1",
        [id]
      );
      const newEntry_id = entry_id.rows[0].max + 1;
      // Insert new row into 'details' table with updated new entry ID
      const results = await pool.query(
        "INSERT INTO details (ticket_id, entry_id, timestamp, details) VALUES ($1, $2, $3, $4)",
        [id, newEntry_id, timestamp, details]
      );
      response.status(200).send(`Ticket modified with ID: ${id}`);
    } catch (err) {
      console.log(err.stack);
    }
  } catch (err) {
    console.log(err.stack);
  }
};

module.exports = {
  getTickets,
  getTicketById,
  searchTicketsAllColumns,
  searchTickets,
  createTicket,
  updateTicket
};
