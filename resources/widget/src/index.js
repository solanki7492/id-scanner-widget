import { startCamera } from './camera';
import { handleFileUpload } from './uploader';

async function mount(selector, options = {}) {
  const container = document.querySelector(selector);

  await loadOpenCV();

  // Inject widget styles
  injectStyles();

  container.innerHTML = `
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
  `;

  // Upload button handler
  document.getElementById("idscan-widget-upload-btn").onclick = () => {
    document.getElementById("idscan-widget-file-input").click();
  };

  // File input handler
  document.getElementById("idscan-widget-file-input").onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, options.token, container);
    }
  };

  // Camera button handler - opens modal
  document.getElementById("idscan-widget-camera-btn").onclick = () => {
    openCameraModal(options);
  };
}

function openCameraModal(options) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'idscan-widget-modal';
  modal.className = 'idscan-widget-modal';
  modal.innerHTML = `
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
  `;

  document.body.appendChild(modal);

  // Close button handler
  document.getElementById('idscan-widget-modal-close').onclick = () => {
    closeModal();
  };

  // Backdrop click to close
  modal.querySelector('.idscan-widget-modal-backdrop').onclick = () => {
    closeModal();
  };

  // Start camera
  startCamera(options, () => {
    closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('idscan-widget-modal');
  if (modal) {
    // Trigger cleanup event for camera
    window.dispatchEvent(new Event('idscan-cleanup'));
    modal.remove();
  }
}

function injectStyles() {
  // Avoid duplicate injection
  if (document.getElementById('idscan-widget-styles')) return;

  const style = document.createElement('style');
  style.id = 'idscan-widget-styles';
  style.textContent = `
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
  `;
  document.head.appendChild(style);
}

function loadOpenCV() {
  return new Promise((resolve, reject) => {
    if (window.cv && window.cv.Mat) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.async = true;

    script.onload = () => {
      const check = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    };

    script.onerror = reject;
    document.head.appendChild(script);
  });
}

window.IdScan = { mount };
