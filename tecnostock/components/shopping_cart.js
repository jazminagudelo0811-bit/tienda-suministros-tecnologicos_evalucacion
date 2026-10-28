const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export class ShoppingCart extends HTMLElement {
  set view(value) {
    this._view = value;
    this.render();
  }

  emitAction(action, productId) {
    this.dispatchEvent(new CustomEvent("cart-change-request", {
      bubbles: true,
      composed: true,
      detail: { action, productId },
    }));
  }

  render() {
    if (!this._view) return;
    const { lines, units, subtotal, discount, total } = this._view;
    const panel = document.createElement("div");
    panel.className = "cart-panel";
    const body = document.createElement("div");

    if (lines.length === 0) {
      const empty = document.createElement("p");
      empty.className = "cart-empty";
      empty.textContent = "Tu carrito está vacío. Agrega productos del catálogo para preparar tu pedido.";
      body.append(empty);
    } else {
      body.className = "cart-lines";
      for (const line of lines) {
        const row = document.createElement("article");
        row.className = "cart-line";

        const details = document.createElement("div");
        const name = document.createElement("p");
        name.className = "cart-item-name";
        name.textContent = line.product.name;
        const unitPrice = document.createElement("p");
        unitPrice.className = "cart-item-price";
        unitPrice.textContent = `${currency.format(line.product.price)} c/u`;
        details.append(name, unitPrice);

        const subtotalCell = document.createElement("div");
        subtotalCell.className = "cart-line-subtotal";
        subtotalCell.textContent = currency.format(line.product.price * line.quantity);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";
        const decrement = document.createElement("button");
        decrement.type = "button";
        decrement.className = "quantity-button";
        decrement.textContent = "−";
        decrement.disabled = line.quantity <= 1;
        decrement.setAttribute("aria-label", `Disminuir cantidad de ${line.product.name}`);
        decrement.addEventListener("click", () => this.emitAction("decrement", line.product.id));
        const quantity = document.createElement("span");
        quantity.className = "quantity-value";
        quantity.textContent = String(line.quantity);
        quantity.setAttribute("aria-label", `Cantidad: ${line.quantity}`);
        const increment = document.createElement("button");
        increment.type = "button";
        increment.className = "quantity-button";
        increment.textContent = "+";
        increment.disabled = line.quantity >= line.product.stock;
        increment.setAttribute("aria-label", `Aumentar cantidad de ${line.product.name}`);
        increment.addEventListener("click", () => this.emitAction("increment", line.product.id));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-button";
        remove.textContent = "Eliminar";
        remove.addEventListener("click", () => this.emitAction("remove", line.product.id));
        controls.append(decrement, quantity, increment, remove);
        row.append(details, subtotalCell, controls);
        body.append(row);
      }
    }

    const summary = document.createElement("div");
    summary.className = "cart-summary";
    const actions = document.createElement("div");
    actions.className = "cart-actions";
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "button button-quiet";
    clear.textContent = "Vaciar carrito";
    clear.disabled = lines.length === 0;
    clear.addEventListener("click", () => this.emitAction("clear"));
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "button button-primary";
    confirm.textContent = "Confirmar pedido";
    confirm.disabled = lines.length === 0;
    confirm.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("order-confirm-request", {
        bubbles: true,
        composed: true,
      }));
    });
    actions.append(clear, confirm);

    const totals = document.createElement("div");
    totals.className = "cart-totals";
    totals.append(
      this.totalRow("Unidades", String(units)),
      this.totalRow("Subtotal", currency.format(subtotal)),
      this.totalRow("Descuento (10 %)", `− ${currency.format(discount)}`, "discount"),
      this.totalRow("Total", currency.format(total), "final"),
    );
    if (subtotal < 300000 && subtotal > 0) {
      const note = document.createElement("p");
      note.className = "discount-note";
      note.textContent = `Agrega ${currency.format(300000 - subtotal)} para obtener el 10 % de descuento.`;
      totals.append(note);
    }
    summary.append(actions, totals);
    if (this._view.message) {
      const message = document.createElement("p");
      message.className = "cart-message";
      message.setAttribute("role", "status");
      message.textContent = this._view.message;
      summary.append(message);
    }
    panel.append(body, summary);
    this.replaceChildren(panel);
  }

  totalRow(label, value, variant = "") {
    const row = document.createElement("div");
    row.className = `cart-total-row ${variant}`.trim();
    const title = document.createElement("span");
    title.textContent = label;
    const amount = document.createElement("strong");
    amount.textContent = value;
    row.append(title, amount);
    return row;
  }
}

customElements.define("shopping-cart", ShoppingCart);
