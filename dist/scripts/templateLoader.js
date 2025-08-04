// ./scripts/templateLoader.js
// export async function loadHTMLTemplate(relativePath) {
//   const baseURL = new URL('.', import.meta.url); // Pfad zur aktuellen JS-Datei
//   const fullURL = new URL(relativePath, baseURL); // relativ zu dieser Datei
//   const res = await fetch(fullURL);
//   if (!res.ok) throw new Error(`Failed to load ${relativePath}`);
//   return await res.text();
// }

export async function loadHTMLTemplate(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.text();
}
