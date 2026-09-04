/**
 * RutaMerch — BACKEND (Apps Script) para el front-end en Vercel.
 * Lee Y escribe tu Google Sheet (pestaña PLANNING). El Sheet queda privado.
 *
 * El front-end en Vercel NO habla directo con esto: pasa por un mini-puente
 * (/api/exec en Vercel) para evitar bloqueos de permisos del navegador.
 *
 * Tras pegar este código: Implementar ▸ Gestionar implementaciones ▸ ✏️ ▸
 * Nueva versión. Acceso: "Cualquier persona". Ejecutar como: Yo.
 */

const SHEET_ID = '1-Veqcz2BN5EceTSKEG0XkOFumzDNKr1z0onaoocMSTc';
const HEADERS  = ['Fecha','Merch','Cadena','PDV','Dirección','Hora','Descripción','Materiales','Estado','Almacén','Activo','Tipo de tarea'];
const CADENAS  = ['TAMBO','OXXO','REPSOL','PRIMAX','Otro'];
const ESTADOS  = ['Pendiente','En camino','Completada'];
const ALMACEN  = ['Por preparar','Preparado','Entregado'];
const STORE_HEADERS = ['Id Store','Canal','Cadena','Nombre del POS','Dirección','Latitud','Longitud','Ciudad','Departamento','Modelo de cigarrera','Cantidad','Dispenser'];

function SS(){ return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }
function TZ(){ return SS().getSpreadsheetTimeZone() || 'America/Lima'; }
function todayStr(){ return Utilities.formatDate(new Date(), TZ(), 'yyyy-MM-dd'); }
function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function plan(){ return SS().getSheetByName('PLANNING'); }

/* ================= API GET (lectura) ================= */
function doGet(e){
  try{
    var p = (e && e.parameter) || {};
    return json({ ok:true, today:todayStr(), chains:CADENAS, estados:ESTADOS, almacenStates:ALMACEN,
      merchs:getMerchs(), materials:getMaterials(), stores:getStores(), rows:getRows(p.date||'') });
  }catch(err){ return json({ ok:false, error:String(err) }); }
}

function getUsers(){
  var u = SS().getSheetByName('USERS');
  if(!u || u.getLastRow()<2) return [];
  return u.getRange(2,1,u.getLastRow()-1,4).getValues().map(function(r){
    return { email:String(r[0]).trim(), password:String(r[1]).trim(), rol:String(r[2]).trim().toLowerCase(), nombre:String(r[3]).trim() };
  }).filter(function(x){return x.email;});
}
function getMerchs(){
  var us = getUsers().filter(function(u){return u.rol==='merch';}).map(function(u){return u.nombre||u.email;});
  if(us.length) return us;
  var m = SS().getSheetByName('MERCHS');
  if(!m || m.getLastRow()<2) return [];
  return m.getRange(2,1,m.getLastRow()-1,1).getValues().map(function(r){return String(r[0]).trim();}).filter(String);
}
function getMaterials(){
  var m = SS().getSheetByName('MATERIALES');
  if(!m || m.getLastRow()<2) return [];
  return m.getRange(2,1,m.getLastRow()-1,3).getValues()
    .map(function(r){return {name:String(r[0]).trim(),unit:String(r[1]||'').trim(),qty:Number(r[2])||1};}).filter(function(x){return x.name;});
}
function getStores(){
  var t = SS().getSheetByName('TIENDAS');
  if(!t || t.getLastRow()<2) return [];
  return t.getRange(2,1,t.getLastRow()-1,STORE_HEADERS.length).getValues().map(function(r){
    return { id:String(r[0]||'').trim(), canal:String(r[1]||'').trim(), cadena:String(r[2]||'').trim(), pos:String(r[3]||'').trim(),
      direccion:String(r[4]||'').trim(), lat:String(r[5]||'').trim(), lng:String(r[6]||'').trim(), ciudad:String(r[7]||'').trim(),
      departamento:String(r[8]||'').trim(), modelo:String(r[9]||'').trim(), cantidad:String(r[10]||'').trim(), dispenser:String(r[11]||'').trim() };
  }).filter(function(x){return x.id||x.pos;});
}
function storeRow(p){
  return [ p.id||'', p.canal||'', p.cadena||'', p.pos||'', p.direccion||'', p.lat||'', p.lng||'', p.ciudad||'', p.departamento||'', p.modelo||'', p.cantidad||'', p.dispenser||'' ];
}
function getRows(dateStr){
  var p = plan(); if(!p || p.getLastRow()<2) return [];
  var vals = p.getRange(2,1,p.getLastRow()-1,HEADERS.length).getValues();
  var out = [];
  vals.forEach(function(r,i){
    if(!r[1] && !r[3]) return;
    var f = r[0];
    var fecha = (f instanceof Date) ? Utilities.formatDate(f, TZ(), 'yyyy-MM-dd') : String(f).trim();
    if(dateStr && fecha !== dateStr) return;
    var hora = r[5]; if(hora instanceof Date) hora = Utilities.formatDate(hora, TZ(), 'HH:mm'); else hora=String(hora||'').trim();
    out.push({ row:i+2, fecha:fecha, merch:String(r[1]||'').trim(), cadena:String(r[2]||'Otro').trim(),
      pdv:String(r[3]||'').trim(), direccion:String(r[4]||'').trim(), hora:hora, descripcion:String(r[6]||'').trim(),
      materiales:String(r[7]||'').trim(), estado:String(r[8]||'Pendiente').trim(), almacen:String(r[9]||'Por preparar').trim(),
      activo:String(r[10]||'').trim(), tipo:String(r[11]||'').trim() });
  });
  return out;
}

