const config = require("./wsConfig");
const http = require("http");
const express = require("express");
const app = express();

const ChatServer = new (require('./chat-utils'))("WS", app, config.wsServerPort);

const { Server } = require("socket.io");
const io = new Server(ChatServer, {
  cors: {},
});

const messageService = require("./src/messages");
const axios = require("axios");


io.on("connection", (socket) => {
  ChatServer.log(socket.id, " is connected");
  socket.on("new_message", (data) => {
    ChatServer.log(socket.id, " send:", data.content);
    axios
      .post(config.restURl + "/api/message/post", {
        jwt: data.token,
        content: data.content,
      })
      .then((result) => {
        io.sockets.emit("message", result.data);
      })
      .catch((err) => {
        ChatServer.log("Error when requesting API: ", err.code);
        ChatServer.log(err);
      });
  });

  socket.on("disconnect", (reason) => {
    ChatServer.log(socket.id, " disconnected: ", reason);
  });
});

ChatServer.listen();
