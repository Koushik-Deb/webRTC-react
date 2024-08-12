const fs = require("fs");
const https = require("https");
const express = require("express");
const socketio = require("socket.io");
const app = express();
app.use(express.static(__dirname));

// key and cert to run https server
const key = fs.readFileSync("cert.key");
const cert = fs.readFileSync("cert.crt");

const expressServer = https.createServer({ key, cert }, app);
const io = socketio(expressServer);

expressServer.listen(8181);

//offers will contain {}
const offers = [
  //offererUserName
  //offer
  //offerIceCandidates
  //answererUserName
  //answer
  //answerIceCandidates
];

const connectedSockets = [
  //userName
  //socketId
];

io.on("connection", (socket) => {
  console.log("Someone has connected ", socket.id);
  const userName = socket.handshake.auth.userName;
  const password = socket.handshake.auth.password;

  if (password !== "X") {
    socket.disconnect(true);
  }

  connectedSockets.push({
    userName,
    socketId: socket.id,
  });

  socket.on("newOffer", (newOffer) => {
    console.log("new offer received ");
    offers.push({
      offererUserName: userName,
      offer: newOffer,
      offerIceCandidates: [],
      answererUserName: null,
      answer: null,
      answerIceCandidates: [],
    });
    //send out to all connected sockets Except the one that sent the offer
    socket.broadcast.emit("newOfferAwaiting", offers.slice(-1));
  });
});
