// ═══════════════════════════════════════════════════════════════════════
//  Tesorería Adorno · manual.js — Manual de uso (overlay 📖, autoinyectable)
//  🚨 REGLA: cada vez que se agrega o cambia una función del módulo,
//  actualizar la sección correspondiente acá (y bump del ?v= en index.html).
// ═══════════════════════════════════════════════════════════════════════

function _mEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function _manualSecciones() {
  const s = (typeof session !== 'undefined' && session) || {};
  const admin = !!s.verTodo;
  const oficina = !!s.esOficina;
  const puedeCargar = !(s.rol === 'gerente' && !s.empleado_id) &&
                      !(s.rol === 'empleado' && !s.esCajera);

  const items = [
    {
      icon: '🔐', titulo: 'Entrar una sola vez',
      desc: 'La sesión se comparte entre todos los módulos del sistema.',
      pasos: [
        'En el Hub, con el ícono 👤 de arriba, ingresás con tu usuario y podés tildar "Confiar en esta computadora".',
        'Con eso tildado, entrás a todos los módulos de ese equipo sin volver a escribir la clave.',
        'En las computadoras de los locales, que usan varias personas, NO se tilda: cada módulo sigue pidiendo usuario y contraseña por separado.',
        'Al salir de cualquier módulo se cierra la sesión en todos. La computadora sigue marcada como de confianza hasta que lo apagues desde el Hub.',
      ],
    },
    {
      icon: '💰', titulo: 'Saldos',
      desc: oficina
        ? 'Saldos de todas las cuentas: cajas de los locales, bancos e inversiones.'
        : 'El saldo de la caja de tu local, siempre actualizado.',
      pasos: [
        'La ⭐ marca tu caja predeterminada: al abrir la app va directo a esa (se guarda en tu dispositivo).',
        'Tocá una cuenta para ver sus movimientos.',
        ...(oficina ? [
          'Las cards "Inversiones Pesos / Dólares" agrupan FIMA, Títulos y Plazo Fijo — tocá la flecha ▸ para el detalle.',
          'El saldo "real" lo informa el banco/MP con los bots; si un número parece viejo, mirá la fecha chiquita de actualización.',
        ] : []),
      ],
    },
    {
      icon: '📄', titulo: 'Movimientos',
      desc: 'Todos los ingresos y egresos de cada cuenta, con buscador.',
      pasos: [
        'Usá el buscador para filtrar por descripción, importe o destinatario.',
        'Las filas amarillas tienen una nota: el texto aparece en cursiva abajo de la descripción.',
        'Podés agregar o editar la nota de cualquier movimiento con el lápiz — la pantalla no se mueve al guardar.',
        ...(oficina ? ['El botón de exportar descarga los movimientos filtrados en Excel.'] : []),
      ],
    },
  ];

  if (puedeCargar) {
    items.push({
      icon: '➕', titulo: 'Cargar movimiento',
      desc: 'Ingresos y egresos de caja que no vienen solos del sistema.',
      pasos: [
        'Elegí tipo (ingreso/egreso), importe, categoría y descripción. Tu caja ya viene preseleccionada. La descripción/observación es OBLIGATORIA (qué es, a quién se le pagó, comprobante): sin ella no se guarda.',
        'En egresos elegís el respaldo: 🧾 Recibo firmado (el circuito de siempre), 🧺 Factura/ticket o 🏦 Depósito bancario — en los dos últimos le sacás foto desde el celu y no requiere firma.',
        'Cualquier empleada o usuario genérico del local puede entrar a Tesorería y ver solo la pestaña 🧺 Comprobantes: carga un egreso de la caja de su local adjuntando foto de factura/ticket o del comprobante de depósito, y ve el estado de lo que subió (rechazado → 📎 Volver a subir). Los recibos firmados siguen siendo solo de cajeras y encargadas.',
        'El respaldo elegido manda para todos los usuarios: si admin u Oficina cargan un egreso de una caja con "Recibo firmado", también sale el PDF con QR para imprimir y firmar. Oficina tiene además "∅ Sin respaldo" (default en cuentas de banco/MP; en cajas el default es recibo).',
        'La factura se envía sola a Anita para contabilizarla; el comprobante de depósito va a Marisa, que concilia los depósitos. Vos no tenés que mandar nada por mail.',
        'Las facturas y los comprobantes de depósito se guardan solos en el OneDrive (cada hora): la factura entra a CONTABILIZAR / 1 - SIN CONTABILIZAR y el depósito al archivero del mes. No hace falta mandar nada por mail.',
        'Si administración rechaza el archivo (foto equivocada, ilegible) te llega un aviso y el movimiento muestra "↩ Volver a subir": tocá ✏️, adjuntá el archivo correcto y listo.',
        '👤 Pago a Nora (cubre días en Alcorta o Unicenter): egreso de tu caja con la categoría "Pago Nora" y recibo firmado. Aparece el recuadro 📅 "Días que cubre este pago": cargá desde / hasta (inclusive) y cuántos días trabajó. Esos días deciden el MES de la liquidación de sueldos (no la fecha en que le pagaste) y tu caja decide el LOCAL. Si una semana cruza de mes, el sistema la reparte sola entre los dos meses.',
        'Si te equivocaste en los días, tocá ✏️ en el movimiento y corregilos: se puede aunque el recibo ya esté firmado.',
      ],
    });
    items.push({
      icon: '✍️', titulo: 'Pendientes de firma',
      desc: 'Egresos cargados con recibo que todavía no tienen el recibo firmado escaneado.',
      pasos: [
        'Cada egreso con respaldo "recibo" queda acá hasta que llega el escaneo firmado.',
        'Imprimí el recibo, hacelo firmar, escanealo y mandalo por mail — el sistema lo procesa solo leyendo el código QR.',
        'Si el QR no se lee, llega un mail automático pidiendo rehacer el escaneo.',
        '↩ RECHAZADO: si administración te rechaza un comprobante, aparece acá en rojo con el motivo. Tenés dos salidas: ✏️ Corregir (cambiar importe, fecha, descripción o categoría) o ✗ Anular (el movimiento desaparece y la caja vuelve como estaba).',
        'Anular pide un motivo y es obligatorio: queda registrado quién lo anuló y por qué. Si ya imprimiste el papel del recibo, rompelo.',
        '🔒 HASTA CUÁNDO lo podés tocar: mientras el comprobante no haya salido del local. Apenas descargás el PDF para hacerlo firmar, el papel puede estar en camino, así que se cierra la edición — y lo mismo si administración ya lo controló.',
        '🖨 IMPRIMIR el recibo NO lo traba: si al verlo en papel te das cuenta de que está mal, todavía podés corregirlo o anularlo. Eso sí, el papel impreso deja de servir — rompelo e imprimí de nuevo (el sistema te lo avisa y te vuelve a pedir la impresión).',
        'El recibo se traba cuando VUELVE FIRMADO y queda guardado en el archivero de Oficina, o cuando administración lo controla. Ahí ya no se toca desde el local.',
        'Si ya mandaste el escaneo firmado y hay algo mal, usá ⚠️ Avisar a Oficina: les llega la alerta con tu motivo, ellos lo rechazan y ahí el comprobante se te vuelve a abrir para corregirlo o anularlo.',
        '🔁 CAMBIAR EL TIPO: al corregir podés pasar el comprobante entre 🧾 Recibo, 🧺 Factura y 🏦 Depósito. Es para el caso típico de haber generado un recibo cuando era un depósito bancario: no hace falta anular y cargar todo de nuevo.',
        'Al pasarlo a factura o depósito hace falta adjuntar la foto, y deja de llevar firma. Al pasarlo a recibo pasa a llevar firma: hay que descargar el PDF nuevo, hacerlo firmar y mandarlo por mail.',
        'Solo se puede con los comprobantes de la caja de TU local. Una vez firmado y guardado en el archivero, lo resuelve administración.',
      ],
    });
  }

  if (oficina) {
    items.push({
      icon: '📅', titulo: 'Pagos pendientes',
      desc: 'La agenda de pagos: impuestos, proveedores, empleados, socios. Reemplaza la hoja "Pendientes" del Libro Bancos.',
      pasos: [
        'Al cargar elegís la categoría (Impuestos / Proveedores / Empleados / Socios / Otros) y el segundo desplegable trae el listado real: impuestos del catálogo, proveedores de Dragonfish (buscás por nombre o CUIT), empleadas con su cuota de préstamo.',
        'Con ➕ agregás un ítem nuevo al catálogo y con 🗑 lo das de baja. Lo mismo para los locales de pago.',
        'Recurrentes: si ponés cantidad de cuotas, se generan TODAS juntas con sus vencimientos ("CUOTA i DE n"); sin cantidad, se renueva sola al pagarla.',
        'Cuotas: con el filtro "Pendientes" ves todas las que faltan pagar. Si corregís una cuota (importe, concepto, fecha, medio…), el sistema pregunta si aplicar el mismo cambio a las cuotas siguientes: Aceptar = a todas (si cambiaste la fecha, las siguientes se corren mes a mes desde esa); Cancelar = solo a esa. Al cancelar una cuota también pregunta si cancelar las que siguen. También podés convertir un pago ya cargado en cuotas: editalo, tildá Recurrente y poné la cantidad de veces.',
        'Los préstamos y adelantos aceptados en RRHH entran solos: el desembolso y las cuotas por banco (solo capital) se crean automáticamente.',
        '↩ Volver a pendiente: si algo figura pagado por error (el bot matcheó mal, o se tildó de más), abrilo con "Ver" y usá el botón "↩ Volver a pendiente" — se deshace la marca, se desengancha del movimiento del banco y queda registrado quién lo deshizo.',
        'Ojo con proveedores de importe fijo mensual: si el bot no está seguro de que un pago viejo corresponda a la factura nueva, la deja "por confirmar" en vez de pagarla — confirmala vos.',
        'Cuando el bot del banco detecta la transferencia, el pago se marca PAGADO solo (matchea por CUIT, importe y fecha ±7 días). Si el sistema no está seguro, queda "por confirmar" y lo confirmás o rechazás vos.',
        'Filtros arriba: Pendientes / Solo pagados / Todos, y orden por vencimiento, importe o proveedor.',
        'Buscador: escribí tranquila la palabra entera — busca cuando dejás de tipear (medio segundo) o al apretar Enter.',
        'Todos los días a las 8 le llega a JP el aviso de lo que vence hoy y el próximo día hábil.',
      ],
    });
    items.push({
      icon: '🤖', titulo: 'Bots',
      desc: 'Los robots que traen la información de los bancos: Galicia, Mercado Pago y PPI.',
      pasos: [
        'Ves el estado de cada bot: cuándo corrió por última vez y si terminó bien.',
        '"Ejecutar ahora" lo pone en cola — tarda unos minutos en arrancar.',
        'Si un bot falla o se atrasa, a JP le llega una alerta automática — no hace falta vigilarlos.',
      ],
    });
  }

  // (22-sep) Para TODAS las usuarias, cajeras y encargadas
  items.push({
    icon: '💸', titulo: 'Transferencias recibidas',
    desc: 'Lo que entra al CVU/alias de Mercado Pago de la empresa (la cuenta madre, que las cuentas colaboradoras no ven).',
    pasos: [
      'Muestra las transferencias LIBRES de las últimas 48 horas (las reclamadas y las más viejas desaparecen de la lista; el movimiento sigue en Tesorería). No manda notificaciones: entrás cuando el cliente te dice que transfirió. Los cobros por QR y Point NO aparecen acá: esos ya los ven en su cuenta de MP.',
      'Mercado Pago no informa QUIÉN transfirió: compará importe y hora con el comprobante que muestra el cliente. El código de la pestaña es el mismo que figura en su comprobante.',
      'Si el cliente dice que ya transfirió y no aparece, tocá "🔄 Verificar ahora": consulta MP en el momento (unos segundos). Las transferencias también entran solas cada 15 minutos.',
      'Antes de entregar, tocá "✔ Es mía" y anotá el cliente o qué se llevó. Queda registrada a nombre de tu local y DESAPARECE de la lista para todos: el otro local ya no la ve. Si el cliente dice que transfirió y no la encontrás, puede que otro local ya la haya reclamado: hablá con ellos antes de entregar.',
    ],
  });

  if (admin) {
    items.push({
      icon: '🔐', titulo: 'Solo admin',
      desc: 'Herramientas exclusivas de administración.',
      pasos: [
        'PPI (inversiones bursátiles): solo visible para el admin.',
        '"📋 Pegar tabla del banco" en Cargar: importación masiva de movimientos pegando desde Office Banking.',
        'Los accesos de cada usuaria se manejan por email — pedir cambios a Claude/JP.',
      ],
    });
  }

  return items;
}

