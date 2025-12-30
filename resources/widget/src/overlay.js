export function getOverlayBox(canvas) {
  const ID_RATIO = 1.6; // width / height (real ID shape)

  const maxWidth  = canvas.width * 0.85;
  const maxHeight = canvas.height * 0.45;

  let w = maxWidth;
  let h = w / ID_RATIO;

  if (h > maxHeight) {
    h = maxHeight;
    w = h * ID_RATIO;
  }

  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  return { x, y, w, h };
}

export function drawOverlay(ctx, canvas, state = "idle") {
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);

  // Dark mask
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, width, height);

  const box = getOverlayBox(canvas);

  // Clear ROI
  ctx.clearRect(box.x, box.y, box.w, box.h);

  let color = "#facc15"; // yellow
  if (state === "ready") color = "#22c55e";
  if (state === "error") color = "#ef4444";

  // Solid rectangle border
  ctx.setLineDash([10, 8]); // Remove dashing
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
}