# TecnoStock

Aplicación de catálogo y preparación de pedidos construida con HTML, CSS y JavaScript nativo. El catálogo se carga mediante `fetch()` desde `datos/products.json`; los componentes personalizados presentan los productos y el carrito.

## Ejecutar localmente

La aplicación requiere un servidor HTTP local para que el navegador permita cargar el JSON. Desde esta carpeta puedes usar, por ejemplo:

```powershell
python -m http.server 8000
```

Luego abre `http://localhost:8000` en el navegador. También puedes usar la extensión Live Server de VS Code. No abras `index.html` directamente como archivo `file://`.

El carrito se conserva en `localStorage` del mismo navegador. La confirmación del pedido es una simulación: no procesa pagos ni modifica las existencias del catálogo.
