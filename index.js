const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3001;
const db = require("./queries");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (request, response) => {
  response.json({ info: "RESTful API for backend of ticketing system." });
});

app.get("/tickets", db.getTickets);
app.get("/tickets/:id", db.getTicketById);
//app.get("/search/:term", db.searchTicketsAllColumns);
app.get("/search/:column/:term", db.searchTickets);
app.post("/tickets", db.createTicket);
app.put("/tickets/:id", db.updateTicket);
//app.delete("/users/:id", db.deleteUser);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
