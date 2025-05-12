require ("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dns = require("dns");

const app = express();

app.use(cors({origins: process.env.CORS_ORIGIN}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
  }
});


io.on("connection", (socket) => {
  
    console.log("A user connected: " + socket.id);

    const clientIp = socket.handshake.address.replace("::ffff:", "");
    console.log("Client IP: " + clientIp);

    dns.reverse(clientIp, (err, hostnames) => {
        const hostname = err ? clientIp : hostnames[0];

        socket.emit("host_info", {
            ip: clientIp,
            hostname: hostname,
        });

        
    });

    socket.on("send_message", (msg)=> {
        // Emit the message to all connected clients
        io.emit("receive_message", msg);
        console.log (`user says:  + ${msg}`);
        
    });


    socket.on("disconnect", () => {
        console.log(`user with id ${socket.id} disconnected`);
    });


});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 







