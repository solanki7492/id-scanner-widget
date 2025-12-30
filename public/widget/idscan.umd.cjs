(function(u){typeof define=="function"&&define.amd?define(u):u()})((function(){"use strict";function u(e){const t=e.width*.85,n=e.height*.45;let d=t,a=d/1.6;a>n&&(a=n,d=a*1.6);const o=(e.width-d)/2,y=(e.height-a)/2;return{x:o,y,w:d,h:a}}function w(e,i,t="idle"){const{width:n,height:d}=i;e.clearRect(0,0,n,d),e.fillStyle="rgba(0,0,0,0.6)",e.fillRect(0,0,n,d);const a=u(i);e.clearRect(a.x,a.y,a.w,a.h);let o="#facc15";t==="ready"&&(o="#22c55e"),t==="error"&&(o="#ef4444"),e.setLineDash([10,8]),e.lineWidth=3,e.strokeStyle=o,e.strokeRect(a.x,a.y,a.w,a.h)}let v=null;function j(e,i){const t=V(e),n=U(e);return t<60?{ok:!1,state:"error",message:"Too dark"}:t>220?{ok:!1,state:"error",message:"Too bright"}:n>25?{ok:!1,state:"idle",message:"Hold still"}:{ok:!0,state:"ready",message:"Hold steady"}}function V(e){let i=0;for(let t=0;t<e.data.length;t+=4)i+=e.data[t];return i/(e.data.length/4)}function U(e){if(!v)return v=e,0;let i=0;for(let t=0;t<e.data.length;t+=4)i+=Math.abs(e.data[t]-v.data[t]);return v=e,i/(e.data.length/4)}function _(e){return new Promise(i=>{e.toBlob(t=>i(t),"image/jpeg",.85)})}async function T(e,i){const t=new FormData;t.append("image",e),await fetch("https://phyllotaxic-denita-shamefacedly.ngrok-free.dev/api/v1/documents",{method:"POST",headers:{Authorization:`Bearer ${i}`},body:t})}async function W(e,i,t){if(!e.type.startsWith("image/")){alert("Please select an image file");return}const n=t.querySelector(".idscan-widget-box"),d=n.innerHTML;n.innerHTML=`
    <h3 class="idscan-widget-title">Uploading...</h3>
    <p class="idscan-widget-subtitle">Please wait while we process your document</p>
  `;try{await T(e,i),n.innerHTML=`
      <h3 class="idscan-widget-title" style="color: #10b981;">✓ Success!</h3>
      <p class="idscan-widget-subtitle">Document uploaded successfully</p>
    `}catch{n.innerHTML=`
      <h3 class="idscan-widget-title" style="color: #ef4444;">✗ Error</h3>
      <p class="idscan-widget-subtitle">Failed to upload document. Please try again.</p>
    `}setTimeout(()=>{n.innerHTML=d,t.querySelector("#idscan-widget-upload-btn").onclick=()=>{t.querySelector("#idscan-widget-file-input").click()}},2500)}async function N(e,i){const t=document.getElementById("idscan-widget-camera-container"),n=document.getElementById("idscan-widget-status"),d=t.querySelector("video"),a=t.querySelector("#idscan-widget-overlay"),o=t.querySelector("#idscan-widget-analysis");let y=0,A=!1;const J=10;let H=!0,b=null,x=!1;if(typeof cv>"u"){n.textContent="Loading OpenCV...";const s=setInterval(()=>{typeof cv<"u"&&cv.Mat&&(clearInterval(s),x=!0)},100)}else x=!0;try{let D=function(){H=!1,b&&b.getTracks().forEach(r=>r.stop()),i&&i()},K=function(r,c){if(!x||typeof cv>"u")return!1;try{const f=cv.matFromImageData(r),l=new cv.Mat,p=new cv.Mat,E=new cv.Mat,C=new cv.MatVector,B=new cv.Mat;cv.cvtColor(f,l,cv.COLOR_RGBA2GRAY),cv.GaussianBlur(l,p,new cv.Size(5,5),0),cv.Canny(p,E,50,150),cv.findContours(E,C,B,cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE);let F=!1;const Q=c.w*c.h*.3,Z=c.w*c.h*.95;for(let R=0;R<C.size();R++){const m=C.get(R),P=cv.contourArea(m);if(P>Q&&P<Z){const ee=cv.arcLength(m,!0),S=new cv.Mat;if(cv.approxPolyDP(m,S,.02*ee,!0),S.rows===4){const g=cv.boundingRect(m),q=g.x+g.width/2,z=g.y+g.height/2;if(q>c.x&&q<c.x+c.w&&z>c.y&&z<c.y+c.h){const M=g.width/g.height;if(M>1.4&&M<1.9||M>.5&&M<.8){F=!0;break}}}S.delete()}m.delete()}return f.delete(),l.delete(),p.delete(),E.delete(),C.delete(),B.delete(),F}catch(f){return console.error("OpenCV detection error:",f),!1}},h=function(){if(!H)return;if(!x){n.textContent="Loading OpenCV...",w(s,a,"idle"),requestAnimationFrame(h);return}if(O<20){O++,n.textContent="Adjusting focus...",w(s,a,"idle"),requestAnimationFrame(h);return}L.drawImage(d,0,0,o.width,o.height);const r=L.getImageData(0,0,o.width,o.height),c=u(a);if(y++,y%J===0&&(A=K(r,c)),!A){k=0,n.textContent="Place ID inside the frame",w(s,a,"error"),requestAnimationFrame(h);return}const l=j(r,c);if(n.textContent=l.message,w(s,a,l.state),l.ok?k++:k=0,k>40){n.textContent="✓ Capturing...",w(s,a,"ready"),_(o).then(p=>{T(p,e.token),setTimeout(D,1200)});return}requestAnimationFrame(h)};b=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1920},height:{ideal:1080}}}),d.srcObject=b,await new Promise(r=>d.onloadedmetadata=r),await d.play(),a.width=d.videoWidth,a.height=d.videoHeight,o.width=d.videoWidth,o.height=d.videoHeight;const s=a.getContext("2d"),L=o.getContext("2d");let k=0,O=0;window.addEventListener("idscan-cleanup",D,{once:!0}),h()}catch(s){console.error(s),n.textContent="Camera access denied"}}async function G(e,i={}){const t=document.querySelector(e);await $(),Y(),t.innerHTML=`
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
  `,document.getElementById("idscan-widget-upload-btn").onclick=()=>{document.getElementById("idscan-widget-file-input").click()},document.getElementById("idscan-widget-file-input").onchange=n=>{const d=n.target.files[0];d&&W(d,i.token,t)},document.getElementById("idscan-widget-camera-btn").onclick=()=>{X(i)}}function X(e){const i=document.createElement("div");i.id="idscan-widget-modal",i.className="idscan-widget-modal",i.innerHTML=`
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
  `,document.body.appendChild(i),document.getElementById("idscan-widget-modal-close").onclick=()=>{I()},i.querySelector(".idscan-widget-modal-backdrop").onclick=()=>{I()},N(e,()=>{I()})}function I(){const e=document.getElementById("idscan-widget-modal");e&&(window.dispatchEvent(new Event("idscan-cleanup")),e.remove())}function Y(){if(document.getElementById("idscan-widget-styles"))return;const e=document.createElement("style");e.id="idscan-widget-styles",e.textContent=`
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
  `,document.head.appendChild(e)}function $(){return new Promise((e,i)=>{if(window.cv&&window.cv.Mat){e();return}const t=document.createElement("script");t.src="https://docs.opencv.org/4.x/opencv.js",t.async=!0,t.onload=()=>{const n=setInterval(()=>{window.cv&&window.cv.Mat&&(clearInterval(n),e())},50)},t.onerror=i,document.head.appendChild(t)})}window.IdScan={mount:G}}));
