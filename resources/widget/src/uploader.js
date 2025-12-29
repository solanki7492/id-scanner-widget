export async function upload(blob, token) {
  const form = new FormData();
  form.append("image", blob);

  await fetch("https://phyllotaxic-denita-shamefacedly.ngrok-free.dev/api/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });
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

  try {
    await upload(file, token);
    box.innerHTML = `
      <h3 class="idscan-widget-title" style="color: #10b981;">✓ Success!</h3>
      <p class="idscan-widget-subtitle">Document uploaded successfully</p>
    `;
  } catch (error) {
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