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