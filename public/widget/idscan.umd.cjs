(function(f){typeof define=="function"&&define.amd?define(f):f()})((function(){"use strict";function f(e){const i=e.width*.85,a=e.height*.45;let o=i,n=o/1.6;n>a&&(n=a,o=n*1.6);const d=(e.width-o)/2,k=(e.height-n)/2;return{x:d,y:k,w:o,h:n}}function h(e,t,i="idle"){const{width:a,height:o}=t;e.clearRect(0,0,a,o),e.fillStyle="rgba(0,0,0,0.6)",e.fillRect(0,0,a,o);const n=f(t);e.clearRect(n.x,n.y,n.w,n.h);let d="#facc15";i==="ready"&&(d="#22c55e"),i==="error"&&(d="#ef4444"),e.setLineDash([10,8]),e.lineWidth=3,e.strokeStyle=d,e.strokeRect(n.x,n.y,n.w,n.h)}let x=null;function W(e,t){const i=G(e),a=X(e);return i<60?{ok:!1,state:"error",message:"Too dark"}:i>220?{ok:!1,state:"error",message:"Too bright"}:a>25?{ok:!1,state:"idle",message:"Hold still"}:{ok:!0,state:"ready",message:"Hold steady"}}function G(e){let t=0;for(let i=0;i<e.data.length;i+=4)t+=e.data[i];return t/(e.data.length/4)}function X(e){if(!x)return x=e,0;let t=0;for(let i=0;i<e.data.length;i+=4)t+=Math.abs(e.data[i]-x.data[i]);return x=e,t/(e.data.length/4)}function Y(e){return new Promise(t=>{e.toBlob(i=>t(i),"image/jpeg",.85)})}function _(e,t){const i=document.createElement("div");i.className="idscan-data-popup-overlay";const a=J(e);i.innerHTML=`
    <div class="idscan-data-popup">
      <div class="idscan-data-popup-header">
        <h3 class="idscan-data-popup-title">Extracted Document Data</h3>
        <button class="idscan-data-popup-close" aria-label="Close">×</button>
      </div>
      <div class="idscan-data-popup-content">
        ${a}
      </div>
    </div>
  `,t.appendChild(i),K(i),setTimeout(()=>i.classList.add("active"),10)}function J(e){let t="";e.document_type&&(t+=E("Document Type",e.document_type,"document_type")),e.issuing_country&&(t+=E("Issuing Country",e.issuing_country,"issuing_country"));const i={name:"Name",dob:"Date of Birth",place_of_birth:"Place of Birth",gender:"Gender",nationality:"Nationality",document_number:"Document Number",issue_date:"Issue Date",expiry_date:"Expiry Date",card_number:"Card Number"};for(const[a,o]of Object.entries(i))if(e[a]){const n=e[a],d=n.normalized_value||n.raw_value||n;d&&(t+=E(o,d,a))}return t||'<p class="idscan-data-popup-empty">No data extracted</p>'}function E(e,t,i){return`
    <div class="idscan-data-field">
      <label class="idscan-data-field-label">${e}</label>
      <div class="idscan-data-field-input-wrapper">
        <input 
          type="text" 
          class="idscan-data-field-input" 
          value="${z(t)}" 
          readonly
          data-field="${i}"
        />
        <button 
          class="idscan-data-field-copy" 
          data-value="${z(t)}"
          aria-label="Copy ${e}"
          title="Copy to clipboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    </div>
  `}function z(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function K(e,t){e.querySelector(".idscan-data-popup-close").addEventListener("click",()=>I(e)),e.addEventListener("click",n=>{n.target===e&&I(e)}),e.querySelectorAll(".idscan-data-field-copy").forEach(n=>{n.addEventListener("click",()=>Q(n))});const o=n=>{n.key==="Escape"&&(I(e),document.removeEventListener("keydown",o))};document.addEventListener("keydown",o)}function Q(e){const t=e.getAttribute("data-value");navigator.clipboard.writeText(t).then(()=>{const i=e.innerHTML;e.innerHTML=`
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `,e.classList.add("copied"),setTimeout(()=>{e.innerHTML=i,e.classList.remove("copied")},1500)}).catch(i=>{console.error("Failed to copy:",i),alert("Failed to copy to clipboard")})}function I(e){e.classList.remove("active"),setTimeout(()=>{e.remove()},300)}const Z=`
  .idscan-data-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
    padding: 20px;
  }
  
  .idscan-data-popup-overlay.active {
    opacity: 1;
  }
  
  .idscan-data-popup {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    transform: scale(0.9);
    transition: transform 0.3s ease;
  }
  
  .idscan-data-popup-overlay.active .idscan-data-popup {
    transform: scale(1);
  }
  
  .idscan-data-popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .idscan-data-popup-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
  }
  
  .idscan-data-popup-close {
    background: none;
    border: none;
    font-size: 32px;
    line-height: 1;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }
  
  .idscan-data-popup-close:hover {
    background: #f3f4f6;
    color: #111827;
  }
  
  .idscan-data-popup-content {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }
  
  .idscan-data-field {
    margin-bottom: 20px;
  }
  
  .idscan-data-field:last-child {
    margin-bottom: 0;
  }
  
  .idscan-data-field-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }
  
  .idscan-data-field-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .idscan-data-field-input {
    width: 100%;
    padding: 10px 45px 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    color: #111827;
    background: #f9fafb;
    cursor: default;
    font-family: inherit;
  }
  
  .idscan-data-field-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
  }
  
  .idscan-data-field-copy {
    position: absolute;
    right: 8px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: all 0.2s;
  }
  
  .idscan-data-field-copy:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
  }
  
  .idscan-data-field-copy.copied {
    background: #10b981;
    border-color: #10b981;
    color: white;
  }
  
  .idscan-data-popup-empty {
    text-align: center;
    color: #6b7280;
    padding: 40px 20px;
    margin: 0;
  }
  
  @media (max-width: 640px) {
    .idscan-data-popup {
      max-width: 100%;
      max-height: 90vh;
      margin: 10px;
    }
    
    .idscan-data-popup-header {
      padding: 16px 20px;
    }
    
    .idscan-data-popup-title {
      font-size: 18px;
    }
    
    .idscan-data-popup-content {
      padding: 20px;
    }
  }
`;function B(e){let t=e.querySelector(".idscan-loading-overlay");return t||(t=document.createElement("div"),t.className="idscan-loading-overlay",t.innerHTML=`
      <div class="idscan-loading-content">
        <div class="idscan-loading-spinner">
          <div class="idscan-spinner-ring"></div>
          <div class="idscan-spinner-ring"></div>
          <div class="idscan-spinner-ring"></div>
        </div>
        <h3 class="idscan-loading-title">Processing Document</h3>
        <p class="idscan-loading-subtitle">Please wait while we extract the data...</p>
      </div>
    `,e.appendChild(t)),setTimeout(()=>t.classList.add("active"),10),t}function b(e){const t=e.querySelector(".idscan-loading-overlay");t&&(t.classList.remove("active"),setTimeout(()=>{t.remove()},300))}const ee=`
  .idscan-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .idscan-loading-overlay.active {
    opacity: 1;
  }
  
  .idscan-loading-content {
    text-align: center;
    transform: scale(0.9);
    transition: transform 0.3s ease;
  }
  
  .idscan-loading-overlay.active .idscan-loading-content {
    transform: scale(1);
  }
  
  .idscan-loading-spinner {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
  }
  
  .idscan-spinner-ring {
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 4px solid transparent;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: idscan-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }
  
  .idscan-spinner-ring:nth-child(1) {
    animation-delay: -0.45s;
    border-top-color: #3b82f6;
  }
  
  .idscan-spinner-ring:nth-child(2) {
    animation-delay: -0.3s;
    border-top-color: #60a5fa;
  }
  
  .idscan-spinner-ring:nth-child(3) {
    animation-delay: -0.15s;
    border-top-color: #93c5fd;
  }
  
  @keyframes idscan-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  .idscan-loading-title {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
  }
  
  .idscan-loading-subtitle {
    margin: 0;
    font-size: 16px;
    color: #d1d5db;
    font-weight: 400;
  }
  
  @media (max-width: 640px) {
    .idscan-loading-spinner {
      width: 64px;
      height: 64px;
    }
    
    .idscan-spinner-ring {
      width: 48px;
      height: 48px;
      margin: 8px;
      border-width: 3px;
    }
    
    .idscan-loading-title {
      font-size: 20px;
    }
    
    .idscan-loading-subtitle {
      font-size: 14px;
    }
  }
`;async function R(e,t){const i=new FormData;return i.append("image",e),await(await fetch("https://phyllotaxic-denita-shamefacedly.ngrok-free.dev/api/v1/documents",{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i})).json()}async function te(e,t,i){if(!e.type.startsWith("image/")){alert("Please select an image file");return}const a=i.querySelector(".idscan-widget-box"),o=a.innerHTML;a.innerHTML=`
    <h3 class="idscan-widget-title">Uploading...</h3>
    <p class="idscan-widget-subtitle">Please wait while we process your document</p>
  `,B(i);try{const n=await R(e,t);b(i),a.innerHTML=`
      <h3 class="idscan-widget-title" style="color: #10b981;">✓ Success!</h3>
      <p class="idscan-widget-subtitle">Document uploaded successfully</p>
    `,n&&n.extracted_fields&&_(n.extracted_fields,i)}catch{b(i),a.innerHTML=`
      <h3 class="idscan-widget-title" style="color: #ef4444;">✗ Error</h3>
      <p class="idscan-widget-subtitle">Failed to upload document. Please try again.</p>
    `}setTimeout(()=>{a.innerHTML=o,i.querySelector("#idscan-widget-upload-btn").onclick=()=>{i.querySelector("#idscan-widget-file-input").click()}},2500)}async function ie(e,t){const i=document.getElementById("idscan-widget-camera-container"),a=document.getElementById("idscan-widget-status"),o=i.querySelector("video"),n=i.querySelector("#idscan-widget-overlay"),d=i.querySelector("#idscan-widget-analysis");let k=0,A=!1;const se=10;let P=!0,C=null,L=!1;if(typeof cv>"u"){a.textContent="Loading OpenCV...";const r=setInterval(()=>{typeof cv<"u"&&cv.Mat&&(clearInterval(r),L=!0)},100)}else L=!0;try{let j=function(){P=!1,C&&C.getTracks().forEach(l=>l.stop()),t&&t()},ce=function(l,s){if(!L||typeof cv>"u")return!1;try{const w=cv.matFromImageData(l),g=new cv.Mat,y=new cv.Mat,p=new cv.Mat,c=new cv.MatVector,F=new cv.Mat;cv.cvtColor(w,g,cv.COLOR_RGBA2GRAY),cv.GaussianBlur(g,y,new cv.Size(5,5),0),cv.Canny(y,p,50,150),cv.findContours(p,c,F,cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE);let N=!1;const re=s.w*s.h*.3,le=s.w*s.h*.95;for(let S=0;S<c.size();S++){const v=c.get(S),V=cv.contourArea(v);if(V>re&&V<le){const pe=cv.arcLength(v,!0),D=new cv.Mat;if(cv.approxPolyDP(v,D,.02*pe,!0),D.rows===4){const u=cv.boundingRect(v),U=u.x+u.width/2,$=u.y+u.height/2;if(U>s.x&&U<s.x+s.w&&$>s.y&&$<s.y+s.h){const T=u.width/u.height;if(T>1.4&&T<1.9||T>.5&&T<.8){N=!0;break}}}D.delete()}v.delete()}return w.delete(),g.delete(),y.delete(),p.delete(),c.delete(),F.delete(),N}catch(w){return console.error("OpenCV detection error:",w),!1}},m=function(){if(!P)return;if(!L){a.textContent="Loading OpenCV...",h(r,n,"idle"),requestAnimationFrame(m);return}if(q<20){q++,a.textContent="Adjusting focus...",h(r,n,"idle"),requestAnimationFrame(m);return}O.drawImage(o,0,0,d.width,d.height);const l=O.getImageData(0,0,d.width,d.height),s=f(n);if(k++,k%se===0&&(A=ce(l,s)),!A){M=0,a.textContent="Place ID inside the frame",h(r,n,"error"),requestAnimationFrame(m);return}const g=W(l,s);if(a.textContent=g.message,h(r,n,g.state),g.ok?M++:M=0,M>40){a.textContent="✓ Capturing...",h(r,n,"ready"),Y(d).then(async y=>{const p=document.querySelector(".idscan-widget-container").parentElement;B(p);try{const c=await R(y,e.token);b(p),c&&c.extracted_fields&&_(c.extracted_fields,p)}catch(c){console.error("Upload failed:",c),b(p)}setTimeout(j,1200)});return}requestAnimationFrame(m)};C=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1920},height:{ideal:1080}}}),o.srcObject=C,await new Promise(l=>o.onloadedmetadata=l),await o.play(),n.width=o.videoWidth,n.height=o.videoHeight,d.width=o.videoWidth,d.height=o.videoHeight;const r=n.getContext("2d"),O=d.getContext("2d");let M=0,q=0;window.addEventListener("idscan-cleanup",j,{once:!0}),m()}catch(r){console.error(r),a.textContent="Camera access denied"}}async function ne(e,t={}){const i=document.querySelector(e);await de(),oe(),i.innerHTML=`
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
  `,document.getElementById("idscan-widget-upload-btn").onclick=()=>{document.getElementById("idscan-widget-file-input").click()},document.getElementById("idscan-widget-file-input").onchange=a=>{const o=a.target.files[0];o&&te(o,t.token,i)},document.getElementById("idscan-widget-camera-btn").onclick=()=>{ae(t)}}function ae(e){const t=document.createElement("div");t.id="idscan-widget-modal",t.className="idscan-widget-modal",t.innerHTML=`
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
  `,document.body.appendChild(t),document.getElementById("idscan-widget-modal-close").onclick=()=>{H()},t.querySelector(".idscan-widget-modal-backdrop").onclick=()=>{H()},ie(e,()=>{H()})}function H(){const e=document.getElementById("idscan-widget-modal");e&&(window.dispatchEvent(new Event("idscan-cleanup")),e.remove())}function oe(){if(document.getElementById("idscan-widget-styles"))return;const e=document.createElement("style");e.id="idscan-widget-styles",e.textContent=`
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

    ${Z}
    ${ee}
  `,document.head.appendChild(e)}function de(){return new Promise((e,t)=>{if(window.cv&&window.cv.Mat){e();return}const i=document.createElement("script");i.src="https://docs.opencv.org/4.x/opencv.js",i.async=!0,i.onload=()=>{const a=setInterval(()=>{window.cv&&window.cv.Mat&&(clearInterval(a),e())},50)},i.onerror=t,document.head.appendChild(i)})}window.IdScan={mount:ne}}));
