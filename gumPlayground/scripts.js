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

document.querySelector("#share").addEventListener("click", getMicAndCamera);
