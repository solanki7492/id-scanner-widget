export function getOverlayBox(canvas) {
  const w = canvas.width * 0.7;
  const h = canvas.height * 0.4;
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

  // Dotted border
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
}