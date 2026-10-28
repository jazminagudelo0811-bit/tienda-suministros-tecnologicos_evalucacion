function isValidProduct(product) {
  return product !== null
    && typeof product === "object"
    && Number.isInteger(product.id)
    && product.id > 0
    && typeof product.name === "string"
    && product.name.trim().length > 0
    && typeof product.category === "string"
    && product.category.trim().length > 0
    && Number.isFinite(product.price)
    && product.price > 0
    && Number.isInteger(product.stock)
    && product.stock >= 0
    && typeof product.description === "string"
    && typeof product.active === "boolean";
}

export async function loadProducts() {
  let response;
  try {
    response = await fetch("./datos/products.json", { headers: { Accept: "application/json" } });
  } catch (error) {
    throw new Error("No fue posible conectar con el catálogo. Verifica que la aplicación esté abierta desde un servidor HTTP local.");
  }
  if (!response.ok) {
    throw new Error(`El servidor no pudo cargar el catálogo (HTTP ${response.status}).`);
  }

  let products;
  try {
    products = await response.json();
  } catch (error) {
    throw new Error("El catálogo respondió con JSON inválido o incompleto.");
  }
  if (!Array.isArray(products) || !products.every(isValidProduct)) {
    throw new Error("Los datos del catálogo no tienen el formato esperado.");
  }
  const ids = new Set(products.map((product) => product.id));
  if (ids.size !== products.length) {
    throw new Error("El catálogo contiene identificadores de producto repetidos.");
  }
  return products;
}
