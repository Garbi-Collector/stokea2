## Publicar tu proyecto Angular en GitHub Pages

Para mostrar tu aplicación Angular en **GitHub Pages**, seguí estos pasos simples:

---

### Instalar la herramienta de despliegue

```bash
ng add angular-cli-ghpages
```

 Esto agrega el paquete que permite subir tu aplicación directamente a GitHub Pages desde Angular.

---

### Compilar el proyecto

```bash
ng build --output-path=dist --base-href="/<nombre-de-tu-repo>/"
```

 Genera los archivos listos para producción dentro de la carpeta `dist/`.
El parámetro `--base-href` indica a Angular dónde se va a alojar la aplicación (el nombre de tu repositorio).

---

###  Publicar en GitHub Pages

```bash
ngh --dir=dist/browser
```

 Este comando crea una rama `gh-pages` y sube los archivos compilados.
GitHub Pages usará esa rama para mostrar tu aplicación como una web.

---

### Resultado

Tu app estará disponible en:

```
https://<tu-usuario>.github.io/<nombre-de-tu-repo>/
```

