const videoEl = document.querySelector("#my-video");
let stream = null; // init stream var so we can use it anywhere
const constraints = {
  audio: true,
  video: true,
};
const getMicAndCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("Stream:", stream);
  } catch (error) {
    console.error("Error:", error);
  }
};

const showMyFeed = () => {
  console.log("showMyFeed is working");
  videoEl.srcObject = stream; // This will set our MediaStream (stream) to our <video> element
  const tracks = stream.getTracks();
  console.log("Tracks:", tracks);
};

const stopMyFeed = () => {
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  videoEl.srcObject = null;
  stream = null;
  console.log("Stream stopped");
};

document.querySelector("#share").addEventListener("click", getMicAndCamera);
document.querySelector("#show-video").addEventListener("click", showMyFeed);
document.querySelector("#stop-video").addEventListener("click", stopMyFeed);
