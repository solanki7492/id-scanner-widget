import { startCamera } from './camera';

function mount(selector, options = {}) {
  const container = document.querySelector(selector);

  container.innerHTML = `
    <div id="idscan-placeholder">
      <button id="idscan-start">Start ID Scan</button>
    </div>
    <div id="idscan-root" style="display:none;"></div>
  `;

  document.getElementById("idscan-start").onclick = () => {
    document.getElementById("idscan-placeholder").style.display = "none";
    document.getElementById("idscan-root").style.display = "block";
    startCamera(options);
  };
}

window.IdScan = { mount };
