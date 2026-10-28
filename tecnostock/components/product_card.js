const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export class ProductCard extends HTMLElement {
  set product(value) {
    this._product = value;
    this.render();
  }

  render() {
    if (!this._product) return;
    const product = this._product;
    const available = product.active && product.stock > 0;
    const article = document.createElement("article");
    article.className = "product-card";

    const top = document.createElement("div");
    top.className = "product-card-top";
    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = product.category;
    const availability = document.createElement("span");
    availability.className = `availability${available ? "" : " is-unavailable"}`;
    availability.textContent = available ? "Disponible" : "No disponible";
    top.append(category, availability);

    const name = document.createElement("h3");
    name.textContent = product.name;
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;

    const bottom = document.createElement("div");
    bottom.className = "product-card-bottom";
    const priceAndStock = document.createElement("div");
    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = currency.format(product.price);
    const stock = document.createElement("div");
    stock.className = "product-stock";
    stock.textContent = available ? `Existencias: ${product.stock}` : "Sin existencias";
    priceAndStock.append(price, stock);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "button button-primary";
    addButton.textContent = "Agregar";
    addButton.disabled = !available;
    addButton.setAttribute("aria-label", `Agregar ${product.name} al carrito`);
    addButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("product-add-request", {
        bubbles: true,
        composed: true,
        detail: { productId: product.id },
      }));
    });

    bottom.append(priceAndStock, addButton);
    article.append(top, name, description, bottom);
    this.replaceChildren(article);
  }
}

customElements.define("product-card", ProductCard);
