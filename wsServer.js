const config = require("./wsConfig");
const http = require("http");
const express = require("express");
const app = express();

const ChatServer = new (require("./chat-utils"))(
  "WS",
  app,
  config.wsServerPort
);

const { Server } = require("socket.io");
const io = new Server(ChatServer, {
  cors: {},
});

const messageService = require("./src/messages");
const axios = require("axios");

const handle_error = (err) => {
  let header = err.request._header.split(" ");
  ChatServer.log(
    header[0],
    "|",
    header[1],
    "|",
    err.response.status,
    "|",
    err.response.data
  );
};

io.on("connection", (socket) => {
  //Token authentificatio
  axios
    .get(config.restURl + "/api/user/me", {
      headers: {
        Authorization : socket.handshake.headers.jwt
      }
    })
    .then((res) => {
      console.log(res.data.username, "is connected");
    })
    .catch((err) => {
      handle_error(err);
      socket.emit("auth_feedback", { error : "jwt expired"});
    });
  //Message
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
        handle_error(err)
      });
  });

  socket.on("disconnect", (reason) => {
    ChatServer.log(socket.id, " disconnected: ", reason);
  });
});

ChatServer.listen();
