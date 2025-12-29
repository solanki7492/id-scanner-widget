import { drawOverlay, getOverlayBox } from './overlay';
import { analyzeFrame } from './analyzer';
import { captureFrame } from './capture';
import { upload } from './uploader';

export async function startCamera(options, onClose) {
  const container = document.getElementById("idscan-widget-camera-container");
  const statusEl = document.getElementById("idscan-widget-status");

  const video = container.querySelector("video");
  const overlay = container.querySelector("#idscan-widget-overlay");
  const analysis = container.querySelector("#idscan-widget-analysis");

  let isRunning = true;
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });

    video.srcObject = stream;
    await new Promise(resolve => video.onloadedmetadata = resolve);
    await video.play();

    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    analysis.width = video.videoWidth;
    analysis.height = video.videoHeight;

    const overlayCtx = overlay.getContext("2d");
    const analysisCtx = analysis.getContext("2d");

    let stable = 0;
    let warmupFrames = 0;

    function cleanup() {
      isRunning = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (onClose) onClose();
    }

    window.addEventListener("idscan-cleanup", cleanup, { once: true });

  function detectSomething(imageData) {
      let min = 255, max = 0;
      let edgeHits = 0;
      let smoothHits = 0;

      const samples = 400;
      const edgeThreshold = 26;

      const { data, width, height } = imageData;

      for (let i = 0; i < samples; i++) {
        const px = Math.floor(Math.random() * width);
        const py = Math.floor(Math.random() * height);
        const idx = (py * width + px) * 4;

        const v = data[idx];

        min = Math.min(min, v);
        max = Math.max(max, v);

        // Horizontal edge
        if (px + 1 < width) {
          const v2 = data[idx + 4];
          if (Math.abs(v - v2) > edgeThreshold) edgeHits++;
        }

        // Vertical edge
        if (py + 1 < height) {
          const v3 = data[idx + width * 4];
          if (Math.abs(v - v3) > edgeThreshold) edgeHits++;
        }

        // Local smoothness (paper/plastic vs wood texture)
        const localAvg = (
          v +
          data[idx + 4] +
          data[idx + width * 4]
        ) / 3;

        if (Math.abs(v - localAvg) < 10) smoothHits++;
      }

      const contrast = max - min;
      const edgeRatio = edgeHits / (samples * 2);
      const smoothRatio = smoothHits / samples;

      console.log([contrast, edgeRatio, smoothRatio]);

      return (
        contrast > 35 &&
        edgeRatio > 0.03 &&
        smoothRatio > 0.50
      );
    }

    function loop() {
      if (!isRunning) return;

      if (warmupFrames < 20) {
        warmupFrames++;
        statusEl.textContent = "Adjusting focus...";
        drawOverlay(overlayCtx, overlay, "idle");
        requestAnimationFrame(loop);
        return;
      }

      analysisCtx.drawImage(video, 0, 0, analysis.width, analysis.height);
      const frame = analysisCtx.getImageData(0, 0, analysis.width, analysis.height);

      const overlayBox = getOverlayBox(overlay);

      // fast object presence check
      const roiFrame = analysisCtx.getImageData(
        overlayBox.x,
        overlayBox.y,
        overlayBox.w,
        overlayBox.h
      );

      if (!detectSomething(roiFrame)) {
        stable = 0;
        statusEl.textContent = "Place ID inside the frame";
        drawOverlay(overlayCtx, overlay, "error");
        requestAnimationFrame(loop);
        return;
      }

      const result = analyzeFrame(frame, overlayBox);

      statusEl.textContent = result.message;
      drawOverlay(overlayCtx, overlay, result.state);

      if (result.ok) stable++;
      else stable = 0;

      if (stable > 40) {
        statusEl.textContent = "✓ Capturing...";
        drawOverlay(overlayCtx, overlay, "ready");

        captureFrame(analysis).then(blob => {
          upload(blob, options.token);
          setTimeout(cleanup, 1200);
        });
        return;
      }

      requestAnimationFrame(loop);
    }

    loop();

  } catch (e) {
    console.error(e);
    statusEl.textContent = "Camera access denied";
  }
}