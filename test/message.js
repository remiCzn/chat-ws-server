const io = require("socket.io-client");
const config = require("../wsConfig");

const ioClient = io.connect("http://localhost:"+config.wsServerPort);

ioClient.emit("new_message", {
    token: "1234",
    content: "Hello world"
})
console.log("emit")