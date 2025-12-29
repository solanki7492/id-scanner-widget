(function(u){typeof define=="function"&&define.amd?define(u):u()})((function(){"use strict";function u(e){const i=e.width*.7,t=e.height*.4,n=(e.width-i)/2,a=(e.height-t)/2;return{x:n,y:a,w:i,h:t}}function p(e,i,t="idle"){const{width:n,height:a}=i;e.clearRect(0,0,n,a),e.fillStyle="rgba(0,0,0,0.6)",e.fillRect(0,0,n,a);const o=u(i);e.clearRect(o.x,o.y,o.w,o.h);let d="#facc15";t==="ready"&&(d="#22c55e"),t==="error"&&(d="#ef4444"),e.setLineDash([10,8]),e.lineWidth=3,e.strokeStyle=d,e.strokeRect(o.x,o.y,o.w,o.h)}let y=null;function A(e,i){const t=P(e),n=O(e);return t<60?{ok:!1,state:"error",message:"Too dark"}:t>220?{ok:!1,state:"error",message:"Too bright"}:n>25?{ok:!1,state:"idle",message:"Hold still"}:{ok:!0,state:"ready",message:"Hold steady"}}function P(e){let i=0;for(let t=0;t<e.data.length;t+=4)i+=e.data[t];return i/(e.data.length/4)}function O(e){if(!y)return y=e,0;let i=0;for(let t=0;t<e.data.length;t+=4)i+=Math.abs(e.data[t]-y.data[t]);return y=e,i/(e.data.length/4)}function W(e){return new Promise(i=>{e.toBlob(t=>i(t),"image/jpeg",.85)})}async function E(e,i){const t=new FormData;t.append("image",e),await fetch("https://phyllotaxic-denita-shamefacedly.ngrok-free.dev/api/v1/documents",{method:"POST",headers:{Authorization:`Bearer ${i}`},body:t})}async function N(e,i,t){if(!e.type.startsWith("image/")){alert("Please select an image file");return}const n=t.querySelector(".idscan-widget-box"),a=n.innerHTML;n.innerHTML=`
    <h3 class="idscan-widget-title">Uploading...</h3>
    <p class="idscan-widget-subtitle">Please wait while we process your document</p>
  `;try{await E(e,i),n.innerHTML=`
      <h3 class="idscan-widget-title" style="color: #10b981;">✓ Success!</h3>
      <p class="idscan-widget-subtitle">Document uploaded successfully</p>
    `}catch{n.innerHTML=`
      <h3 class="idscan-widget-title" style="color: #ef4444;">✗ Error</h3>
      <p class="idscan-widget-subtitle">Failed to upload document. Please try again.</p>
    `}setTimeout(()=>{n.innerHTML=a,t.querySelector("#idscan-widget-upload-btn").onclick=()=>{t.querySelector("#idscan-widget-file-input").click()}},2500)}async function V(e,i){const t=document.getElementById("idscan-widget-camera-container"),n=document.getElementById("idscan-widget-status"),a=t.querySelector("video"),o=t.querySelector("#idscan-widget-overlay"),d=t.querySelector("#idscan-widget-analysis");let H=!0,b=null;try{let T=function(){H=!1,b&&b.getTracks().forEach(c=>c.stop()),i&&i()},K=function(c){let s=255,h=0,l=0,k=0;const S=400,F=26,{data:m,width:w,height:q}=c;for(let j=0;j<S;j++){const D=Math.floor(Math.random()*w),U=Math.floor(Math.random()*q),f=(U*w+D)*4,g=m[f];if(s=Math.min(s,g),h=Math.max(h,g),D+1<w){const C=m[f+4];Math.abs(g-C)>F&&l++}if(U+1<q){const C=m[f+w*4];Math.abs(g-C)>F&&l++}const Q=(g+m[f+4]+m[f+w*4])/3;Math.abs(g-Q)<10&&k++}const L=h-s,R=l/(S*2),z=k/S;return console.log([L,R,z]),L>35&&R>.03&&z>.5},v=function(){if(!H)return;if(I<20){I++,n.textContent="Adjusting focus...",p(r,o,"idle"),requestAnimationFrame(v);return}B.drawImage(a,0,0,d.width,d.height);const c=B.getImageData(0,0,d.width,d.height),s=u(o),h=B.getImageData(s.x,s.y,s.w,s.h);if(!K(h)){x=0,n.textContent="Place ID inside the frame",p(r,o,"error"),requestAnimationFrame(v);return}const l=A(c,s);if(n.textContent=l.message,p(r,o,l.state),l.ok?x++:x=0,x>40){n.textContent="✓ Capturing...",p(r,o,"ready"),W(d).then(k=>{E(k,e.token),setTimeout(T,1200)});return}requestAnimationFrame(v)};b=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1920},height:{ideal:1080}}}),a.srcObject=b,await new Promise(c=>a.onloadedmetadata=c),await a.play(),o.width=a.videoWidth,o.height=a.videoHeight,d.width=a.videoWidth,d.height=a.videoHeight;const r=o.getContext("2d"),B=d.getContext("2d");let x=0,I=0;window.addEventListener("idscan-cleanup",T,{once:!0}),v()}catch(r){console.error(r),n.textContent="Camera access denied"}}function $(e,i={}){const t=document.querySelector(e);J(),t.innerHTML=`
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
  `,document.getElementById("idscan-widget-upload-btn").onclick=()=>{document.getElementById("idscan-widget-file-input").click()},document.getElementById("idscan-widget-file-input").onchange=n=>{const a=n.target.files[0];a&&N(a,i.token,t)},document.getElementById("idscan-widget-camera-btn").onclick=()=>{G(i)}}function G(e){const i=document.createElement("div");i.id="idscan-widget-modal",i.className="idscan-widget-modal",i.innerHTML=`
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
  `,document.body.appendChild(i),document.getElementById("idscan-widget-modal-close").onclick=()=>{M()},i.querySelector(".idscan-widget-modal-backdrop").onclick=()=>{M()},V(e,()=>{M()})}function M(){const e=document.getElementById("idscan-widget-modal");e&&(window.dispatchEvent(new Event("idscan-cleanup")),e.remove())}function J(){if(document.getElementById("idscan-widget-styles"))return;const e=document.createElement("style");e.id="idscan-widget-styles",e.textContent=`
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
  `,document.head.appendChild(e)}window.IdScan={mount:$}}));
