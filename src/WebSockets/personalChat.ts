import { Socket } from "socket.io";
import {
  PrivateChatSessionUser,
  JoinedMessage,
  PrivateChatMessage,
} from "./types";
import { Server } from "http";
import Message from "../models/message";

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
      // Find personal user by socket connection
      const personalUser = users.find((user) => user.socketId === socket.id);

      // Find all sessions of personal user by username
      const personalUserSessions = users.filter(
        (user) => personalUser!.name === user.name
      );

      // Find all recipient sessions by username
      const recipientSessions = users.filter((user) => user.name === friend);

      const socketMessage: any = {
        sentBy: personalUserSessions[0].name,
        message,
      };

      // Save message to DB
      const newMessage = new Message({
        ...socketMessage,
        recipient: friend,
      });

      await newMessage.save();

      if (recipientSessions.length > 0) {
        // Send message to all active recipient sessions
        for (let item of recipientSessions) {
          io.to(item.socketId).emit("message", socketMessage);
        }
      }

      // Send message to all active personal user sessions
      for (let item of personalUserSessions) {
        io.to(item.socketId).emit("message", socketMessage);
      }
    });

    socket.on("typing", ({ friend, isTyping }) => {
      // Find personal user session by socket id
      const personalUser = users.find((user) => user.socketId === socket.id);

      // Cop all recipient sessions by username
      const recipientSessions = users.filter((user) => user.name === friend);

      if (recipientSessions.length > 0) {
        // Broadcast to all active recipient sessions who is typing, and if they are.
        for (let item of recipientSessions) {
          io.to(item.socketId).emit("typing", {
            personTyping: personalUser!.name,
            isTyping,
          });
        }
      }
    });

    socket.on("disconnect", () => {
      users = users.filter((item) => {
        return item.socketId !== socket.id;
      });
    });

    socket.on("end", function () {
      socket.disconnect();
    });
  });
}
