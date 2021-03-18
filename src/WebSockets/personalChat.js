const socketio = require("socket.io");

module.exports = function(server) {

    const io = socketio(server, {
        cors: {
        origin: "http://localhost:3000",
        },
    });
    
    let users = [];

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
}
