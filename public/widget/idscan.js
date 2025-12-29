function w(e, n) {
  const t = n.width * 0.7, i = n.height * 0.4, a = (n.width - t) / 2, s = (n.height - i) / 2;
  e.strokeStyle = "#00ff99", e.lineWidth = 3, e.strokeRect(a, s, t, i);
}
let d = null;
function p(e) {
  const n = k(e);
  b(e);
  const t = I(e);
  return n < 60 ? { ok: !1, message: "Too dark" } : n > 220 ? { ok: !1, message: "Too bright" } : t > 25 ? { ok: !1, message: "Hold still" } : { ok: !0, message: "Hold steady" };
}
function k(e) {
  let n = 0;
  for (let t = 0; t < e.data.length; t += 4)
    n += e.data[t];
  return n / (e.data.length / 4);
}
function b(e) {
  let n = 0;
  for (let t = 0; t < e.data.length; t += 4)
    n += Math.abs(e.data[t] - e.data[t + 4] || 0);
  return n / (e.data.length / 4);
}
function I(e) {
  if (!d)
    return d = e, 0;
  let n = 0;
  for (let t = 0; t < e.data.length; t += 4)
    n += Math.abs(e.data[t] - d.data[t]);
  return d = e, n / (e.data.length / 4);
}
function S(e) {
  return new Promise((n) => {
    e.toBlob((t) => n(t), "image/jpeg", 0.85);
  });
}
async function A(e, n) {
  const t = new FormData();
  t.append("image", e), await fetch("https://phyllotaxic-denita-shamefacedly.ngrok-free.dev/api/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${n}`
    },
    body: t
  });
}
function c(e) {
  const n = document.getElementById("idscan-hint");
  n.innerText = e;
}
async function B(e) {
  const n = document.getElementById("idscan-root");
  n.innerHTML = `
    <video playsinline></video>
    <canvas id="overlay"></canvas>
    <canvas id="analysis" style="display:none;"></canvas>
    <div id="idscan-hint">Starting camera...</div>
  `;
  const t = n.querySelector("video"), i = n.querySelector("#overlay"), a = n.querySelector("#analysis"), s = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment",
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  });
  t.srcObject = s, await new Promise((l) => t.onloadedmetadata = l), await t.play();
  function h() {
    i.width = t.videoWidth, i.height = t.videoHeight, a.width = t.videoWidth, a.height = t.videoHeight;
  }
  h(), window.addEventListener("resize", h);
  const u = i.getContext("2d"), g = a.getContext("2d");
  let r = 0, y = 0;
  const v = 30;
  function o() {
    if (t.readyState !== t.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(o);
      return;
    }
    if (y < v) {
      y++, c("Adjusting focus..."), requestAnimationFrame(o);
      return;
    }
    g.drawImage(t, 0, 0, a.width, a.height);
    const l = g.getImageData(0, 0, a.width, a.height), m = p(l);
    if (c(m.message), u.clearRect(0, 0, i.width, i.height), w(u, i), m.ok ? r++ : r = 0, r > 45) {
      S(a).then((f) => A(f, e.token)), c("Captured");
      return;
    }
    requestAnimationFrame(o);
  }
  o();
}
function H(e, n = {}) {
  const t = document.querySelector(e);
  t.innerHTML = `
    <div id="idscan-placeholder">
      <button id="idscan-start">Start ID Scan</button>
    </div>
    <div id="idscan-root" style="display:none;"></div>
  `, document.getElementById("idscan-start").onclick = () => {
    document.getElementById("idscan-placeholder").style.display = "none", document.getElementById("idscan-root").style.display = "block", B(n);
  };
}
window.IdScan = { mount: H };
