import http from "http";
import _colors from 'colors';
import express from 'express';
import personalChat from './WebSockets/personalChat';
const app = express();

const server = http.createServer(app);

personalChat(server)

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server has started on port ${PORT}.`)
);