function abrirManual() {
  if (document.getElementById('manual-overlay')) return;
  const items = _manualSecciones();
  const ov = document.createElement('div');
  ov.id = 'manual-overlay';
  ov.innerHTML = `
    <div class="m-box">
      <div class="m-head">
        <span style="font-size:22px;">📖</span>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:16px;">Manual · Tesorería</div>
          <div style="font-size:12px;opacity:.85;">Guía rápida de cada herramienta del módulo</div>
        </div>
        <button class="m-close" onclick="cerrarManual()">✕</button>
      </div>
      ${items.map((s, i) => `
        <div class="m-sec">
          <div class="m-tit">${s.icon} ${i + 1}. ${_mEsc(s.titulo)}</div>
          <div class="m-desc">${_mEsc(s.desc)}</div>
          <ul class="m-pasos">${s.pasos.map(p => `<li>${_mEsc(p)}</li>`).join('')}</ul>
        </div>`).join('')}
      <div class="m-foot">💡 Este manual se actualiza junto con el sistema. ¿Falta algo o no funciona? Avisale a JP.</div>
    </div>`;
  ov.addEventListener('click', e => { if (e.target === ov) cerrarManual(); });
  document.body.appendChild(ov);
  _manualLupa(ov);
  document.body.style.overflow = 'hidden';
}

