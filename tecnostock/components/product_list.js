import "./product_card.js";

export class ProductList extends HTMLElement {
  set products(value) {
    this._products = value;
    this.render();
  }

  render() {
    if (!Array.isArray(this._products)) return;
    if (this._products.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-results";
      empty.textContent = "No encontramos productos con esos filtros. Prueba cambiarlos.";
      this.replaceChildren(empty);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "product-grid";
    for (const product of this._products) {
      const card = document.createElement("product-card");
      card.product = product;
      grid.append(card);
    }
    this.replaceChildren(grid);
  }
}

customElements.define("product-list", ProductList);
