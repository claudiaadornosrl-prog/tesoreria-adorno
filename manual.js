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
        'Elegí tipo (ingreso/egreso), importe, categoría y descripción. Tu caja ya viene preseleccionada.',
        'En egresos elegís el respaldo: 🧾 Recibo firmado (el circuito de siempre), 🧺 Factura/ticket o 🏦 Depósito bancario — en los dos últimos le sacás foto desde el celu y no requiere firma.',
        'La factura se envía sola a Anita para contabilizarla; el comprobante de depósito va a Marisa, que concilia los depósitos. Vos no tenés que mandar nada por mail.',
        'Las facturas viajan solas por mail a administración; no hace falta avisar.',
      ],
    });
    items.push({
      icon: '✍️', titulo: 'Pendientes de firma',
      desc: 'Egresos cargados con recibo que todavía no tienen el recibo firmado escaneado.',
      pasos: [
        'Cada egreso con respaldo "recibo" queda acá hasta que llega el escaneo firmado.',
        'Imprimí el recibo, hacelo firmar, escanealo y mandalo por mail — el sistema lo procesa solo leyendo el código QR.',
        'Si el QR no se lee, llega un mail automático pidiendo rehacer el escaneo.',
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
        'Los préstamos y adelantos aceptados en RRHH entran solos: el desembolso y las cuotas por banco (solo capital) se crean automáticamente.',
        '↩ Volver a pendiente: si algo figura pagado por error (el bot matcheó mal, o se tildó de más), abrilo con "Ver" y usá el botón "↩ Volver a pendiente" — se deshace la marca, se desengancha del movimiento del banco y queda registrado quién lo deshizo.',
        'Ojo con proveedores de importe fijo mensual: si el bot no está seguro de que un pago viejo corresponda a la factura nueva, la deja "por confirmar" en vez de pagarla — confirmala vos.',
        'Cuando el bot del banco detecta la transferencia, el pago se marca PAGADO solo (matchea por CUIT, importe y fecha ±7 días). Si el sistema no está seguro, queda "por confirmar" y lo confirmás o rechazás vos.',
        'Filtros arriba: Pendientes / Solo pagados / Todos, y orden por vencimiento, importe o proveedor.',
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
