import { drawOverlay } from './overlay';
import { analyzeFrame } from './analyzer';
import { captureFrame } from './capture';
import { upload } from './uploader';
import { updateHint } from './ui';

export async function startCamera(options) {
  const root = document.getElementById("idscan-root");

  root.innerHTML = `
    <video playsinline></video>
    <canvas id="overlay"></canvas>
    <canvas id="analysis" style="display:none;"></canvas>
    <div id="idscan-hint">Starting camera...</div>
  `;

  const video = root.querySelector("video");
  const overlay = root.querySelector("#overlay");
  const analysis = root.querySelector("#analysis");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment",
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  });

  video.srcObject = stream;
  await new Promise(resolve => video.onloadedmetadata = resolve);
  await video.play();

  function resize() {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    analysis.width = video.videoWidth;
    analysis.height = video.videoHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  const overlayCtx = overlay.getContext("2d");
  const analysisCtx = analysis.getContext("2d");

  let stable = 0;
  let warmupFrames = 0;
  const WARMUP_LIMIT = 30;   // ~0.5 seconds

  function loop() {
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(loop);
      return;
    }

    // --- Warm-up phase (let autofocus settle) ---
    if (warmupFrames < WARMUP_LIMIT) {
      warmupFrames++;
      updateHint("Adjusting focus...");
      requestAnimationFrame(loop);
      return;
    }

    // --- Analysis pass ---
    analysisCtx.drawImage(video, 0, 0, analysis.width, analysis.height);
    const frame = analysisCtx.getImageData(0, 0, analysis.width, analysis.height);
    const status = analyzeFrame(frame);

    updateHint(status.message);

    // --- Overlay render ---
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    drawOverlay(overlayCtx, overlay);

    if (status.ok) stable++;
    else stable = 0;

    // Require ~0.75s of perfect stability
    if (stable > 45) {
      captureFrame(analysis).then(blob => upload(blob, options.token));
      updateHint("Captured");
      return;
    }

    requestAnimationFrame(loop);
  }

  loop();
}