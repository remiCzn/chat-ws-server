const config = require("./wsConfig");
const http = require("http");
const express = require("express");
const app = express();

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(process.env.PORT || config.wsServerPort);

app.set("port", port);
const server = http.createServer(app);

server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const address = server.address();
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log("Socket server listening on " + bind);
});

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {},
});
const axios = require("axios");

io.on("connection", (socket) => {
  socket.on("new_message", (data) => {
    axios
      .post(config.restURl + "/api/message/post", {
        jwt: data.token,
        content: data.content,
      })
      .then((result) => {
        io.sockets.emit("message", result.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

server.listen(port);
