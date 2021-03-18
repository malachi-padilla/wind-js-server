const http = require("http");
const colors = require("colors");
const express = require("express");
const app = express();

const server = http.createServer(app);
require("./WebSockets/personalChat")(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server has started on port ${PORT}.`.magenta.bold)
);
