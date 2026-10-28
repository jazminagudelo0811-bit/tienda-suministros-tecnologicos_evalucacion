const STORAGE_KEY = "tecnostock-cart-v1";

export function readSavedCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { value: [], warning: "" };
    try {
      return { value: JSON.parse(raw), warning: "" };
    } catch (error) {
      return { value: [], warning: "El carrito guardado estaba dañado y se inició uno vacío." };
    }
  } catch (error) {
    return { value: [], warning: "No se pudo acceder al almacenamiento local; el carrito funcionará solo durante esta sesión." };
  }
}

export function saveCart(lines) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    return true;
  } catch (error) {
    return false;
  }
}
