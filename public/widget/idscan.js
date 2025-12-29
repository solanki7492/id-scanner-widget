function U(e) {
  const i = e.width * 0.7, t = e.height * 0.4, n = (e.width - i) / 2, a = (e.height - t) / 2;
  return { x: n, y: a, w: i, h: t };
}
function x(e, i, t = "idle") {
  const { width: n, height: a } = i;
  e.clearRect(0, 0, n, a), e.fillStyle = "rgba(0,0,0,0.6)", e.fillRect(0, 0, n, a);
  const o = U(i);
  e.clearRect(o.x, o.y, o.w, o.h);
  let d = "#facc15";
  t === "ready" && (d = "#22c55e"), t === "error" && (d = "#ef4444"), e.setLineDash([10, 8]), e.lineWidth = 3, e.strokeStyle = d, e.strokeRect(o.x, o.y, o.w, o.h);
}
let v = null;
function O(e, i) {
  const t = W(e), n = N(e);
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
function W(e) {
  let i = 0;
  for (let t = 0; t < e.data.length; t += 4)
    i += e.data[t];
  return i / (e.data.length / 4);
}
function N(e) {
  if (!v)
    return v = e, 0;
  let i = 0;
  for (let t = 0; t < e.data.length; t += 4)
    i += Math.abs(e.data[t] - v.data[t]);
  return v = e, i / (e.data.length / 4);
}
function V(e) {
  return new Promise((i) => {
    e.toBlob((t) => i(t), "image/jpeg", 0.85);
  });
}
async function A(e, i) {
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
  const n = t.querySelector(".idscan-widget-box"), a = n.innerHTML;
  n.innerHTML = `
    <h3 class="idscan-widget-title">Uploading...</h3>
    <p class="idscan-widget-subtitle">Please wait while we process your document</p>
  `;
  try {
    await A(e, i), n.innerHTML = `
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
    n.innerHTML = a, t.querySelector("#idscan-widget-upload-btn").onclick = () => {
      t.querySelector("#idscan-widget-file-input").click();
    };
  }, 2500);
}
async function G(e, i) {
  const t = document.getElementById("idscan-widget-camera-container"), n = document.getElementById("idscan-widget-status"), a = t.querySelector("video"), o = t.querySelector("#idscan-widget-overlay"), d = t.querySelector("#idscan-widget-analysis");
  let E = !0, f = null;
  try {
    let M = function() {
      E = !1, f && f.getTracks().forEach((c) => c.stop()), i && i();
    }, I = function(c) {
      let s = 255, h = 0, l = 0, b = 0;
      const B = 400, T = 26, { data: w, width: m, height: F } = c;
      for (let z = 0; z < B; z++) {
        const j = Math.floor(Math.random() * m), D = Math.floor(Math.random() * F), p = (D * m + j) * 4, g = w[p];
        if (s = Math.min(s, g), h = Math.max(h, g), j + 1 < m) {
          const S = w[p + 4];
          Math.abs(g - S) > T && l++;
        }
        if (D + 1 < F) {
          const S = w[p + m * 4];
          Math.abs(g - S) > T && l++;
        }
        const P = (g + w[p + 4] + w[p + m * 4]) / 3;
        Math.abs(g - P) < 10 && b++;
      }
      const q = h - s, L = l / (B * 2), R = b / B;
      return console.log([q, L, R]), q > 35 && L > 0.03 && R > 0.5;
    }, u = function() {
      if (!E) return;
      if (H < 20) {
        H++, n.textContent = "Adjusting focus...", x(r, o, "idle"), requestAnimationFrame(u);
        return;
      }
      k.drawImage(a, 0, 0, d.width, d.height);
      const c = k.getImageData(0, 0, d.width, d.height), s = U(o), h = k.getImageData(
        s.x,
        s.y,
        s.w,
        s.h
      );
      if (!I(h)) {
        y = 0, n.textContent = "Place ID inside the frame", x(r, o, "error"), requestAnimationFrame(u);
        return;
      }
      const l = O(c, s);
      if (n.textContent = l.message, x(r, o, l.state), l.ok ? y++ : y = 0, y > 40) {
        n.textContent = "✓ Capturing...", x(r, o, "ready"), V(d).then((b) => {
          A(b, e.token), setTimeout(M, 1200);
        });
        return;
      }
      requestAnimationFrame(u);
    };
    var X = M, Y = I, Z = u;
    f = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    }), a.srcObject = f, await new Promise((c) => a.onloadedmetadata = c), await a.play(), o.width = a.videoWidth, o.height = a.videoHeight, d.width = a.videoWidth, d.height = a.videoHeight;
    const r = o.getContext("2d"), k = d.getContext("2d");
    let y = 0, H = 0;
    window.addEventListener("idscan-cleanup", M, { once: !0 }), u();
  } catch (r) {
    console.error(r), n.textContent = "Camera access denied";
  }
}
function J(e, i = {}) {
  const t = document.querySelector(e);
  Q(), t.innerHTML = `
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
    const a = n.target.files[0];
    a && $(a, i.token, t);
  }, document.getElementById("idscan-widget-camera-btn").onclick = () => {
    K(i);
  };
}
function K(e) {
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
    C();
  }, i.querySelector(".idscan-widget-modal-backdrop").onclick = () => {
    C();
  }, G(e, () => {
    C();
  });
}
function C() {
  const e = document.getElementById("idscan-widget-modal");
  e && (window.dispatchEvent(new Event("idscan-cleanup")), e.remove());
}
function Q() {
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
window.IdScan = { mount: J };
