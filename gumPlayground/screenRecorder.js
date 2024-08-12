let mediaRecorder;
let recordedBlobs;
const startRecording = async () => {
  recordedBlobs = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    console.log("Data available");
    recordedBlobs.push(event.data);
  };
  mediaRecorder.start();
};

const stopRecording = async () => {
  mediaRecorder.stop();
};

const playRecording = async () => {
  const superBuffer = new Blob(recordedBlobs);
  const recordedVideoEl = document.querySelector("#other-video");
  recordedVideoEl.src = window.URL.createObjectURL(superBuffer);
  recordedVideoEl.controls = true;
  recordedVideoEl.play();
};
