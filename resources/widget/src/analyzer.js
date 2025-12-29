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

// --- Helpers ---
// export function detectIDInBox(frame, box) {
//   const { x, y, w, h } = box;
//   const width = frame.width;
//   const height = frame.height;

//   let strongEdges = 0;
//   const samples = 400;
//   const threshold = 28;

//   for (let i = 0; i < samples; i++) {
//     const px = Math.floor(x + Math.random() * w);
//     const py = Math.floor(y + Math.random() * h);
//     const idx = (py * width + px) * 4;

//     if (idx < 0 || idx >= frame.data.length - 4) continue;

//     const r = frame.data[idx];

//     // Horizontal edge
//     if (px + 1 < width) {
//       const r2 = frame.data[idx + 4];
//       if (Math.abs(r - r2) > threshold) strongEdges++;
//     }

//     // Vertical edge
//     if (py + 1 < height) {
//       const r3 = frame.data[idx + width * 4];
//       if (Math.abs(r - r3) > threshold) strongEdges++;
//     }
//   }

//   const ratio = strongEdges / (samples * 2);
//   return ratio > 0.20;
// }

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