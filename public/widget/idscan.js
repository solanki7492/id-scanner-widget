function B(e, t, i = !1) {
  const n = t.width * 0.7, a = t.height * 0.4, o = (t.width - n) / 2, d = (t.height - a) / 2;
  e.fillStyle = "rgba(0, 0, 0, 0.5)", e.fillRect(0, 0, t.width, t.height), e.clearRect(o, d, n, a), e.strokeStyle = i ? "#00ff99" : "#ff4444", e.lineWidth = 4, e.strokeRect(o, d, n, a);
  const s = 30;
  e.lineWidth = 6, e.beginPath(), e.moveTo(o, d + s), e.lineTo(o, d), e.lineTo(o + s, d), e.stroke(), e.beginPath(), e.moveTo(o + n - s, d), e.lineTo(o + n, d), e.lineTo(o + n, d + s), e.stroke(), e.beginPath(), e.moveTo(o, d + a - s), e.lineTo(o, d + a), e.lineTo(o + s, d + a), e.stroke(), e.beginPath(), e.moveTo(o + n - s, d + a), e.lineTo(o + n, d + a), e.lineTo(o + n, d + a - s), e.stroke();
}
function M(e) {
  const t = e.width * 0.7, i = e.height * 0.4, n = (e.width - t) / 2, a = (e.height - i) / 2;
  return { x: n, y: a, w: t, h: i };
}
let u = null;
function S(e, t) {
  const i = E(e), n = C(e);
  return i < 60 ? { ok: !1, message: "Too dark", insideBox: !0 } : i > 220 ? { ok: !1, message: "Too bright", insideBox: !0 } : n > 25 ? { ok: !1, message: "Hold still", insideBox: !0 } : { ok: !0, message: "Hold steady", insideBox: !0 };
}
function E(e) {
  let t = 0;
  for (let i = 0; i < e.data.length; i += 4)
    t += e.data[i];
  return t / (e.data.length / 4);
}
function C(e) {
  if (!u)
    return u = e, 0;
  let t = 0;
  for (let i = 0; i < e.data.length; i += 4)
    t += Math.abs(e.data[i] - u.data[i]);
  return u = e, t / (e.data.length / 4);
}
function H(e) {
  return new Promise((t) => {
    e.toBlob((i) => t(i), "image/jpeg", 0.85);
  });
}
async function v(e, t) {
  const i = new FormData();
  i.append("image", e), await fetch("https://phyllotaxic-denita-shamefacedly.ngrok-free.dev/api/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`
    },
    body: i
  });
}
async function I(e, t, i) {
  if (!e.type.startsWith("image/")) {
    alert("Please select an image file");
    return;
  }
  const n = i.querySelector(".idscan-widget-box"), a = n.innerHTML;
  n.innerHTML = `
    <h3 class="idscan-widget-title">Uploading...</h3>
    <p class="idscan-widget-subtitle">Please wait while we process your document</p>
  `;
  try {
    await v(e, t), n.innerHTML = `
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
    n.innerHTML = a, i.querySelector("#idscan-widget-upload-btn").onclick = () => {
      i.querySelector("#idscan-widget-file-input").click();
    };
  }, 2500);
}
async function F(e, t) {
  const i = document.getElementById("idscan-widget-camera-container"), n = document.getElementById("idscan-widget-status"), a = i.querySelector("video"), o = i.querySelector("#idscan-widget-overlay"), d = i.querySelector("#idscan-widget-analysis");
  let s = !0, r = null;
  try {
    let g = function() {
      o.width = a.videoWidth, o.height = a.videoHeight, d.width = a.videoWidth, d.height = a.videoHeight;
    }, w = function() {
      s = !1, r && r.getTracks().forEach((l) => l.stop()), t && t();
    }, c = function() {
      if (!s) return;
      if (a.readyState !== a.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(c);
        return;
      }
      if (b < x) {
        b++, n.textContent = "Adjusting focus...", requestAnimationFrame(c);
        return;
      }
      y.drawImage(a, 0, 0, d.width, d.height);
      const l = y.getImageData(0, 0, d.width, d.height), k = M(o), m = S(l, k);
      if (n.textContent = m.message, f.clearRect(0, 0, o.width, o.height), B(f, o, m.insideBox), m.ok ? h++ : h = 0, h > 45) {
        H(d).then((T) => {
          v(T, e.token), n.textContent = "✓ Captured! Processing...", n.style.color = "#10b981", setTimeout(() => {
            w();
          }, 1500);
        });
        return;
      }
      requestAnimationFrame(c);
    };
    var A = g, U = w, z = c;
    r = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    }), a.srcObject = r, await new Promise((l) => a.onloadedmetadata = l), await a.play(), g();
    const f = o.getContext("2d"), y = d.getContext("2d");
    let h = 0, b = 0;
    const x = 30;
    window.addEventListener("idscan-cleanup", w, { once: !0 }), c();
  } catch (g) {
    n.textContent = "Camera access denied", n.style.color = "#ef4444", console.error("Camera error:", g);
  }
}
function P(e, t = {}) {
  const i = document.querySelector(e);
  L(), i.innerHTML = `
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
    a && I(a, t.token, i);
  }, document.getElementById("idscan-widget-camera-btn").onclick = () => {
    q(t);
  };
}
function q(e) {
  const t = document.createElement("div");
  t.id = "idscan-widget-modal", t.className = "idscan-widget-modal", t.innerHTML = `
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
  `, document.body.appendChild(t), document.getElementById("idscan-widget-modal-close").onclick = () => {
    p();
  }, t.querySelector(".idscan-widget-modal-backdrop").onclick = () => {
    p();
  }, F(e, () => {
    p();
  });
}
function p() {
  const e = document.getElementById("idscan-widget-modal");
  e && (window.dispatchEvent(new Event("idscan-cleanup")), e.remove());
}
function L() {
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
window.IdScan = { mount: P };
