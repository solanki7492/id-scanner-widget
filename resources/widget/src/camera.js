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

  let frameCount = 0;
  let lastCardDetected = false;

  const CV_THROTTLE = 10;

  let isRunning = true;
  let stream = null;
  let cvReady = false;

  // Wait for OpenCV.js to load
  if (typeof cv === 'undefined') {
    statusEl.textContent = "Loading OpenCV...";
    const checkCV = setInterval(() => {
      if (typeof cv !== 'undefined' && cv.Mat) {
        clearInterval(checkCV);
        cvReady = true;
      }
    }, 100);
  } else {
    cvReady = true;
  }

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

    // OpenCV.js card detection function
    function detectCardWithOpenCV(imageData, overlayBox) {
      if (!cvReady || typeof cv === 'undefined') return false;

      try {
        // Create OpenCV Mat from ImageData
        const src = cv.matFromImageData(imageData);
        const gray = new cv.Mat();
        const blurred = new cv.Mat();
        const edges = new cv.Mat();
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Apply Gaussian blur to reduce noise
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        // Edge detection using Canny
        cv.Canny(blurred, edges, 50, 150);

        // Find contours
        cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        let cardDetected = false;
        const minArea = (overlayBox.w * overlayBox.h) * 0.3; // At least 30% of box area
        const maxArea = (overlayBox.w * overlayBox.h) * 0.95; // At most 95% of box area

        // Check each contour
        for (let i = 0; i < contours.size(); i++) {
          const contour = contours.get(i);
          const area = cv.contourArea(contour);

          if (area > minArea && area < maxArea) {
            // Approximate contour to polygon
            const peri = cv.arcLength(contour, true);
            const approx = new cv.Mat();
            cv.approxPolyDP(contour, approx, 0.02 * peri, true);

            // ID cards typically have 4 corners (rectangular)
            if (approx.rows === 4) {
              // Get bounding rectangle
              const rect = cv.boundingRect(contour);

              // Check if contour is within overlay box
              const centerX = rect.x + rect.width / 2;
              const centerY = rect.y + rect.height / 2;

              if (centerX > overlayBox.x &&
                centerX < overlayBox.x + overlayBox.w &&
                centerY > overlayBox.y &&
                centerY < overlayBox.y + overlayBox.h) {

                // Check aspect ratio (ID cards are typically 1.5:1 to 1.8:1)
                const aspectRatio = rect.width / rect.height;
                if ((aspectRatio > 1.4 && aspectRatio < 1.9) ||
                  (aspectRatio > 0.5 && aspectRatio < 0.8)) { // Also check vertical orientation
                  cardDetected = true;
                  break;
                }
              }
            }
            approx.delete();
          }
          contour.delete();
        }

        // Cleanup OpenCV resources
        src.delete();
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();

        return cardDetected;
      } catch (error) {
        console.error('OpenCV detection error:', error);
        return false;
      }
    }

    function loop() {
      if (!isRunning) return;

      if (!cvReady) {
        statusEl.textContent = "Loading OpenCV...";
        drawOverlay(overlayCtx, overlay, "idle");
        requestAnimationFrame(loop);
        return;
      }

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

      // Use OpenCV.js for card detection
      frameCount++;

      if (frameCount % CV_THROTTLE === 0) {
        lastCardDetected = detectCardWithOpenCV(frame, overlayBox);
      }

      const cardDetected = lastCardDetected;

      if (!cardDetected) {
        stable = 0;
        statusEl.textContent = "Place ID inside the frame";
        drawOverlay(overlayCtx, overlay, "error");
        requestAnimationFrame(loop);
        return;
      }

      // Run quality checks (brightness, motion, etc.)
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