import { showDataPopup } from './dataPopup.js';
import { showLoadingIndicator, hideLoadingIndicator } from './loadingIndicator.js';

export async function upload(blob, token) {
  const form = new FormData();
  form.append("image", blob);

  const response = await fetch("https://phyllotaxic-denita-shamefacedly.ngrok-free.dev/api/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  // if (!response.ok) {
  //   throw new Error(`Upload failed: ${response.statusText}`);
  // }

  const data = await response.json();
  return data;
}

export async function handleFileUpload(file, token, container) {
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  // Show uploading message in the widget box
  const box = container.querySelector(".idscan-widget-box");
  const originalHTML = box.innerHTML;

  box.innerHTML = `
    <h3 class="idscan-widget-title">Uploading...</h3>
    <p class="idscan-widget-subtitle">Please wait while we process your document</p>
  `;

  // Show loading indicator
  showLoadingIndicator(container);

  try {
    const responseData = await upload(file, token);

    // Hide loading indicator
    hideLoadingIndicator(container);

    box.innerHTML = `
      <h3 class="idscan-widget-title" style="color: #10b981;">✓ Success!</h3>
      <p class="idscan-widget-subtitle">Document uploaded successfully</p>
    `;

    // Show data popup if extracted_fields exist
    if (responseData && responseData.extracted_fields) {
      showDataPopup(responseData.extracted_fields, container);
    }
  } catch (error) {
    // Hide loading indicator
    hideLoadingIndicator(container);

    box.innerHTML = `
      <h3 class="idscan-widget-title" style="color: #ef4444;">✗ Error</h3>
      <p class="idscan-widget-subtitle">Failed to upload document. Please try again.</p>
    `;
  }

  // Reset after delay
  setTimeout(() => {
    box.innerHTML = originalHTML;
    // Rebind event listeners
    container.querySelector("#idscan-widget-upload-btn").onclick = () => {
      container.querySelector("#idscan-widget-file-input").click();
    };
  }, 2500);
}