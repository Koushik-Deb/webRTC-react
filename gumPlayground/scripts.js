const videoEl = document.querySelector("#my-video");
let stream = null; // init stream var so we can use it anywhere
let mediaStream = null;
const constraints = {
  audio: true,
  video: true,
};
const getMicAndCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("Stream:", stream);
    changeButtons([
      "green",
      "blue",
      "blue",
      "grey",
      "grey",
      "grey",
      "grey",
      "grey",
    ]);
  } catch (error) {
    console.error("Error:", error);
  }
};

const showMyFeed = () => {
  console.log("showMyFeed is working");
  videoEl.srcObject = stream; // This will set our MediaStream (stream) to our <video> element
  const tracks = stream.getTracks();
  console.log("Tracks:", tracks);
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "blue",
    "grey",
    "grey",
    "blue",
  ]);
};

const stopMyFeed = () => {
  if (!stream) return console.log("No stream to stop");
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  videoEl.srcObject = null;
  stream = null;
  console.log("Stream stopped");
  changeButtons([
    "blue",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
  ]);
};

document
  .querySelector("#share")
  .addEventListener("click", (e) => getMicAndCamera(e));
document
  .querySelector("#show-video")
  .addEventListener("click", (e) => showMyFeed(e));
document
  .querySelector("#stop-video")
  .addEventListener("click", (e) => stopMyFeed(e));
document
  .querySelector("#change-size")
  .addEventListener("click", (e) => changeVideoSize(e));
document
  .querySelector("#start-record")
  .addEventListener("click", (e) => startRecording(e));
document
  .querySelector("#stop-record")
  .addEventListener("click", (e) => stopRecording(e));
document
  .querySelector("#play-record")
  .addEventListener("click", (e) => playRecording(e));
document
  .querySelector("#share-screen")
  .addEventListener("click", (e) => shareScreen(e));
