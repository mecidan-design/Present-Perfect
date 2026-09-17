# fuentes — cómo se fabrica la Present Perfect Quest

Los HTML de la raíz de este repo son el **resultado**. Acá está lo que los
produce y lo que los verifica.

El sitio vive en https://mecidan-design.github.io/Present-Perfect/

---

## Cómo está armada una página

Un solo archivo HTML, sin dependencias salvo Google Fonts. Vanilla JS.

```
head.part            cabecera + CSS base de la estética fantasy
  + *-extra.css      CSS propio de cada tipo de página
  + <body>           markup, de un .part o generado por Python
  + <script id="data-block">      SOLO contenido: cero referencias al DOM
  + <script id="engine-block">    SOLO motor: no sabe nada del contenido
```

Los dos bloques separados no son estética: **el bloque de datos se puede
correr solo en Node** (`vm.runInContext`) y auditar sin navegador. Todos los
verificadores dependen de eso. Si se mezclan, se pierde la verificación.

Dos detalles que parecen caprichos y no lo son:

- **El DOM guarda solo un índice numérico** (`data-id="7"`), nunca JSON. Las
  contracciones del inglés (`hasn't`) rompen el JSON dentro de un `data-*`.
- **Las opciones se barajan en el código.** Escritas a mano, la respuesta
  correcta cae siempre en el mismo botón. Ver `verificar-azar.js`.

## Los generadores

| Script | Qué produce |
|---|---|
| `build.py` | las siete puertas + el hub `seven-gates.html` |
| `build_trails.py` | `trails-of-for-and-since.html` (Stop II) |
| `build_sealed.py` | `citadel-of-five-doors.html` (Stop VI, los cinco juegos) |
| `build_site.py` | histórico: renombró las páginas viejas a las URLs temáticas. **De un solo uso**, ya no corre |
| `patch_informe.py` | inyecta la tarjeta del informe en las catorce páginas |

`hall-of-ever-and-never.html`, `market-of-just-already-and-yet.html`,
`vault-of-irregular-verbs.html` e `index.html` ya no se generan: se editan a
mano.

> **La trampa:** los build generan las páginas **sin** la tarjeta del informe.
> Después de regenerar cualquier página hay que volver a correr
> `python patch_informe.py`.

## La entrega de resultados

- `informe.part` + `informe.css` — la tarjeta que ve el alumno (nombre, curso,
  docente, botón). Lee el resultado **de la pantalla**, no toca ninguno de los
  seis motores.
- `apps-script-resultados.gs` — el backend. Va pegado en el editor de Apps
  Script de la planilla *Present Perfect - Resultados*, publicado como Web App
  (*Ejecutar como: yo*, *Acceso: cualquier persona*).

Para cambiar el código del script: *Implementar → **Administrar
implementaciones** → lápiz → Versión: **Nueva versión***. Así la URL no cambia.
Si usás *Nueva implementación* te da otra URL y hay que reemplazarla en
`informe.part` y volver a correr `patch_informe.py`.

## Verificar antes de entregar

El profesor no puede depurar lo que se le entrega: verificar es parte del
trabajo. Cada verificador toma el HTML como argumento.

```bash
node verificar-u13.js       "../hall-of-ever-and-never.html"
node verificar-trails.js    "../trails-of-for-and-since.html"
node verificar-plus.js      "../market-of-just-already-and-yet.html"
node verificar-speedrun.js  "../vault-of-irregular-verbs.html"
node verificar-sealed.js    "../citadel-of-five-doors.html"
node verificar-minitests.js "../gate-of-beginnings.html"
node verificar-azar.js      "../citadel-of-five-doors.html"
```

Todos chequean lo mismo de fondo: que los dos bloques compilen, que no haya
audio, que **toda solución que la pantalla muestra sea aceptada por su propio
corrector**, que los errores típicos sean rechazados, que no aparezca
vocabulario fuera del material, que esté todo en inglés y que el footer del
copyright esté al pie.

`comparar-docx.py` es el más fuerte: reabre el `.docx` original del profesor y
compara celda por celda contra el HTML.

## Reglas que no se negocian

1. Toda página termina con `Copyright Prof Dan M. Mecikovsky` en un `<footer>`,
   fuera de las secciones que se ocultan.
2. El texto del material va **literal**: nunca corregir typos del profesor. Se
   señalan aparte.
3. Todo lo que ve el alumno, en inglés. Español solo en los comentarios.
4. **Sin sonido de ninguna clase.** Los verificadores lo chequean.
5. Ningún verbo fuera del material de la unidad.
6. Nada de "worksheet", "mini test" ni "Grammar: Plus" en el texto del alumno:
   todo vive dentro del mundo de la quest.
