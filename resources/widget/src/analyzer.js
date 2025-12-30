let lastFrame = null;

export function analyzeFrame(frame, overlayBox) {

  const brightness = calcBrightness(frame);
  const motion = calcMotion(frame);

  if (brightness < 60) {
    return {
      ok: false,
      state: "error",
      message: "Too dark"
    };
  }

  if (brightness > 220) {
    return {
      ok: false,
      state: "error",
      message: "Too bright"
    };
  }

  if (motion > 25) {
    return {
      ok: false,
      state: "idle",
      message: "Hold still"
    };
  }

  return {
    ok: true,
    state: "ready",
    message: "Hold steady"
  };
}

function calcBrightness(frame) {
  let total = 0;
  for (let i = 0; i < frame.data.length; i += 4) {
    total += frame.data[i];
  }
  return total / (frame.data.length / 4);
}

function calcMotion(frame) {
  if (!lastFrame) {
    lastFrame = frame;
    return 0;
  }

  let diff = 0;
  for (let i = 0; i < frame.data.length; i += 4) {
    diff += Math.abs(frame.data[i] - lastFrame.data[i]);
  }

  lastFrame = frame;
  return diff / (frame.data.length / 4);
}