import { Socket } from "socket.io";
import { PrivateChatSessionUser, JoinedMessage, PrivateChatMessage } from "./types";
import { Server } from 'http';
import Message from '../models/message';

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

    socket.on("message", async ({ friend, message }: PrivateChatMessage) => {

      const personalUser = users.find((user) => user.socketId === socket.id);
      const actualReciepientObject = users.find((user) => user.name === friend);
      
      if (personalUser) {
        const socketMessage:any =  {
          sentBy: personalUser.name,
          message,
        }

        // Save message to DB
        const newMessage = new Message({
          ...socketMessage,
          recipient: friend
        });

        await newMessage.save();

        if (actualReciepientObject) {
          io.to(actualReciepientObject.socketId).emit("message", socketMessage);
        }

        io.to(personalUser.socketId).emit("message", socketMessage);
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
