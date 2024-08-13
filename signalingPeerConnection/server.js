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

  // a new client has joined. If there are any offers, send them the offers
  if (offers.length > 0) {
    socket.emit("availableOffers", offers);
  }

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

  socket.on("newAnswer", (offerObj) => {
    console.log("new answer received ");
    //emit this answer (offerObj) back to the offerer
    const socketToAnswer = connectedSockets.find(
      (socket) => socket.userName === offerObj.offererUserName
    );
    if (!socketToAnswer) {
      return;
    }
    //we found the matching socket, so we can emit to it
    const socketIdToAnswer = socketToAnswer.socketId;
  });

  socket.on("sendIceCandidateToSignalingServer", (iceCandidateObject) => {
    const { iceCandidate, iceUserName, didIOffer } = iceCandidateObject;
    if (didIOffer) {
      const offerInOffers = offers.find(
        (offer) => offer.offererUserName === iceUserName
      );
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate);
        // come back to this ...
        // if the answerer is already here, emit the ice candidate to them
      }
    }
    // Else I am the answerer, so I will wait for the offer to come in
    else {
    }
  });
});
