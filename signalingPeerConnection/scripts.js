const socket = io("https://localhost:8181"); // connect to the signaling server
// we can use wss instead of https to connect to the signaling server
const localVideoEl = document.querySelector("#local-video");
const remoteVideoEl = document.querySelector("#remote-video");

let localStream; // This will hold the local stream object
let remoteStream; // This will hold the remote stream object
let peerConnection; // This will hold the peer connection that the two clients use to talk

let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

// when a client initiates a call, this function is called
const call = async (e) => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  localVideoEl.srcObject = stream;
  localStream = stream;

  // peerConnection is all set with our STUN servers sent over
  await createPeerConnection();

  // create offer time!
  try {
    console.log("Creating offer...");
    const offer = await peerConnection.createOffer();
    console.log("offer done ", offer);
    await peerConnection.setLocalDescription(offer);
  } catch (err) {
    console.error(err);
  }
};

const handleICECandidateEvent = (e) => {
  console.log(".......ICE candidate found!...........");
  console.log(e);
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

    peerConnection.addEventListener("icecandidate", (e) =>
      handleICECandidateEvent(e)
    );
    resolve();
  });
};

document.querySelector("#call").addEventListener("click", call);