function cerrarManual() {
  const ov = document.getElementById('manual-overlay');
  if (ov) ov.remove();
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarManual(); });

(function _manualInit() {
  const css = document.createElement('style');
  css.textContent = `
    #manual-overlay{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:20px 12px;overflow-y:auto;-webkit-overflow-scrolling:touch;}
    #manual-overlay .m-box{background:#f8fafc;border-radius:14px;max-width:760px;width:100%;padding-bottom:6px;box-shadow:0 20px 60px rgba(0,0,0,.3);}
    #manual-overlay .m-head{position:sticky;top:0;background:#b45309;color:#fff;padding:14px 18px;border-radius:14px 14px 0 0;display:flex;align-items:center;gap:10px;z-index:1;}
    #manual-overlay .m-close{background:rgba(255,255,255,.18);border:none;color:#fff;font-size:16px;border-radius:8px;padding:6px 11px;cursor:pointer;}
    #manual-overlay .m-sec{background:#fff;border:1px solid #e2e8f0;border-left:4px solid #b45309;border-radius:10px;margin:14px 14px 0;padding:14px 18px;}
    #manual-overlay .m-tit{font-weight:700;font-size:15px;margin-bottom:4px;color:#7c2d12;}
    #manual-overlay .m-desc{font-size:13px;color:#475569;margin-bottom:8px;}
    #manual-overlay .m-pasos{margin:0 0 2px 18px;padding:0;font-size:13px;line-height:1.65;color:#334155;}
    #manual-overlay .m-pasos li{margin-bottom:4px;}
    #manual-overlay .m-foot{margin:16px 14px 12px;background:#fef3c7;border-left:4px solid #d97706;border-radius:8px;padding:11px 14px;font-size:12.5px;color:#92400e;}`;
  document.head.appendChild(css);

  const tabs = document.getElementById('tabs');
  if (tabs) {
    const b = document.createElement('button');
    b.textContent = '📖 Manual';
    b.onclick = (ev) => { ev.stopPropagation(); tabs.classList.remove('open'); abrirManual(); };
    tabs.appendChild(b);
  }
})();

