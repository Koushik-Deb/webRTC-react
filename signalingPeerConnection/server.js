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

  socket.on("newAnswer", (offerObj, ackFunction) => {
    console.log("new answer received ");
    //emit this answer (offerObj) back to the offerer
    const socketToAnswer = connectedSockets.find(
      (socket) => socket.userName === offerObj.offererUserName
    );
    if (!socketToAnswer) {
      console.log("No matching socket");
      return;
    }
    //we found the matching socket, so we can emit to it
    const socketIdToAnswer = socketToAnswer.socketId;

    // we find the offer to update so we can emit it
    const offerToUpdate = offers.find(
      (o) => o.offererUserName === offerObj.offererUserName
    );
    if (!offerToUpdate) {
      console.log("No matching offer");
      return;
    }
    //send back to the answerer all the ice candidates that the offerer has sent
    ackFunction(offerToUpdate.offerIceCandidates);
    offerToUpdate.answer = offerObj.answer;
    offerToUpdate.answererUserName = userName;

    //emit the answer to the offerer
    io.to(socketIdToAnswer).emit("answerResponse", offerToUpdate);
  });

  socket.on("sendIceCandidateToSignalingServer", (iceCandidateObject) => {
    const { iceCandidate, iceUserName, didIOffer } = iceCandidateObject;
    if (didIOffer) {
      const offerInOffers = offers.find(
        (offer) => offer.offererUserName === iceUserName
      );
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate);
        // 1. When the answerer answers, all existing ICE candidates are sent
        // 2. Any candidate that comes in after the answer is sent is sent automatically
        if (offerInOffers.answererUserName) {
          //pass it through to the answerer
          const socketToSendTo = connectedSockets.find(
            (socket) => socket.userName === offerInOffers.answererUserName
          );
          if (socketToSendTo) {
            socket
              .to(socketToSendTo.socketId)
              .emit("receivedIceCandidateFromServer", iceCandidate);
          }
        }
      }
    }
    // Else I am the answerer, so I will send it to the offerer
    else {
      const offerInOffers = offers.find(
        (offer) => offer.answererUserName === iceUserName
      );
      const socketToSendTo = connectedSockets.find(
        (socket) => socket.userName === offerInOffers.offererUserName
      );
      if (socketToSendTo) {
        socket
          .to(socketToSendTo.socketId)
          .emit("receivedIceCandidateFromServer", iceCandidate);
      }
    }
  });
});
