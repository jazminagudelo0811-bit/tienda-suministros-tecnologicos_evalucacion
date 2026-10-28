export function addProduct(lines, product) {
  if (!product || !product.active || product.stock < 1) {
    throw new Error("Este producto no está disponible para agregar.");
  }
  const current = lines.find((line) => line.productId === product.id);
  const nextQuantity = current ? current.quantity + 1 : 1;
  if (nextQuantity > product.stock) {
    throw new Error(`No hay existencias suficientes de ${product.name}.`);
  }
  if (current) {
    return lines.map((line) => line.productId === product.id
      ? { ...line, quantity: nextQuantity }
      : line);
  }
  return [...lines, { productId: product.id, quantity: 1 }];
}

export function updateProductQuantity(lines, product, amount) {
  const current = lines.find((line) => line.productId === product?.id);
  if (!current) throw new Error("El producto ya no está en el carrito.");
  if (!Number.isInteger(amount) || amount === 0) {
    throw new Error("La cantidad solicitada no es válida.");
  }
  const quantity = current.quantity + amount;
  if (quantity < 1) throw new Error("La cantidad mínima es 1. Usa Eliminar para quitar el producto.");
  if (!product.active || quantity > product.stock) {
    throw new Error(`La cantidad supera las existencias disponibles de ${product.name}.`);
  }
  return lines.map((line) => line.productId === product.id ? { ...line, quantity } : line);
}

export function removeProduct(lines, productId) {
  return lines.filter((line) => line.productId !== productId);
}

export function calculateOrder(lines, products) {
  const linesWithProducts = lines.map((line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product || !product.active || !Number.isInteger(line.quantity)
      || line.quantity < 1 || line.quantity > product.stock) {
      throw new Error("El carrito contiene un producto o una cantidad que ya no es válida.");
    }
    return { product, quantity: line.quantity };
  });
  const subtotal = linesWithProducts.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );
  const discount = subtotal >= 300000 ? Math.round(subtotal * 0.1) : 0;
  return {
    lines: linesWithProducts,
    units: linesWithProducts.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    discount,
    total: subtotal - discount,
  };
}

export function restoreCart(savedLines, products) {
  if (!Array.isArray(savedLines)) return { lines: [], discarded: true };
  const lines = [];
  const seen = new Set();
  let discarded = false;
  for (const saved of savedLines) {
    if (!saved || !Number.isInteger(saved.productId) || !Number.isInteger(saved.quantity)
      || saved.quantity < 1 || seen.has(saved.productId)) {
      discarded = true;
      continue;
    }
    const product = products.find((item) => item.id === saved.productId);
    if (!product || !product.active || saved.quantity > product.stock) {
      discarded = true;
      continue;
    }
    seen.add(saved.productId);
    lines.push({ productId: product.id, quantity: saved.quantity });
  }
  return { lines, discarded };
}