/* ================= API POST (escritura) ================= */
function doPost(e){
  try{
    var p = JSON.parse(e.postData.contents);
    var a = p.action;
    var s = SS(), sh = plan();
    if(a==='create'){ sh.appendRow(rowFrom(p)); return json({ok:true}); }
    if(a==='bulk'){ (p.rows||[]).forEach(function(x){ sh.appendRow(rowFrom(x)); }); return json({ok:true, count:(p.rows||[]).length}); }
    if(a==='update'){ updateRow(sh, +p.row, p); return json({ok:true}); }
    if(a==='delete'){ if(+p.row>1) sh.deleteRow(+p.row); return json({ok:true}); }
    if(a==='addMerch'){ var nm=String(p.nombre||'').trim(); if(nm){ ensureSheet('MERCHS',['Nombre']).appendRow([nm]); } return json({ok:true}); }
    if(a==='addMaterial'){ var n=String(p.name||'').trim(); if(n){ ensureSheet('MATERIALES',['Material','Unidad','Cantidad']).appendRow([n,String(p.unit||'').trim(),Number(p.qty)||1]); } return json({ok:true}); }
    if(a==='setMaterials'){
      var mm=ensureSheet('MATERIALES',['Material','Unidad','Cantidad']);
      mm.getRange(1,1,1,3).setValues([['Material','Unidad','Cantidad']]).setFontWeight('bold');
      var last=mm.getLastRow(); if(last>1) mm.getRange(2,1,last-1,3).clearContent();
      var rows=(p.materials||[]).map(function(x){return [x.name,x.unit||'',Number(x.qty)||1];});
      if(rows.length) mm.getRange(2,1,rows.length,3).setValues(rows);
      return json({ok:true, count:rows.length});
    }
    if(a==='setStores'){
      var st=ensureSheet('TIENDAS',STORE_HEADERS);
      var last=st.getLastRow(); if(last>1) st.getRange(2,1,last-1,STORE_HEADERS.length).clearContent();
      var rows=(p.stores||[]).map(storeRow);
      if(rows.length) st.getRange(2,1,rows.length,STORE_HEADERS.length).setValues(rows);
      return json({ok:true, count:rows.length});
    }
    if(a==='addStore'){ ensureSheet('TIENDAS',STORE_HEADERS).appendRow(storeRow(p)); return json({ok:true}); }
    if(a==='login'){
      var em=String(p.email||'').trim().toLowerCase(), pw=String(p.password||'');
      var u=getUsers().filter(function(x){return x.email.toLowerCase()===em;})[0];
      if(u && String(u.password)===pw) return json({ok:true, user:{email:u.email, rol:u.rol, nombre:u.nombre||u.email}});
      return json({ok:false, error:'Correo o contraseña incorrectos'});
    }
    if(a==='setUsers'){
      var us2=ensureSheet('USERS',['Email','Password','Rol','Nombre']);
      var last=us2.getLastRow(); if(last>1) us2.getRange(2,1,last-1,4).clearContent();
      var rows=(p.users||[]).map(function(x){return [x.email,x.password,x.rol,x.nombre||''];});
      if(rows.length) us2.getRange(2,1,rows.length,4).setValues(rows);
      return json({ok:true, count:rows.length});
    }
    return json({ok:false, error:'accion desconocida: '+a});
  }catch(err){ return json({ ok:false, error:String(err) }); }
}

