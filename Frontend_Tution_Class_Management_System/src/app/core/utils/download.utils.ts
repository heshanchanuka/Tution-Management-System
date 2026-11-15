/**
 * Saves a Blob (e.g. a PDF receipt from the API) as a file download.
 * The object URL is revoked on the next tick - revoking it synchronously right
 * after click() can cancel the download in Firefox and Safari.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    link.remove();
  }, 0);
}

/** Makes a string safe to use as a file name. */
export function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}
