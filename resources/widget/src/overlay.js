export function drawOverlay(ctx, canvas) {
  const w = canvas.width * 0.7;
  const h = canvas.height * 0.4;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  ctx.strokeStyle = "#00ff99";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
}