// ./scripts/templateLoader.js
export async function loadHTMLTemplate(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.text();
}
