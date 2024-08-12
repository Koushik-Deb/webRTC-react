let mediaRecorder;
let recordedBlobs;
const startRecording = async () => {
  //change stream to mediaStream in this function to record screen sharing as well
  if (!stream) return console.log("No stream to record");
  recordedBlobs = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    console.log("Data available");
    recordedBlobs.push(event.data);
  };
  mediaRecorder.start();
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "blue",
    "grey",
    "blue",
  ]);
};

const stopRecording = async () => {
  if (!mediaRecorder) return console.log("No media recorder to stop");
  mediaRecorder.stop();
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "green",
    "blue",
    "blue",
  ]);
};

const playRecording = async () => {
  if (!recordedBlobs) return console.log("No recording to play");
  const superBuffer = new Blob(recordedBlobs);
  const recordedVideoEl = document.querySelector("#other-video");
  recordedVideoEl.src = window.URL.createObjectURL(superBuffer);
  recordedVideoEl.controls = true;
  recordedVideoEl.play();
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "green",
    "green",
    "blue",
  ]);
};
