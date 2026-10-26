let carrito = {};

// 1. Cargar carrito desde localStorage
function cargarCarritoDesdeStorage() {
    const carritoGuardado = localStorage.getItem('carritoTienda');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    renderizarCarrito();
}

// 2. Guardar carrito en localStorage
function guardarCarritoEnStorage() {
    localStorage.setItem('carritoTienda', JSON.stringify(carrito));
}


// 3. Agregar producto
function agregarAlCarrito(idProducto) {
    const productoEncontrado = productosGlobales.find(p => p.id === Number(idProducto));
    if (!productoEncontrado) return;

    if (carrito[idProducto]) {
        carrito[idProducto].cantidad += 1;
    } else {
        carrito[idProducto] = {
            id: productoEncontrado.id,
            title: productoEncontrado.title,
            price: productoEncontrado.price,
            image: productoEncontrado.image,
            cantidad: 1
        };
    }
     guardarCarritoEnStorage();
    renderizarCarrito();
}