function rowFrom(p){
  return [ p.fecha||todayStr(), p.merch||'', p.cadena||'Otro', p.pdv||'', p.direccion||'', p.hora||'',
    p.descripcion||'', p.materiales||'', p.estado||'Pendiente', p.almacen||'Por preparar', p.activo||'', p.tipo||'' ];
}
function updateRow(sh, r, p){
  if(!(r>1)) return;
  var cur = sh.getRange(r,1,1,HEADERS.length).getValues()[0];
  var map = {fecha:0,merch:1,cadena:2,pdv:3,direccion:4,hora:5,descripcion:6,materiales:7,estado:8,almacen:9,activo:10,tipo:11};
  for(var k in map){ if(p[k]!==undefined && p[k]!==null){ cur[map[k]] = p[k]; } }
  sh.getRange(r,1,1,HEADERS.length).setValues([cur]);
}
function ensureSheet(name, header){
  var s=SS(), sh=s.getSheetByName(name);
  if(!sh){ sh=s.insertSheet(name); sh.getRange(1,1,1,header.length).setValues([header]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return sh;
}

/* ================= setup (una vez) ================= */
function setup(){
  var s = SS(), today = todayStr();
  var p = s.getSheetByName('PLANNING'); var nueva = !p;
  if(!p) p = s.insertSheet('PLANNING', 0);
  p.getRange(1,1,1,HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#2f56d9').setFontColor('#fff');
  p.setFrozenRows(1);
  if(nueva || p.getLastRow()<2){
    p.getRange(2,1,3,HEADERS.length).setValues([
      [today,'Ronald Carrera','TAMBO','Tambo Av. Larco','Av. Larco 345, Miraflores','09:30','Instalar cigarrera PIXEL 3.1','Parantes x2; Tarugos x4; Canaletas x2','Pendiente','Por preparar','Cigarrera','Instalación'],
      [today,'Ronald Carrera','OXXO','OXXO Benavides','Av. Benavides 1502, Miraflores','11:00','Mantenimiento eléctrico','Transformador eléctrico x1; Luces LED x2','Pendiente','Por preparar','Cigarrera','Mantenimiento eléctrico'],
      [today,'Jorge de La Cruz','PRIMAX','Primax Javier Prado','Av. Javier Prado Este 4200, San Isidro','10:00','Cambio de brazo hidráulico','Brazo hidráulico x1; Bisagra x2','Pendiente','Por preparar','Cigarrera','Cambio de brazo hidráulico']
    ]);
  }
  p.getRange(2,1,p.getMaxRows()-1,1).setNumberFormat('yyyy-mm-dd');
  p.getRange(2,6,p.getMaxRows()-1,1).setNumberFormat('@');
  if(!s.getSheetByName('MERCHS')){
    var m=s.insertSheet('MERCHS'); m.getRange(1,1,1,1).setValues([['Nombre']]).setFontWeight('bold').setBackground('#0f9d8f').setFontColor('#fff');
    m.getRange(2,1,3,1).setValues([['Ana Torres'],['Luis Ramírez'],['Carlos Díaz']]); m.setFrozenRows(1);
  }
  if(!s.getSheetByName('MATERIALES')){
    var mat=s.insertSheet('MATERIALES'); mat.getRange(1,1,1,3).setValues([['Material','Unidad','Cantidad']]).setFontWeight('bold').setBackground('#dd8709').setFontColor('#fff');
    mat.getRange(2,1,14,3).setValues([['Transformador eléctrico','unidad',1],['Luces LED','unidad',2],['Brazo hidráulico','unidad',1],['Bisagra','unidad',2],
      ['Placas','unidad',1],['Parantes','unidad',2],['Tarugos','unidad',4],['Canaletas','unidad',2],
      ['Cigarrera PIXEL 3.1','unidad',1],['Cigarrera PIXEL 3.2','unidad',1],['Cigarrera PROSEP','unidad',1],
      ['Dispenser mesa','unidad',1],['D. Tambo','unidad',1],['Glorificador','unidad',1]]); mat.setFrozenRows(1); mat.setColumnWidths(1,3,170);
  }
  if(!s.getSheetByName('TIENDAS')){
    var t=s.insertSheet('TIENDAS'); t.getRange(1,1,1,STORE_HEADERS.length).setValues([STORE_HEADERS]).setFontWeight('bold').setBackground('#0f9d8f').setFontColor('#fff');
    t.getRange(2,1,1,STORE_HEADERS.length).setValues([['TT-0001','Tradicional','TAMBO','Tambo Av. Larco','Av. Larco 345, Miraflores','-12.1219','-77.0297','Lima','Lima','Cigarrera 4 niveles','1','Sí']]);
    t.setFrozenRows(1); t.setColumnWidths(1,STORE_HEADERS.length,130);
  }
  if(!s.getSheetByName('USERS')){
    var u=s.insertSheet('USERS'); u.getRange(1,1,1,4).setValues([['Email','Password','Rol','Nombre']]).setFontWeight('bold').setBackground('#5b6472').setFontColor('#fff');
    u.getRange(2,1,7,4).setValues([
      ['rcarrera@ttaudit.com','123456','merch','Ronald Carrera'],
      ['jdelacruz@ttaudit.com','123456','merch','Jorge de La Cruz'],
      ['jjaramillo@ttaudit.com','123456','merch','Josue Jaramillo'],
      ['srubattini@ttaudit.com','123456','merch','Sergio Rubattini'],
      ['jbalcazar@ttaudit.com','123456','merch','Jeanfranco Balcazar'],
      ['pamela@ttaudit.com','123456','almacen','Pamela'],
      ['oficina@ttaudit.com','123456','oficina','Oficina']
    ]); u.setFrozenRows(1); u.setColumnWidths(1,4,180);
  }
  return 'Listo (con USERS, columna Almacén y API de escritura/login).';
}
