let lastFrame = null;

export function analyzeFrame(frame) {
  const brightness = calcBrightness(frame);
  const blur = calcBlur(frame);
  const motion = calcMotion(frame);

  if (brightness < 60) return { ok: false, message: "Too dark" };
  if (brightness > 220) return { ok: false, message: "Too bright" };

  // if (blur < 30) return { ok: false, message: "Image is blurry" };
  if (motion > 25) return { ok: false, message: "Hold still" };

  return { ok: true, message: "Hold steady" };
}

// --- Helpers ---

function calcBrightness(frame) {
  let total = 0;
  for (let i = 0; i < frame.data.length; i += 4) {
    total += frame.data[i];
  }
  return total / (frame.data.length / 4);
}

function calcBlur(frame) {
  let sum = 0;
  for (let i = 0; i < frame.data.length; i += 4) {
    sum += Math.abs(frame.data[i] - frame.data[i + 4] || 0);
  }
  return sum / (frame.data.length / 4);
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