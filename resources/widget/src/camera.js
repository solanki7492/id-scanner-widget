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

    function resize() {
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;
      analysis.width = video.videoWidth;
      analysis.height = video.videoHeight;
    }

    resize();

    const overlayCtx = overlay.getContext("2d");
    const analysisCtx = analysis.getContext("2d");

    let stable = 0;
    let warmupFrames = 0;
    const WARMUP_LIMIT = 30;

    function cleanup() {
      isRunning = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (onClose) onClose();
    }

    // Listen for modal close
    window.addEventListener('idscan-cleanup', cleanup, { once: true });

    function loop() {
      if (!isRunning) return;

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(loop);
        return;
      }

      if (warmupFrames < WARMUP_LIMIT) {
        warmupFrames++;
        statusEl.textContent = "Adjusting focus...";
        requestAnimationFrame(loop);
        return;
      }

      analysisCtx.drawImage(video, 0, 0, analysis.width, analysis.height);
      const frame = analysisCtx.getImageData(0, 0, analysis.width, analysis.height);
      const overlayBox = getOverlayBox(overlay);
      const status = analyzeFrame(frame, overlayBox);

      statusEl.textContent = status.message;

      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      drawOverlay(overlayCtx, overlay, status.insideBox);

      if (status.ok) stable++;
      else stable = 0;

      if (stable > 45) {
        captureFrame(analysis).then(blob => {
          upload(blob, options.token);
          statusEl.textContent = "✓ Captured! Processing...";
          statusEl.style.color = "#10b981";
          setTimeout(() => {
            cleanup();
          }, 1500);
        });
        return;
      }

      requestAnimationFrame(loop);
    }

    loop();
  } catch (error) {
    statusEl.textContent = "Camera access denied";
    statusEl.style.color = "#ef4444";
    console.error('Camera error:', error);
  }
}