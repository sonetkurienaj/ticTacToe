const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { addUser, getRoomInfo, addTurn } = require("./utils/room");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("clicked", (options, callback) => {
    const { cell, side, room } = options;
    console.log(options, socket.id);
    addTurn(room, cell, side, socket.id);
    io.to(room).emit("roomData", {
      room: getRoomInfo(room),
    });
  });

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    } else {
      socket.join(user.room);

      io.to(user.room).emit("roomData", {
        room: getRoomInfo(user.room),
      });

      callback();
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on http://localhost:${port}`);
});
