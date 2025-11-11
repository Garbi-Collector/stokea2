# Angular + Electron Template

Este repositorio sirve como punto de partida para crear aplicaciones **Angular** que integren **Electron**, ahorrando el proceso inicial de configuración cada vez que comiences un nuevo proyecto.

---

## 1. Clonar o usar como plantilla

Puedes descargar este repositorio o usarlo como *template* directamente desde tu cuenta de GitHub.

Una vez lo tengas en tu equipo local, abre el proyecto y localiza el archivo [`package.json`](./package.json).



---

## 2. Configurar la información del proyecto

Dentro del archivo `package.json`, verás las primeras variables del proyecto. Modifícalas según tu aplicación:

```json
"name": "ejemplo",
"main": "main.js",
"version": "1.0",
"author": "garbi.dev",
"description": "ejemplo de descripcion"
````

Reemplaza estos valores por el nombre, versión, autor y descripción de tu propio proyecto.

---

## 3. Actualizar el nombre del proyecto para SSR

Dentro del mismo archivo, en la sección de **scripts**, encontrarás una línea similar a la siguiente:

```json
"serve:ssr:angular-electron-template": "node dist/angular-electron-template/server/server.mjs",
```

Debes modificar el nombre para que coincida con el de tu proyecto Angular.
Por ejemplo, si tu proyecto se llama **pepito**, cámbialo así:

```json
"serve:ssr:pepito": "node dist/pepito/server/server.mjs",
```

al mismo tiempo que se cambia el nombre del proyecto tambien se debe modificar el [main.js](/main.js) en esta parte para que coincida la carpeta en donde va a buscar

```js
  mainWindow.loadURL(
  url.format({
    pathname: path.join(__dirname, `/dist/angular-electron-template/browser/index.html`),
    protocol: "file:",
    slashes: true
  })
);
```

Esto asegura que Angular Universal (SSR) apunte correctamente a la carpeta generada por tu build.

---

## 4. Configuración del apartado `build`

Al final del `package.json`, encontrarás el bloque de configuración de **Electron Builder**:

```json
"build": {
  "appId": "garbi.ejemplo",
  "productName": "ejemplo",
  "mac": {
    "category": "public.app-category.developer-tools"
  },
  "files": [
    "**/*",
    "dist/ejemplo/browser/**"
  ]
}
```

Deberás ajustar los siguientes valores:

* **appId** → Identificador único de tu aplicación.
  Usa el formato de dominio invertido, por ejemplo:
  `"appId": "com.tunombre.pepito"`

* **productName** → Nombre que se mostrará en el instalador y en la aplicación.
  `"productName": "Pepito"`

* **files** → Asegúrate de que la ruta dentro de `dist/` coincida con el nombre de tu proyecto Angular.
  Por ejemplo: `"dist/pepito/browser/**"`

---

## 5. Instalar dependencias de Electron

Por último, instala las dependencias necesarias ejecutando los siguientes comandos en la raíz del proyecto:

```bash
npm install --save-dev electron
npm install --save-dev electron-builder
```

---

## 6. Construcción y ejecución

* Para ejecutar el proyecto en modo desarrollo con Angular:

  ```bash
  npm start
  ```

* Para ejecutar la versión Electron:

  ```bash
  npm run electron
  ```

* Para generar el instalador de escritorio (build final):

  ```bash
  npm run dist
  ```

---

## 7. Notas adicionales

* Este proyecto incluye configuración básica para **SSR (Server Side Rendering)**, aunque no es obligatoria para ejecutar la app con Electron.
* Si planeas renombrar el proyecto o crear nuevas variantes, recuerda actualizar el nombre del directorio dentro de `dist/`.

---

### Autor

Desarrollado por **garbi.dev**
Puedes usar este template libremente para tus propios proyectos de Angular + Electron.


