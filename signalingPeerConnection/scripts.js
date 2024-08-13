// we can always log peerConnection.signalingState to see the state of the peer connection to debug code

const userName = "Koushik-" + Math.floor(Math.random() * 1000);
const password = "X";
document.querySelector("#user-name").innerHTML = userName;

const socket = io("https://localhost:8181", {
  auth: {
    userName,
    password,
  },
}); // connect to the signaling server
// we can use wss instead of https to connect to the signaling server
const localVideoEl = document.querySelector("#local-video");
const remoteVideoEl = document.querySelector("#remote-video");

let localStream; // This will hold the local stream object
let remoteStream; // This will hold the remote stream object
let peerConnection; // This will hold the peer connection that the two clients use to talk
let didIOffer = false; // This will be used to determine if the client is the one who initiated the call

let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

const fetchUserMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    localVideoEl.srcObject = stream;
    localStream = stream;
  } catch (err) {
    console.error("Error in fetch User Media", err);
  }
};

// when a client initiates a call, this function is called
const call = async (e) => {
  await fetchUserMedia();

  // peerConnection is all set with our STUN servers sent over
  await createPeerConnection();

  // create offer time!
  try {
    console.log("Creating offer...");
    const offer = await peerConnection.createOffer();
    console.log("offer done ", offer);
    await peerConnection.setLocalDescription(offer);
    didIOffer = true;
    // send the offer to the signaling server
    socket.emit("newOffer", offer);
  } catch (err) {
    console.error(err);
  }
};

const handleICECandidateEvent = (e) => {
  console.log(".......ICE candidate found!...........");
  console.log(e);
  if (e.candidate) {
    socket.emit("sendIceCandidateToSignalingServer", {
      iceCandidate: e.candidate,
      iceUserName: userName,
      didIOffer,
    });
  }
};

const answerOffer = async (offerObj) => {
  await fetchUserMedia();
  await createPeerConnection();
  peerConnection.setRemoteDescription(offerObj.offer);
  const answer = await peerConnection.createAnswer();
  peerConnection.setLocalDescription(answer);
  console.log("Answering offer ", offerObj);
  console.log("Answer ", answer);

  // emit the answer to the signaling server
  offerObj.answer = answer;
  socket.emit("newAnswer", offerObj);
};

const createPeerConnection = () => {
  return new Promise(async (resolve, reject) => {
    //RTCPeerConnection is a WebRTC API that sets up a peer connection between the local client and a remote peer
    //We can pass a config object to the RTCPeerConnection constructor to specify the ICE servers to use
    //ICE servers will fetch us ICE candidates that we can use to establish a connection with the remote peer
    peerConnection = await new RTCPeerConnection(peerConfiguration);

    // need to add local streams to the peer connection so that the remote peer can see us
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener("signalingstatechange", (event) => {
      console.log(
        "Signaling state change ",
        peerConnection.signalingState,
        " event "
      );
    });

    peerConnection.addEventListener("icecandidate", (e) =>
      handleICECandidateEvent(e)
    );
    resolve(peerConnection);
  });
};

document.querySelector("#call").addEventListener("click", call);
