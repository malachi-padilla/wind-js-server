import { Socket } from "socket.io";
import {
  PrivateChatSessionUser,
  JoinedMessage,
  PrivateChatMessage,
  GeneralSessionUsers,
  JoinedPrivateChatMessage,
} from "./types";
import { Server } from "http";
import Message from "../models/message/message";

const socketio = require("socket.io");

export default function (server: Server): any {
  const io = socketio(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? "https://modest-yonath-f1151e.netlify.app"
          : "http://localhost:3000",
    },
  });

  let privateMessagingUsers: PrivateChatSessionUser[] = [];
  let generalUsers: GeneralSessionUsers[] = [];

  io.on("connect", (socket: Socket) => {
    socket.on(
      "joinPrivateMessage",
      ({ name, friend }: JoinedPrivateChatMessage) => {
        privateMessagingUsers.push({ socketId: socket.id, name, friend });
      }
    );

    socket.on("join", ({ name }: JoinedMessage) => {
      generalUsers.push({ socketId: socket.id, name });
    });

    socket.on("message", async ({ friend, message }: PrivateChatMessage) => {
      // Find personal user by socket connection
      const personalUser = privateMessagingUsers.find(
        (user) => user.socketId === socket.id
      );

      // Find all sessions of personal user by username
      const personalUserSessions = privateMessagingUsers.filter(
        (user) => personalUser!.name === user.name
      );

      // Find all recipient sessions by username
      let recipientSessions:
        | PrivateChatSessionUser[]
        | GeneralSessionUsers[] = privateMessagingUsers.filter(
        (user) => user.name === friend
      );
      if (recipientSessions.length === 0) {
        // No Sessions so Convert to General Session
        recipientSessions = generalUsers.filter((user) => {
          return user.name === friend;
        });
      }

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
        for (const item of recipientSessions) {
          io.to(item.socketId).emit("message", socketMessage);
        }
      }

      // Send message to all active personal user sessions
      for (const item of personalUserSessions) {
        io.to(item.socketId).emit("message", socketMessage);
      }
    });

    socket.on("typing", ({ friend, isTyping }) => {
      // Find personal user session by socket id
      const personalUser = privateMessagingUsers.find(
        (user) => user.socketId === socket.id
      );

      // Cop all recipient sessions by username
      const recipientSessions = privateMessagingUsers.filter(
        (user) => user.name === friend
      );

      if (recipientSessions.length > 0) {
        // Broadcast to all active recipient sessions who is typing, and if they are.
        for (const item of recipientSessions) {
          io.to(item.socketId).emit("typing", {
            personTyping: personalUser!.name,
            isTyping,
          });
        }
      }
    });

    socket.on("disconnect", () => {
      privateMessagingUsers = privateMessagingUsers.filter((item) => {
        return item.socketId !== socket.id;
      });
      generalUsers = generalUsers.filter((item) => {
        return item.socketId !== socket.id;
      });
    });

    socket.on("disconnectPrivateMessage", () => {
      privateMessagingUsers = privateMessagingUsers.filter((item) => {
        return item.socketId !== socket.id;
      });
    });

    socket.on("end", function () {
      socket.disconnect();
    });
  });
}
