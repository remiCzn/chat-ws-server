const axios = require("axios");
const config = require('../wsConfig')

module.exports = {
    newMessage : (data, socket) => {
        console.log(socket.id, " send:", data.content)
        axios
          .post(config.restURl + "/api/message/post", {
            jwt: data.token,
            content: data.content,
          })
          .then((result) => {
            io.sockets.emit("message", result.data);
          })
          .catch((err) => {
            console.log("Error when requesting API: ", err.code);
          });
    }
}