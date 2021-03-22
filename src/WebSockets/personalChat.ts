import { Socket } from "socket.io";
import { PrivateChatSessionUser, PrivateChatMessage, JoinedMessage } from "./types";
import { Server } from 'http';

const socketio = require("socket.io");

export default function (server: Server): any {
  const io = socketio(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  let users: PrivateChatSessionUser[] = [];

  io.on("connect", (socket: Socket) => {
    console.log("user has connected");
    socket.on("join", ({ name, friend }: JoinedMessage) => {
      users.push({ socketId: socket.id, name, friend });
    });

    socket.on("message", ({ friend, message }: PrivateChatMessage) => {

      const personalUser = users.find((user) => user.socketId === socket.id);
      const actualReciepientObject = users.find((user) => user.name === friend);

      if (personalUser) {
        if (actualReciepientObject) {
          io.to(actualReciepientObject.socketId).emit("message", {
            sentBy: personalUser.name,
            message,
          });
        }
        io.to(personalUser.socketId).emit("message", {
          sentBy: personalUser.name,
          message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("user has left");
      users = users.filter((item) => {
        return item.socketId !== socket.id;
      });
    });

    socket.on('end', function () {
      socket.disconnect();
    });
  });
}
