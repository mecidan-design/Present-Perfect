/**
 * PRESENT PERFECT QUEST — resultados de los alumnos
 * ------------------------------------------------------------------
 * Va pegado a la planilla "Present Perfect - Resultados".
 * Recibe un POST con JSON desde el sitio, escribe una fila y le manda
 * un mail a la docente que el alumno eligio.
 *
 * El JSON que manda la pagina:
 * {
 *   "nombre_alumno": "Sofia Ramirez",
 *   "curso":         "6th B",
 *   "docente":       "paolafreiberg@buber.edu.ar",
 *   "docente_nombre":"Pao",
 *   "pagina":        "The Trails of For and Since",
 *   "puntaje":       "6 / 8",
 *   "resultado":     "el informe completo, con los errores",
 *   "timestamp":     "2026-09-17T00:16:11.186Z"
 * }
 * ------------------------------------------------------------------
 */

/**
 * IMPORTANTE — la lista blanca.
 * El script NO le manda mail a lo que venga en el pedido: solo a estas tres
 * direcciones. La URL del Web App es publica, y sin esta lista cualquiera
 * que la descubra podria usarla para mandar mails desde tu cuenta a
 * cualquier lado. Para agregar una docente, se agrega aca.
 */
var DOCENTES = {
  'anabella_ld@buber.edu.ar':   'Ani',
  'paolafreiberg@buber.edu.ar': 'Pao',
  'marisaolivero@buber.edu.ar': 'Mari'
};

var HOJA = 'Resultados';
var CABECERAS = ['Fecha', 'Alumno', 'Curso', 'Docente', 'Pagina', 'Puntaje', 'Detalle'];

/** Segundos que tienen que pasar antes de que el mismo alumno pueda volver a
 *  entregar la misma pagina. */
var ESPERA = 60;

/* ------------------------------------------------------------------ */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ status: 'error', message: 'pedido vacio' });
    }
    var d = JSON.parse(e.postData.contents);

    var docente = String(d.docente || '').trim().toLowerCase();
    if (!DOCENTES[docente]) {
      return json({ status: 'error', message: 'docente no habilitada' });
    }

    /* Dos destinos, dos tratos. texto() solo recorta: estos son los valores
       tal cual, y son los que van al mail. Para la planilla se los pasa
       despues por celda(), que es la que desactiva las formulas. */
    var alumno  = texto(d.nombre_alumno, 80) || '(sin nombre)';
    var curso   = texto(d.curso, 40);
    var pagina  = texto(d.pagina, 120) || '(sin pagina)';
    var puntaje = texto(d.puntaje, 40);
    var detalle = texto(d.resultado, 20000);

    var cuando = d.timestamp ? new Date(d.timestamp) : new Date();
    if (isNaN(cuando.getTime())) cuando = new Date();

    if (repetido(alumno, pagina)) {
      return json({ status: 'error', message: 'ya enviado, espera un momento' });
    }

    hoja().appendRow([
      cuando, celda(alumno), celda(curso),
      DOCENTES[docente] + ' <' + docente + '>',
      celda(pagina), celda(puntaje), celda(detalle)
    ]);

    MailApp.sendEmail({
      to: docente,
      subject: 'Resultado de ' + alumno + ' - ' + pagina,
      body: [
        alumno + (curso ? ' (' + curso + ')' : '') + ' entrego un resultado.',
        '',
        'Pagina:  ' + pagina,
        'Puntaje: ' + puntaje,
        'Fecha:   ' + Utilities.formatDate(cuando, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
        '',
        '--------------------------------------------------',
        detalle,
        '--------------------------------------------------',
        '',
        'Present Perfect Quest',
        'https://mecidan-design.github.io/Present-Perfect/'
      ].join('\n')
    });

    return json({ status: 'ok' });

  } catch (err) {
    /* Queda anotado en Ejecuciones, en el editor de Apps Script. */
    console.error(err);
    return json({ status: 'error', message: String(err) });
  }
}

/** Para poder abrir la URL en el navegador y ver que el Web App esta vivo. */
function doGet() {
  return json({ status: 'ok', message: 'Present Perfect Quest - resultados' });
}

/* ------------------------------------------------------------------ */

function hoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(HOJA);
  if (!h) h = ss.insertSheet(HOJA);
  if (h.getLastRow() === 0) {
    h.appendRow(CABECERAS);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, CABECERAS.length).setFontWeight('bold');
    h.setColumnWidth(7, 520);
    /* Refuerzo, ademas del apostrofe de celda(): las columnas que traen texto
       del alumno quedan con formato de texto plano, asi una celda que arranque
       con = no se interpreta ni aunque el apostrofe fallara. La columna Fecha
       (A) y la de Docente (D) quedan afuera: la fecha tiene que seguir siendo
       fecha. B y C son Alumno y Curso; E, F y G son Pagina, Puntaje y Detalle. */
    h.getRange('B:C').setNumberFormat('@');
    h.getRange('E:G').setNumberFormat('@');
  }
  return h;
}

/** Pasa a texto y recorta. Nada mas: esto es lo que lee una persona. */
function texto(v, max) {
  return String(v === null || v === undefined ? '' : v).slice(0, max);
}

/**
 * Lo mismo, pero listo para escribir en una celda.
 *
 * appendRow escribe igual que si uno tipeara: un valor que arranca con = + - o
 * @ deja de ser texto y pasa a ser una formula. Como la URL del Web App es
 * publica, cualquiera puede mandar un payload sin pasar por el sitio, y ahi
 * adentro puede venir cualquier cosa. El apostrofe adelante obliga a Sheets a
 * tratarlo como texto literal.
 *
 * SOLO para la planilla. En el mail no va: MailApp manda el apostrofe tal
 * cual, y la docente veria un apostrofe suelto al principio del renglon.
 */
function celda(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/**
 * Freno simple contra el boton apretado dos veces y contra el que quiera
 * llenar la planilla: el mismo alumno no puede entregar la misma pagina otra
 * vez hasta que pasen ESPERA segundos. El cache es del script, asi que vale
 * para todos los pedidos aunque sean anonimos.
 */
function repetido(alumno, pagina) {
  var cache = CacheService.getScriptCache();
  var clave = ('ppq|' + alumno + '|' + pagina)
                .toLowerCase().replace(/\s+/g, ' ').slice(0, 240);
  if (cache.get(clave)) return true;
  cache.put(clave, '1', ESPERA);
  return false;
}

function json(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CORRER ESTA FUNCION UNA VEZ, a mano, antes de implementar.
 * Sirve para dos cosas: dispara el cartel de permisos (planilla + mail) y
 * deja una fila y un mail de prueba para ver que todo el camino funciona.
 */
function probar() {
  var falso = {
    postData: {
      contents: JSON.stringify({
        nombre_alumno: 'Prueba',
        curso: '6th',
        docente: 'anabella_ld@buber.edu.ar',
        docente_nombre: 'Ani',
        /* la hora en el nombre para que la espera de 60 segundos no te frene
           si lo corres dos veces seguidas */
        pagina: 'Prueba desde el editor ' + new Date().getTime(),
        puntaje: '3 / 3',
        resultado: '=1+1  <- si esto se ve asi, y no como 2, las formulas estan desactivadas.',
        timestamp: new Date().toISOString()
      })
    }
  };
  Logger.log(doPost(falso).getContent());
}
