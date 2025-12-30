function z(e) {
  const t = e.width * 0.85, n = e.height * 0.45;
  let d = t, a = d / 1.6;
  a > n && (a = n, d = a * 1.6);
  const o = (e.width - d) / 2, m = (e.height - a) / 2;
  return { x: o, y: m, w: d, h: a };
}
function f(e, i, t = "idle") {
  const { width: n, height: d } = i;
  e.clearRect(0, 0, n, d), e.fillStyle = "rgba(0,0,0,0.6)", e.fillRect(0, 0, n, d);
  const a = z(i);
  e.clearRect(a.x, a.y, a.w, a.h);
  let o = "#facc15";
  t === "ready" && (o = "#22c55e"), t === "error" && (o = "#ef4444"), e.setLineDash([10, 8]), e.lineWidth = 3, e.strokeStyle = o, e.strokeRect(a.x, a.y, a.w, a.h);
}
let C = null;
function N(e, i) {
  const t = G(e), n = X(e);
  return t < 60 ? {
    ok: !1,
    state: "error",
    message: "Too dark"
  } : t > 220 ? {
    ok: !1,
    state: "error",
    message: "Too bright"
  } : n > 25 ? {
    ok: !1,
    state: "idle",
    message: "Hold still"
  } : {
    ok: !0,
    state: "ready",
    message: "Hold steady"
  };
}
function G(e) {
  let i = 0;
  for (let t = 0; t < e.data.length; t += 4)
    i += e.data[t];
  return i / (e.data.length / 4);
}
function X(e) {
  if (!C)
    return C = e, 0;
  let i = 0;
  for (let t = 0; t < e.data.length; t += 4)
    i += Math.abs(e.data[t] - C.data[t]);
  return C = e, i / (e.data.length / 4);
}
function Y(e) {
  return new Promise((i) => {
    e.toBlob((t) => i(t), "image/jpeg", 0.85);
  });
}
async function j(e, i) {
  const t = new FormData();
  t.append("image", e), await fetch("https://phyllotaxic-denita-shamefacedly.ngrok-free.dev/api/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${i}`
    },
    body: t
  });
}
async function $(e, i, t) {
  if (!e.type.startsWith("image/")) {
    alert("Please select an image file");
    return;
  }
  const n = t.querySelector(".idscan-widget-box"), d = n.innerHTML;
  n.innerHTML = `
    <h3 class="idscan-widget-title">Uploading...</h3>
    <p class="idscan-widget-subtitle">Please wait while we process your document</p>
  `;
  try {
    await j(e, i), n.innerHTML = `
      <h3 class="idscan-widget-title" style="color: #10b981;">✓ Success!</h3>
      <p class="idscan-widget-subtitle">Document uploaded successfully</p>
    `;
  } catch {
    n.innerHTML = `
      <h3 class="idscan-widget-title" style="color: #ef4444;">✗ Error</h3>
      <p class="idscan-widget-subtitle">Failed to upload document. Please try again.</p>
    `;
  }
  setTimeout(() => {
    n.innerHTML = d, t.querySelector("#idscan-widget-upload-btn").onclick = () => {
      t.querySelector("#idscan-widget-file-input").click();
    };
  }, 2500);
}
async function J(e, i) {
  const t = document.getElementById("idscan-widget-camera-container"), n = document.getElementById("idscan-widget-status"), d = t.querySelector("video"), a = t.querySelector("#idscan-widget-overlay"), o = t.querySelector("#idscan-widget-analysis");
  let m = 0, T = !1;
  const U = 10;
  let A = !0, v = null, y = !1;
  if (typeof cv > "u") {
    n.textContent = "Loading OpenCV...";
    const s = setInterval(() => {
      typeof cv < "u" && cv.Mat && (clearInterval(s), y = !0);
    }, 100);
  } else
    y = !0;
  try {
    let M = function() {
      A = !1, v && v.getTracks().forEach((r) => r.stop()), i && i();
    }, D = function(r, c) {
      if (!y || typeof cv > "u") return !1;
      try {
        const w = cv.matFromImageData(r), l = new cv.Mat(), h = new cv.Mat(), I = new cv.Mat(), x = new cv.MatVector(), O = new cv.Mat();
        cv.cvtColor(w, l, cv.COLOR_RGBA2GRAY), cv.GaussianBlur(l, h, new cv.Size(5, 5), 0), cv.Canny(h, I, 50, 150), cv.findContours(I, x, O, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let B = !1;
        const V = c.w * c.h * 0.3, _ = c.w * c.h * 0.95;
        for (let E = 0; E < x.size(); E++) {
          const p = x.get(E), F = cv.contourArea(p);
          if (F > V && F < _) {
            const W = cv.arcLength(p, !0), R = new cv.Mat();
            if (cv.approxPolyDP(p, R, 0.02 * W, !0), R.rows === 4) {
              const u = cv.boundingRect(p), P = u.x + u.width / 2, q = u.y + u.height / 2;
              if (P > c.x && P < c.x + c.w && q > c.y && q < c.y + c.h) {
                const k = u.width / u.height;
                if (k > 1.4 && k < 1.9 || k > 0.5 && k < 0.8) {
                  B = !0;
                  break;
                }
              }
            }
            R.delete();
          }
          p.delete();
        }
        return w.delete(), l.delete(), h.delete(), I.delete(), x.delete(), O.delete(), B;
      } catch (w) {
        return console.error("OpenCV detection error:", w), !1;
      }
    }, g = function() {
      if (!A) return;
      if (!y) {
        n.textContent = "Loading OpenCV...", f(s, a, "idle"), requestAnimationFrame(g);
        return;
      }
      if (L < 20) {
        L++, n.textContent = "Adjusting focus...", f(s, a, "idle"), requestAnimationFrame(g);
        return;
      }
      H.drawImage(d, 0, 0, o.width, o.height);
      const r = H.getImageData(0, 0, o.width, o.height), c = z(a);
      if (m++, m % U === 0 && (T = D(r, c)), !T) {
        b = 0, n.textContent = "Place ID inside the frame", f(s, a, "error"), requestAnimationFrame(g);
        return;
      }
      const l = N(r, c);
      if (n.textContent = l.message, f(s, a, l.state), l.ok ? b++ : b = 0, b > 40) {
        n.textContent = "✓ Capturing...", f(s, a, "ready"), Y(o).then((h) => {
          j(h, e.token), setTimeout(M, 1200);
        });
        return;
      }
      requestAnimationFrame(g);
    };
    var te = M, ie = D, ne = g;
    v = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    }), d.srcObject = v, await new Promise((r) => d.onloadedmetadata = r), await d.play(), a.width = d.videoWidth, a.height = d.videoHeight, o.width = d.videoWidth, o.height = d.videoHeight;
    const s = a.getContext("2d"), H = o.getContext("2d");
    let b = 0, L = 0;
    window.addEventListener("idscan-cleanup", M, { once: !0 }), g();
  } catch (s) {
    console.error(s), n.textContent = "Camera access denied";
  }
}
async function K(e, i = {}) {
  const t = document.querySelector(e);
  await ee(), Z(), t.innerHTML = `
    <div class="idscan-widget-container">
      <div class="idscan-widget-box">
        <h3 class="idscan-widget-title">Scan your ID</h3>
        <p class="idscan-widget-subtitle">Upload image or use your camera</p>
        <div class="idscan-widget-buttons">
          <button id="idscan-widget-upload-btn" class="idscan-widget-btn">
            <svg class="idscan-widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload image
          </button>
          <button id="idscan-widget-camera-btn" class="idscan-widget-btn">
            <svg class="idscan-widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            Use camera
          </button>
        </div>
      </div>
      <input type="file" id="idscan-widget-file-input" accept="image/*" style="display:none;" />
    </div>
  `, document.getElementById("idscan-widget-upload-btn").onclick = () => {
    document.getElementById("idscan-widget-file-input").click();
  }, document.getElementById("idscan-widget-file-input").onchange = (n) => {
    const d = n.target.files[0];
    d && $(d, i.token, t);
  }, document.getElementById("idscan-widget-camera-btn").onclick = () => {
    Q(i);
  };
}
function Q(e) {
  const i = document.createElement("div");
  i.id = "idscan-widget-modal", i.className = "idscan-widget-modal", i.innerHTML = `
    <div class="idscan-widget-modal-backdrop"></div>
    <div class="idscan-widget-modal-content">
      <div class="idscan-widget-modal-header">
        <button class="idscan-widget-modal-close" id="idscan-widget-modal-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="idscan-widget-camera-container" id="idscan-widget-camera-container">
        <video playsinline></video>
        <canvas id="idscan-widget-overlay"></canvas>
        <canvas id="idscan-widget-analysis" style="display:none;"></canvas>
      </div>
      <div class="idscan-widget-modal-footer">
        <div class="idscan-widget-status" id="idscan-widget-status">Starting camera...</div>
      </div>
    </div>
  `, document.body.appendChild(i), document.getElementById("idscan-widget-modal-close").onclick = () => {
    S();
  }, i.querySelector(".idscan-widget-modal-backdrop").onclick = () => {
    S();
  }, J(e, () => {
    S();
  });
}
function S() {
  const e = document.getElementById("idscan-widget-modal");
  e && (window.dispatchEvent(new Event("idscan-cleanup")), e.remove());
}
function Z() {
  if (document.getElementById("idscan-widget-styles")) return;
  const e = document.createElement("style");
  e.id = "idscan-widget-styles", e.textContent = `
    /* Minimal Widget Box */
    .idscan-widget-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 100%;
    }

    .idscan-widget-box {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 32px 24px;
      text-align: center;
      background: #fafafa;
      transition: border-color 0.2s;
    }

    .idscan-widget-box:hover {
      border-color: #9ca3af;
    }

    .idscan-widget-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #374151;
    }

    .idscan-widget-subtitle {
      margin: 0 0 24px 0;
      font-size: 14px;
      color: #6b7280;
      font-weight: 400;
    }

    .idscan-widget-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .idscan-widget-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      background: #ffffff;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
    }

    .idscan-widget-btn:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .idscan-widget-btn:active {
      background: #f3f4f6;
    }

    .idscan-widget-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    /* Modal Overlay */
    .idscan-widget-modal {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .idscan-widget-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }

    .idscan-widget-modal-content {
      position: relative;
      background: #1f2937;
      border-radius: 12px;
      width: 90%;
      height: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
    }

    .idscan-widget-modal-header {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 10;
      padding: 16px;
    }

    .idscan-widget-modal-close {
      background: rgba(0, 0, 0, 0.7);
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .idscan-widget-modal-close:hover {
      background: rgba(0, 0, 0, 0.9);
    }

    .idscan-widget-modal-close svg {
      width: 20px;
      height: 20px;
      color: white;
    }

    .idscan-widget-camera-container {
      position: relative;
      height: 90%;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      overflow: hidden;
    }

    .idscan-widget-camera-container video,
    .idscan-widget-camera-container canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .idscan-widget-modal-footer {
      padding: 20px;
      background: #111827;
      text-align: center;
    }

    .idscan-widget-status {
      color: #e5e7eb;
      font-size: 15px;
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .idscan-widget-modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .idscan-widget-buttons {
        flex-direction: column;
      }

      .idscan-widget-btn {
        width: 100%;
      }
    }
  `, document.head.appendChild(e);
}
function ee() {
  return new Promise((e, i) => {
    if (window.cv && window.cv.Mat) {
      e();
      return;
    }
    const t = document.createElement("script");
    t.src = "https://docs.opencv.org/4.x/opencv.js", t.async = !0, t.onload = () => {
      const n = setInterval(() => {
        window.cv && window.cv.Mat && (clearInterval(n), e());
      }, 50);
    }, t.onerror = i, document.head.appendChild(t);
  });
}
window.IdScan = { mount: K };
