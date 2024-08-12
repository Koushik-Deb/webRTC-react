const localVideoEl = document.querySelector("#local-video");
const remoteVideoEl = document.querySelector("#remote-video");

let localStream; // This will hold the local stream object
let remoteStream; // This will hold the remote stream object
let peerConnection; // This will hold the peer connection that the two clients use to talk

// when a client initiates a call, this function is called
const call = async (e) => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  localVideoEl.srcObject = stream;
};

document.querySelector("#call").addEventListener("click", call);
