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
    socket.on("join", ({ name, friend }: JoinedMessage) => {
      users.push({ socketId: socket.id, name, friend });
    });

    socket.on("message", async ({ friend, message }: PrivateChatMessage) => {
      
      const personalUser = users.find((user) => user.socketId === socket.id);

      const personalUserSessions = users.filter(user => personalUser!.name === user.name)
      const recipientSessions = users.filter((user) => user.name === friend);
      
      if (personalUserSessions.length > 0) {
        const socketMessage:any =  {
          sentBy: personalUserSessions[0].name,
          message,
        }

        // Save message to DB
        const newMessage = new Message({
          ...socketMessage,
          recipient: friend
        });

        await newMessage.save();

        if (recipientSessions.length > 0) {
          for (let item of recipientSessions) {
            io.to(item.socketId).emit("message", socketMessage);
          }
        }

        for (let item of personalUserSessions) {
          io.to(item.socketId).emit("message", socketMessage);
        }
      }
    });

    socket.on("typing", ({ friend, isTyping }) => {
      const personalUser = users.find((user) => user.socketId === socket.id);
      const actualReciepientObject = users.filter((user) => user.name === friend);

        if (actualReciepientObject.length > 0) {
          for (let item of actualReciepientObject) {
            io.to(item.socketId).emit("typing", { personTyping: personalUser!.name, isTyping });
          }
      }
    })

    socket.on("disconnect", () => {
      users = users.filter((item) => {
        return item.socketId !== socket.id;
      });
    });

    socket.on('end', function () {
      socket.disconnect();
    });
  });
}
