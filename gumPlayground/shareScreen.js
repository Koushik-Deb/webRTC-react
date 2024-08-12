const shareScreen = async () => {
  try {
    const options = {
      video: true,
      audio: false,
      surfaceSwitching: "include",
    };
    mediaStream = await navigator.mediaDevices.getDisplayMedia(options);

    changeButtons([
      "green",
      "green",
      "blue",
      "blue",
      "green",
      "green",
      "green",
      "green",
    ]);
  } catch (error) {
    console.error("Error:", error);
  }
};
