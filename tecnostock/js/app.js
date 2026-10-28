import "./../components/product_list.js";
import "./../components/shopping_cart.js";
import { loadProducts } from "./api.js";
import {
  addProduct,
  calculateOrder,
  removeProduct,
  restoreCart,
  updateProductQuantity,
} from "./carrito.js";
import { readSavedCart, saveCart } from "./storage.js";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const productList = document.querySelector("#product-list");
const shoppingCart = document.querySelector("#shopping-cart");
const statusMessage = document.querySelector("#catalog-status");
const retryButton = document.querySelector("#retry-load");
const searchInput = document.querySelector("#search");
const categorySelect = document.querySelector("#category");
const sortSelect = document.querySelector("#sort");
const availableOnly = document.querySelector("#available-only");
const filtersForm = document.querySelector("#filters");
const clearFiltersButton = document.querySelector("#clear-filters");
const catalogCount = document.querySelector("#catalog-count");
const unitCount = document.querySelector("#total-unidades");
const confirmation = document.querySelector("#order-confirmation");
const orderTitle = document.querySelector("#order-title");
const orderId = document.querySelector("#order-id");
const orderSummary = document.querySelector("#order-summary");

let products = [];
let cartLines = [];
let cartMessage = "";

function renderProducts() {
  const search = searchInput.value.trim().toLocaleLowerCase("es");
  let visibleProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.description}`
      .toLocaleLowerCase("es")
      .includes(search);
    const matchesCategory = !categorySelect.value || product.category === categorySelect.value;
    const matchesAvailability = !availableOnly.checked || (product.active && product.stock > 0);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  if (sortSelect.value === "asc") {
    visibleProducts = [...visibleProducts].sort((a, b) => a.price - b.price);
  } else if (sortSelect.value === "desc") {
    visibleProducts = [...visibleProducts].sort((a, b) => b.price - a.price);
  }

  productList.products = visibleProducts;
  catalogCount.textContent = `Mostrando ${visibleProducts.length} de ${products.length} productos`;
}

function renderCart() {
  const order = calculateOrder(cartLines, products);
  shoppingCart.view = { ...order, message: cartMessage };
  unitCount.textContent = String(order.units);
}

function persistCart() {
  if (!saveCart(cartLines)) {
    cartMessage = "No se pudo guardar el carrito en el navegador. Seguirá disponible durante esta sesión.";
  }
}

function showCatalogError(error) {
  statusMessage.textContent = error.message || "No fue posible cargar el catálogo.";
  statusMessage.classList.add("is-error");
  retryButton.hidden = false;
}

async function initializeCatalog() {
  retryButton.hidden = true;
  statusMessage.classList.remove("is-error");
  statusMessage.textContent = "Cargando catálogo…";

  try {
    products = await loadProducts();
    const savedCart = readSavedCart();
    const restoredCart = restoreCart(savedCart.value, products);
    cartLines = restoredCart.lines;
    cartMessage = savedCart.warning;
    if (restoredCart.discarded) {
      cartMessage = [cartMessage, "Se retiraron del carrito algunos productos que ya no están disponibles."]
        .filter(Boolean)
        .join(" ");
    }
    if (cartLines.length > 0 && !saveCart(cartLines)) {
      cartMessage = [cartMessage, "No se pudo actualizar el carrito guardado en este navegador."]
        .filter(Boolean)
        .join(" ");
    }

    const categories = [...new Set(products.map((product) => product.category))]
      .sort((a, b) => a.localeCompare(b, "es"));
    categorySelect.replaceChildren(new Option("Todas las categorías", ""));
    for (const category of categories) {
      categorySelect.add(new Option(category, category));
    }

    statusMessage.textContent = "";
    renderProducts();
    renderCart();
  } catch (error) {
    showCatalogError(error);
  }
}

filtersForm.addEventListener("submit", (event) => event.preventDefault());
searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);
availableOnly.addEventListener("change", renderProducts);
clearFiltersButton.addEventListener("click", () => {
  filtersForm.reset();
  renderProducts();
});
retryButton.addEventListener("click", initializeCatalog);

productList.addEventListener("product-add-request", (event) => {
  const product = products.find((item) => item.id === event.detail.productId);
  try {
    cartLines = addProduct(cartLines, product);
    cartMessage = "";
    persistCart();
  } catch (error) {
    cartMessage = error.message;
  }
  renderCart();
});

shoppingCart.addEventListener("cart-change-request", (event) => {
  const { action, productId } = event.detail;
  try {
    if (action === "clear") {
      cartLines = [];
    } else if (action === "remove") {
      cartLines = removeProduct(cartLines, productId);
    } else if (action === "increment" || action === "decrement") {
      const product = products.find((item) => item.id === productId);
      cartLines = updateProductQuantity(cartLines, product, action === "increment" ? 1 : -1);
    }
    cartMessage = "";
    persistCart();
  } catch (error) {
    cartMessage = error.message;
  }
  renderCart();
});

shoppingCart.addEventListener("order-confirm-request", () => {
  try {
    const order = calculateOrder(cartLines, products);
    const identifier = `TS-${Date.now().toString(36).toUpperCase()}`;
    orderTitle.textContent = "¡Pedido preparado!";
    orderId.textContent = `Número de pedido: ${identifier}`;
    orderSummary.replaceChildren();

    const items = document.createElement("ul");
    for (const line of order.lines) {
      const item = document.createElement("li");
      item.textContent = `${line.product.name} × ${line.quantity} — ${currency.format(line.product.price * line.quantity)}`;
      items.append(item);
    }
    const total = document.createElement("p");
    total.textContent = `Total: ${currency.format(order.total)}`;
    orderSummary.append(items, total);
    confirmation.hidden = false;

    cartLines = [];
    cartMessage = "";
    persistCart();
    renderCart();
    confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    cartMessage = error.message;
    renderCart();
  }
});

initializeCatalog();