// ── 🔍 Lupa del manual (29-sep, pedido Contreras): busca por palabra, sin tildes ni mayúsculas.
//    Deja solo las secciones que la contienen, dentro de ellas los pasos que la contienen,
//    y resalta la palabra. Mismo bloque en todos los módulos (el de RRHH usa _mLupaFiltrar).
function _mLupaNorm(s){ return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function _mLupaMarcar(el, q){
  const nodos = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) nodos.push(w.currentNode);
  nodos.forEach(n => {
    const t = n.nodeValue; let norm = '', mapa = [];
    for (let i = 0; i < t.length; i++){ const c = _mLupaNorm(t[i]); for (let k = 0; k < c.length; k++){ norm += c[k]; mapa.push(i); } }
    let desde = 0, pos, frag = null, ult = 0;
    while (q && (pos = norm.indexOf(q, desde)) >= 0){
      frag = frag || document.createDocumentFragment();
      const a = mapa[pos], b = mapa[pos + q.length - 1] + 1;
      if (a > ult) frag.appendChild(document.createTextNode(t.slice(ult, a)));
      const m = document.createElement('mark'); m.textContent = t.slice(a, b);
      m.style.cssText = 'background:#fde047;color:inherit;padding:0 1px;border-radius:3px'; frag.appendChild(m);
      ult = b; desde = pos + q.length;
    }
    if (frag){ if (ult < t.length) frag.appendChild(document.createTextNode(t.slice(ult))); n.parentNode.replaceChild(frag, n); }
  });
}
function _mLupaFiltrar(cont, selSec, texto, info){
  if (!cont) return;
  const q = _mLupaNorm(String(texto || '').trim());
  let vistas = 0;
  cont.querySelectorAll(selSec).forEach(sec => {
    if (sec.dataset.mOrig == null) sec.dataset.mOrig = sec.innerHTML; else sec.innerHTML = sec.dataset.mOrig;
    if (!q){ sec.style.display = ''; return; }
    const lis = [...sec.querySelectorAll('li')];
    const enLis = lis.filter(li => _mLupaNorm(li.textContent).includes(q));
    const hay = _mLupaNorm(sec.textContent).includes(q);
    sec.style.display = hay ? '' : 'none';
    if (!hay) return;
    vistas++;
    if (enLis.length) lis.forEach(li => { if (!enLis.includes(li)) li.style.display = 'none'; });
    _mLupaMarcar(sec, q);
  });
  if (info) info.textContent = !q ? '' : vistas ? `${vistas} ${vistas === 1 ? 'sección' : 'secciones'} con «${String(texto).trim()}»` : `No encontré «${String(texto).trim()}» en el manual.`;
  const primera = q && cont.querySelector('mark');
  if (primera) primera.scrollIntoView({block: 'center', behavior: 'smooth'});
}
function _manualLupa(ov){
  const head = ov && ov.querySelector('.m-head'); if (!head) return;
  head.style.flexWrap = 'wrap';
  const box = document.createElement('div');
  box.style.cssText = 'flex-basis:100%;display:flex;gap:8px;align-items:center;margin-top:8px';
  box.innerHTML = '<input type="search" placeholder="🔍 Buscar en el manual (por ej.: equivalencias, remito, echeq)…" '
    + 'style="flex:1;min-width:0;padding:8px 11px;border-radius:9px;border:none;font-size:14px;color:#0f172a;font-family:inherit">'
    + '<span class="m-lupa-info" style="font-size:12px;opacity:.9;white-space:nowrap"></span>';
  head.appendChild(box);
  const inp = box.querySelector('input'), info = box.querySelector('.m-lupa-info');
  let t = null;
  inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => _mLupaFiltrar(ov, '.m-sec', inp.value, info), 250); });
  inp.addEventListener('keydown', e => { if (e.key === 'Escape' && inp.value){ e.stopPropagation(); inp.value = ''; _mLupaFiltrar(ov, '.m-sec', '', info); } });
  setTimeout(() => inp.focus(), 50);
}
