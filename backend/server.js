const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    users[socket.id] = { name: `User ${socket.id.slice(0, 4)}`, steps: 0 };

    io.emit("updateLeaderboard", Object.values(users));

    socket.on("incrementSteps", () => {
        users[socket.id].steps += 1;
        io.emit("updateLeaderboard", Object.values(users));
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete users[socket.id];
        io.emit("updateLeaderboard", Object.values(users));
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));
