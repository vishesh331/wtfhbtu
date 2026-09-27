// Minimal WebRTC signaling + matchmaking server
// Video/audio happens PEER-TO-PEER between browsers.
// This server only pairs people up and relays signaling messages.

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let waiting = null; // socket.id of the person currently waiting for a match
const partners = new Map(); // socket.id -> partner socket.id

function clearPartner(id) {
  const p = partners.get(id);
  if (p) {
    partners.delete(id);
    partners.delete(p);
    io.to(p).emit("partner-left");
  }
}

io.on("connection", (socket) => {
  console.log("connected:", socket.id, "| online:", io.engine.clientsCount);

  socket.on("find-partner", () => {
    // If already paired, unpair first
    clearPartner(socket.id);

    if (waiting && waiting !== socket.id && io.sockets.sockets.get(waiting)) {
      const partnerId = waiting;
      waiting = null;
      partners.set(socket.id, partnerId);
      partners.set(partnerId, socket.id);

      // Tell both sides they're matched. One side is designated "initiator"
      // (creates the WebRTC offer) to avoid both sides offering at once.
      io.to(partnerId).emit("matched", { initiator: true });
      io.to(socket.id).emit("matched", { initiator: false });
    } else {
      waiting = socket.id;
      socket.emit("waiting");
    }
  });

  // Relay WebRTC signaling data (offers/answers/ICE candidates) to the partner
  socket.on("signal", (data) => {
    const partnerId = partners.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("signal", data);
    }
  });

  socket.on("skip", () => {
    clearPartner(socket.id);
    socket.emit("left");
  });

  socket.on("disconnect", () => {
    if (waiting === socket.id) waiting = null;
    clearPartner(socket.id);
    console.log("disconnected:", socket.id, "| online:", io.engine.clientsCount);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
