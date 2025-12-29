export function drawOverlay(ctx, canvas, isInsideBox = false) {
  const w = canvas.width * 0.7;
  const h = canvas.height * 0.4;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  // Draw dimmed overlay outside the box
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(x, y, w, h);

  // Draw border - green if ID detected inside, red if outside
  ctx.strokeStyle = isInsideBox ? "#00ff99" : "#ff4444";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);

  // Draw corner decorations
  const cornerLength = 30;
  ctx.lineWidth = 6;

  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(x, y + cornerLength);
  ctx.lineTo(x, y);
  ctx.lineTo(x + cornerLength, y);
  ctx.stroke();

  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(x + w - cornerLength, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + cornerLength);
  ctx.stroke();

  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(x, y + h - cornerLength);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + cornerLength, y + h);
  ctx.stroke();

  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(x + w - cornerLength, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - cornerLength);
  ctx.stroke();
}

export function getOverlayBox(canvas) {
  const w = canvas.width * 0.7;
  const h = canvas.height * 0.4;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;
  return { x, y, w, h };
}