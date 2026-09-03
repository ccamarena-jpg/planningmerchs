/**
 * RutaMerch — Web App informativa sobre Google Sheets
 * ---------------------------------------------------
 * La base de datos vive en el propio Google Sheet (pestaña PLANNING).
 * Oficina llena el Sheet; merch y almacén ven su información en el link del app.
 *
 * PASOS:
 *  1) Crea un Google Sheet en blanco.
 *  2) Extensiones ▸ Apps Script. Pega este archivo en "Código.gs".
 *  3) Crea un archivo HTML llamado exactamente  Index  y pega el Index.html.
 *  4) Selecciona la función  setup  y pulsa Ejecutar (autoriza la primera vez).
 *  5) Implementar ▸ Nueva implementación ▸ Aplicación web.
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: (ver INSTRUCCIONES.md)
 *  6) Copia el link de la aplicación web y compártelo con tu equipo.
 */

const HEADERS = ['Fecha','Merch','Cadena','PDV','Dirección','Hora','Descripción','Materiales','Estado'];
const CADENAS = ['TAMBO','OXXO','REPSOL','PRIMAX','Otro'];
const ESTADOS = ['Pendiente','En camino','Completada'];

function SS(){ return SpreadsheetApp.getActiveSpreadsheet(); }
function TZ(){ return SS().getSpreadsheetTimeZone() || 'America/Lima'; }

/** Sirve el front-end. */
function doGet(){
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('RutaMerch')
    .addMetaTag('viewport','width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Crea/formatea las pestañas y carga datos de ejemplo. Ejecutar una sola vez. */
function setup(){
  const s = SS();
  const today = Utilities.formatDate(new Date(), TZ(), 'yyyy-MM-dd');

  // ---- PLANNING (base de datos principal) ----
  let p = s.getSheetByName('PLANNING') || s.insertSheet('PLANNING', 0);
  p.clear();
  p.getRange(1,1,1,HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#2f56d9').setFontColor('#ffffff');
  p.setFrozenRows(1);
  const sample = [
    [today,'Ana Torres','TAMBO','Tambo Av. Larco','Av. Larco 345, Miraflores','09:30','Instalar dispenser VUSE en caja','Dispenser exhibidor x1; Cinta doble contacto x2; Jala vista x1','Pendiente'],
    [today,'Ana Torres','OXXO','OXXO Benavides','Av. Benavides 1502, Miraflores','11:00','Cambiar afiches vencidos','Afiche A3 x4; Transformador eléctrico x1; Masking tape x1','Pendiente'],
    [today,'Luis Ramírez','PRIMAX','Primax Javier Prado','Av. Javier Prado Este 4200, San Isidro','10:00','Instalar luminaria LED en exhibidor','Luminaria LED x2; Transformador eléctrico x1; Cable mellizo x3','Pendiente']
  ];
  p.getRange(2,1,sample.length,HEADERS.length).setValues(sample);
  p.getRange(2,1,p.getMaxRows()-1,1).setNumberFormat('yyyy-mm-dd');
  p.getRange(2,6,p.getMaxRows()-1,1).setNumberFormat('@'); // Hora como texto
  p.setColumnWidths(1,HEADERS.length,130);
  p.setColumnWidth(5,220); p.setColumnWidth(7,240); p.setColumnWidth(8,340);

  // ---- MERCHS (lista de personal) ----
  let m = s.getSheetByName('MERCHS') || s.insertSheet('MERCHS');
  m.clear();
  m.getRange(1,1,1,1).setValues([['Nombre']]).setFontWeight('bold').setBackground('#0f9d8f').setFontColor('#fff');
  m.getRange(2,1,3,1).setValues([['Ana Torres'],['Luis Ramírez'],['Carlos Díaz']]);
  m.setFrozenRows(1); m.setColumnWidth(1,220);

  // ---- MATERIALES (catálogo de referencia) ----
  let mat = s.getSheetByName('MATERIALES') || s.insertSheet('MATERIALES');
  mat.clear();
  mat.getRange(1,1,1,2).setValues([['Material','Unidad']]).setFontWeight('bold').setBackground('#dd8709').setFontColor('#fff');
  const cat = [['Transformador eléctrico','unidad'],['Cinta doble contacto','rollo'],['Cinta de embalaje','rollo'],
    ['Dispenser exhibidor','unidad'],['Afiche A3','unidad'],['Jala vista','unidad'],['Luminaria LED','unidad'],
    ['Cable mellizo','metro'],['Masking tape','rollo'],['Base acrílica','unidad'],['Silicona líquida','tubo'],['Paños de limpieza','unidad']];
  mat.getRange(2,1,cat.length,2).setValues(cat);
  mat.setFrozenRows(1); mat.setColumnWidths(1,2,190);

  // ---- Validaciones en PLANNING (menús desplegables) ----
  const nRows = p.getMaxRows()-1;
  const merchRange = m.getRange(2,1,m.getMaxRows()-1,1);
  p.getRange(2,2,nRows,1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(merchRange,true).setAllowInvalid(true).build());
  p.getRange(2,3,nRows,1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(CADENAS,true).build());
  p.getRange(2,9,nRows,1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS,true).build());

  s.setActiveSheet(p);
  return 'Listo. Pestañas PLANNING, MERCHS y MATERIALES creadas.';
}

/** Datos iniciales para el front-end. */
function getBootData(){
  const s = SS();
  const m = s.getSheetByName('MERCHS');
  let merchs = [];
  if(m && m.getLastRow() > 1){
    merchs = m.getRange(2,1,m.getLastRow()-1,1).getValues()
      .map(function(r){ return String(r[0]).trim(); }).filter(String);
  }
  return { merchs: merchs, today: Utilities.formatDate(new Date(), TZ(), 'yyyy-MM-dd') };
}

/** Devuelve las filas del PLANNING para una fecha (yyyy-MM-dd). */
function getPlanning(dateStr){
  const p = SS().getSheetByName('PLANNING');
  if(!p || p.getLastRow() < 2) return [];
  const vals = p.getRange(2,1,p.getLastRow()-1,HEADERS.length).getValues();
  const out = [];
  vals.forEach(function(r){
    if(!r[1] && !r[3]) return; // fila vacía
    let f = r[0];
    let fecha = (f instanceof Date) ? Utilities.formatDate(f, TZ(), 'yyyy-MM-dd') : String(f).trim();
    if(dateStr && fecha !== dateStr) return;
    let hora = r[5];
    if(hora instanceof Date) hora = Utilities.formatDate(hora, TZ(), 'HH:mm');
    else hora = String(hora||'').trim();
    out.push({
      fecha: fecha,
      merch: String(r[1]||'').trim(),
      cadena: String(r[2]||'Otro').trim(),
      pdv: String(r[3]||'').trim(),
      direccion: String(r[4]||'').trim(),
      hora: hora,
      descripcion: String(r[6]||'').trim(),
      materiales: String(r[7]||'').trim(),
      estado: String(r[8]||'').trim()
    });
  });
  return out;
}
