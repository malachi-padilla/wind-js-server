const http = require("http");
const colors = require("colors");
const express = require("express");
const socketio = require("socket.io");
const app = express();

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];
const PORT = process.env.PORT || 5000;

io.on("connect", (socket) => {
  console.log("user has connected".cyan.bold);
  socket.on("join", ({ name, friend }) => {
    users.push({ socketId: socket.id, name, friend });
  });

  socket.on("message", ({ friend, message }) => {
    const personalUser = users.find((user) => user.socketId === socket.id);

    const actualReciepientObject = users.find((user) => user.name === friend);

    io.to(actualReciepientObject.socketId).emit("message", {
      sentBy: personalUser.name,
      message,
    });

    io.to(personalUser.socketId).emit("message", {
      sentBy: personalUser.name,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("user has left".red.bold);
    users = users.filter((item) => {
      return item.socketId !== socket.id;
    });
  });
});

server.listen(PORT, () =>
  console.log(`Server has started on port ${PORT}.`.magenta.bold)
);
