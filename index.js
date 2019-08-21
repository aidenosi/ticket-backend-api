const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const db = require("./queries");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());

app.get("/", (request, response) => {
  response.json({ info: "RESTful API for backend of ticketing system." });
});

app.get("/tickets", db.getTickets);
app.get("/tickets/:id", db.getTicketById);
app.get("/search/:term", db.searchTicketsAllColumns);
app.get("/search/:column/:term", db.searchTickets);
app.post("/tickets", db.createTicket);
app.put("/tickets/:id", db.updateTicket);

app.listen(process.env.PORT || 5000);
