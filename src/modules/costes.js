// ═══════════════════════════════════════
// MÓDULO: COSTES
// Fuente: extracto bancario BBVA mensual
//
// ESTRUCTURA DE UN GASTO:
// { id, fecha, mes, año, tipo, categoria,
//   subcategoria, proveedor, concepto,
//   importe, formaPago, lineaNegocio, notas }
//
// TIPOS:
//   Directo   → Médicos/técnicos | Medicamentos
//   Indirecto → Personal | Marketing | Local |
//               Material desechable |
//               Inversión y modernización |
//               Formación | Otros gastos
// ═══════════════════════════════════════

const COSTES_CONFIG = {
  tipos: ['Directo', 'Indirecto'],

  categorias: {
    'Directo': [
      'Médicos y técnicos',
      'Medicamentos',
    ],
    'Indirecto': [
      'Personal',
      'Marketing',
      'Local',
      'Material desechable',
      'Inversión y modernización',
      'Formación',
      'Otros gastos',
    ],
  },

  subcategorias: {
    'Médicos y técnicos':        ['Honorarios médicos', 'Honorarios técnicos', 'Factura quirófano'],
    'Medicamentos':               ['Medicamentos / Farmacia', 'Material clínico', 'Fármacos estética', 'Fármacos capilares'],
    'Personal':                   ['Nóminas', 'Seguridad Social', 'Otros personal'],
    'Marketing':                  ['Agencia marketing', 'Publicidad online', 'Publicidad local', 'Publicidad / Diseño', 'Otros marketing'],
    'Local':                      ['Alquiler', 'Electricidad', 'Internet / Teléfono', 'Agua', 'Alarma / Seguridad', 'Otros local'],
    'Material desechable':        ['Compras diversas', 'Material oficina', 'Otros material'],
    'Inversión y modernización':  ['Mobiliario / Decoración', 'Equipamiento tecnológico', 'Software / Suscripciones', 'Obras / Reformas'],
    'Formación':                  ['Curso / Congreso', 'Suscripción profesional', 'Otros formación'],
    'Otros gastos':               ['Gestoría / Asesoría', 'Hosting / Software', 'Impuestos / Tributos', 'Amortización préstamo', 'Por clasificar'],
  },

  lineas: ['Todas', 'Capilar', 'Injerto Capilar', 'Medicina Estética', 'Vascular', 'Otros'],

  formasPago: ['Transferencia', 'Domiciliación', 'Tarjeta', 'Efectivo', 'Otros'],

  // Colores por categoría
  colors: {
    'Médicos y técnicos':        { bg: 'var(--purpleS)', text: 'var(--purple)' },
    'Medicamentos':               { bg: 'var(--amberS)',  text: 'var(--amber)'  },
    'Personal':                   { bg: 'var(--blueS)',   text: 'var(--blue)'   },
    'Marketing':                  { bg: 'var(--tealS)',   text: 'var(--teal)'   },
    'Local':                      { bg: 'var(--greenS)',  text: 'var(--green)'  },
    'Material desechable':        { bg: 'var(--accentS)', text: 'var(--accentD)'},
    'Inversión y modernización':  { bg: 'var(--amberS)',  text: 'var(--amber)'  },
    'Formación':                  { bg: 'var(--blueS)',   text: 'var(--blue)'   },
    'Otros gastos':               { bg: '#F5F5F3',        text: 'var(--muted)'  },
  },
};

// ── Auto-clasificador desde observaciones BBVA ──
const CostesClassifier = {
  classify(concepto='', beneficiario='', observaciones='') {
    const all = (concepto + ' ' + beneficiario + ' ' + observaciones).toUpperCase();

    // DIRECTO — Médicos / Técnicos
    const medicosKw = ['CAMACHO','CORRAL','HIGBI','SALMERON','OLIVARES PAREJO',
      'SERVICIOS MEDICOS','TECNICO CAPILAR','QUIROFANO','DR ','DRA ','HONORARIO'];
    if (medicosKw.some(k => all.includes(k)))
      return { tipo:'Directo', cat:'Médicos y técnicos', subcat:'Honorarios médicos', linea:'Todas' };

    // DIRECTO — Medicamentos
    const farmaKw = ['FARMACIA','IBOR ORTOPEDIA','CARMADO','CENTRALE FILLER',
      'UNIMEDI','SRCLCONSENUR','BARAS DE LA TORRE','FARMACI','MEDICAMENT'];
    if (farmaKw.some(k => all.includes(k)))
      return { tipo:'Directo', cat:'Medicamentos', subcat:'Medicamentos / Farmacia', linea:'Todas' };

    // INDIRECTO — Nóminas
    if (all.includes('NOMINA') || all.includes('NÓMINA'))
      return { tipo:'Indirecto', cat:'Personal', subcat:'Nóminas', linea:'Todas' };

    // INDIRECTO — Seguridad Social
    if (all.includes('SEGURIDAD SOCIAL') || all.includes('TGSS'))
      return { tipo:'Indirecto', cat:'Personal', subcat:'Seguridad Social', linea:'Todas' };

    // INDIRECTO — Alquiler
    if (all.includes('ALQUILER'))
      return { tipo:'Indirecto', cat:'Local', subcat:'Alquiler', linea:'Todas' };

    // INDIRECTO — Suministros
    if (all.includes('ENDESA'))
      return { tipo:'Indirecto', cat:'Local', subcat:'Electricidad', linea:'Todas' };
    if (all.includes('JAZZTEL') || all.includes('TELECOMUNICACIONES'))
      return { tipo:'Indirecto', cat:'Local', subcat:'Internet / Teléfono', linea:'Todas' };
    if (all.includes('CULLIGAN') || all.includes('ADEUDO DE AGUA'))
      return { tipo:'Indirecto', cat:'Local', subcat:'Agua', linea:'Todas' };
    if (all.includes('SECURITAS') || all.includes('EMPRESA DE SEGURIDAD'))
      return { tipo:'Indirecto', cat:'Local', subcat:'Alarma / Seguridad', linea:'Todas' };

    // INDIRECTO — Marketing
    if (all.includes('DOCTOR MARKETING') || all.includes('GEMINIS PUBLICIDAD') || all.includes('MULTIMEDIA JIENENSE'))
      return { tipo:'Indirecto', cat:'Marketing', subcat:'Agencia marketing', linea:'Todas' };
    if (all.includes('META ADS') || all.includes('GOOGLE ADS') || all.includes('FACEBOOK'))
      return { tipo:'Indirecto', cat:'Marketing', subcat:'Publicidad online', linea:'Todas' };

    // INDIRECTO — Inversión / Equipamiento
    if (all.includes('INTERIORISMO') || all.includes('MUEBLES') || all.includes('LAMPARA') || all.includes('SILLAS'))
      return { tipo:'Indirecto', cat:'Inversión y modernización', subcat:'Mobiliario / Decoración', linea:'Todas' };
    if (all.includes('DATAMAC') || all.includes('APPLE') || all.includes('INFORMATICA'))
      return { tipo:'Indirecto', cat:'Inversión y modernización', subcat:'Equipamiento tecnológico', linea:'Todas' };

    // INDIRECTO — Gestoría / Hosting
    if (all.includes('MAGINA') || all.includes('ASESORES') || all.includes('GESTORIA'))
      return { tipo:'Indirecto', cat:'Otros gastos', subcat:'Gestoría / Asesoría', linea:'Todas' };
    if (all.includes('IONOS') || all.includes('HOSTING'))
      return { tipo:'Indirecto', cat:'Otros gastos', subcat:'Hosting / Software', linea:'Todas' };
    if (all.includes('HIDALGO SMART'))
      return { tipo:'Indirecto', cat:'Otros gastos', subcat:'Gestoría / Asesoría', linea:'Todas' };

    // INDIRECTO — Impuestos / Préstamo
    if (all.includes('IMPUESTO') || all.includes('TRIBUTO') || all.includes('NRC.'))
      return { tipo:'Indirecto', cat:'Otros gastos', subcat:'Impuestos / Tributos', linea:'Todas' };
    if (all.includes('AMORTIZACION') || all.includes('PRESTAMO'))
      return { tipo:'Indirecto', cat:'Otros gastos', subcat:'Amortización préstamo', linea:'Todas' };

    // Material diverso (Amazon, PayPal, Carrefour)
    if (all.includes('AMAZON') || all.includes('PAYPAL') || all.includes('CARREFOUR'))
      return { tipo:'Indirecto', cat:'Material desechable', subcat:'Compras diversas', linea:'Todas' };

    return { tipo:'Indirecto', cat:'Otros gastos', subcat:'Por clasificar', linea:'Todas' };
  },
};

// ── Parser del extracto BBVA ──
const CostesParser = {

  // Entrada principal: recibe ArrayBuffer (xlsx) o string (csv)
  parseBBVA(data, isXlsx) {
    if (isXlsx) {
      return this._parseFromRows(this._xlsxToRows(data));
    } else {
      return this._parseFromRows(this._csvToRows(data));
    }
  },

  // Convierte xlsx ArrayBuffer → array de arrays
  _xlsxToRows(arrayBuffer) {
    const wb   = XLSX.read(arrayBuffer, { type: 'array', cellDates: false });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    return rows;
  },

  // Convierte CSV text → array de arrays
  _csvToRows(text) {
    const isSemi = text.split(/\r?\n/)[0].includes(';');
    const parsed = Papa.parse(text, {
      delimiter: isSemi ? ';' : ',',
      quoteChar: '"',
      skipEmptyLines: true,
    });
    return parsed.data;
  },

  // Procesa rows (array de arrays) en gastos
  _parseFromRows(rows) {
    const gastos = [];

    // Buscar fila de cabecera (contiene 'F. CONTABLE' o 'CONCEPTO')
    let headerIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].map(c => String(c).trim().toUpperCase());
      if (row.some(c => c.includes('F. CONTABLE') || c === 'CONCEPTO')) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) return gastos;

    const headers = rows[headerIdx].map(c => String(c).trim().toUpperCase());
    const iCol = name => headers.findIndex(h => h.includes(name));

    const idxFecha = iCol('CONTABLE');
    const idxConc  = iCol('CONCEPTO');
    const idxBen   = iCol('BENEFICIARIO');
    const idxObs   = iCol('OBSERVACIONES');
    const idxImp   = iCol('IMPORTE');

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[idxImp] && r[idxImp] !== 0) continue;

      // Importe: puede ser número directo (xlsx) o string con coma (csv)
      let importe;
      const raw = r[idxImp];
      if (typeof raw === 'number') {
        importe = raw;
      } else {
        const s = String(raw).replace(/"/g,'').trim().replace(/\./g,'').replace(',','.');
        importe = parseFloat(s);
      }
      if (isNaN(importe) || importe >= 0) continue; // solo gastos

      // Fecha: puede ser número de serie Excel o string DD/MM/YYYY
      let fecha;
      const rawFecha = r[idxFecha];
      if (typeof rawFecha === 'number') {
        // Número de serie Excel → Date
        fecha = new Date(Math.round((rawFecha - 25569) * 86400 * 1000));
      } else {
        fecha = Parsers.date(String(rawFecha || '').replace(/"/g,'').trim());
      }
      if (!fecha) continue;

      const concepto      = String(r[idxConc] || '').replace(/"/g,'').trim();
      const beneficiario  = String(r[idxBen]  || '').replace(/"/g,'').trim();
      const observaciones = String(r[idxObs]  || '').replace(/"/g,'').trim();

      // Excluir traspasos de reservas internas
      if (concepto.toUpperCase().includes('TRASPASO') &&
          observaciones.toUpperCase().includes('RESERVA')) continue;

      const classified = CostesClassifier.classify(concepto, beneficiario, observaciones);
      const proveedor   = beneficiario || observaciones.slice(0, 40);

      gastos.push({
        id:            `bbva-${i}-${Date.now()}`,
        fecha,
        mes:           Fmt.monthKey(fecha),
        año:           fecha.getFullYear(),
        tipo:          classified.tipo,
        categoria:     classified.cat,
        subcategoria:  classified.subcat,
        proveedor:     proveedor.slice(0, 50),
        concepto:      concepto.slice(0, 60),
        observaciones: observaciones.slice(0, 80),
        importe:       Math.abs(importe),
        formaPago:     'Domiciliación',
        lineaNegocio:  classified.linea,
        notas:         '',
        fuente:        'BBVA',
      });
    }
    return gastos;
  },
};

// ════════════════════════════════════════
// MÓDULO PRINCIPAL
// ════════════════════════════════════════
const Costes = {
  activeTab:     'gastos',
  filterMes:     '',
  filterTipo:    '',
  filterCat:     '',
  editingId:     null,   // null = nuevo gasto, string = editar existente
  modalOpen:     false,

  // ── Render principal ──
  render() {
    const costes = App.state.costes;
    const meses  = [...new Set(costes.map(c => c.mes))].sort().reverse();

    return `
      <!-- Modal añadir/editar gasto -->
      <div class="modal-overlay" id="costes-modal">
        <div class="modal" style="width:560px;max-height:90vh;overflow-y:auto">
          <div class="modal-title" id="costes-modal-title">Añadir gasto</div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="modal-label">Fecha</label>
              <input type="date" class="modal-input" id="cm-fecha" style="margin-bottom:0" />
            </div>
            <div>
              <label class="modal-label">Importe (€)</label>
              <input type="number" step="0.01" class="modal-input" id="cm-importe" placeholder="0.00" style="margin-bottom:0" />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
            <div>
              <label class="modal-label">Tipo</label>
              <select class="modal-input" id="cm-tipo" style="margin-bottom:0" onchange="Costes.onTipoChange()">
                <option value="">Seleccionar...</option>
                ${COSTES_CONFIG.tipos.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="modal-label">Categoría</label>
              <select class="modal-input" id="cm-cat" style="margin-bottom:0" onchange="Costes.onCatChange()">
                <option value="">Seleccionar tipo primero</option>
              </select>
            </div>
          </div>

          <div style="margin-top:12px">
            <label class="modal-label">Subcategoría</label>
            <select class="modal-input" id="cm-subcat">
              <option value="">Seleccionar categoría primero</option>
            </select>
          </div>

          <div style="margin-top:12px">
            <label class="modal-label">Proveedor / Pagado a</label>
            <input type="text" class="modal-input" id="cm-proveedor" placeholder="Ej: Endesa, Farmacia Baras..." style="margin-bottom:0" />
          </div>

          <div style="margin-top:12px">
            <label class="modal-label">Concepto / Nota</label>
            <input type="text" class="modal-input" id="cm-concepto" placeholder="Descripción del gasto" style="margin-bottom:0" />
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
            <div>
              <label class="modal-label">Forma de pago</label>
              <select class="modal-input" id="cm-forma" style="margin-bottom:0">
                ${COSTES_CONFIG.formasPago.map(f => `<option value="${f}">${f}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="modal-label">Línea de negocio</label>
              <select class="modal-input" id="cm-linea" style="margin-bottom:0">
                ${COSTES_CONFIG.lineas.map(l => `<option value="${l}">${l}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="modal-actions" style="margin-top:20px">
            <button class="btn" id="costes-modal-save" onclick="Costes.saveGasto()" style="flex:1">Guardar gasto</button>
            <button class="btn-ghost" onclick="Costes.closeModal()">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Modal importar BBVA -->
      <div class="modal-overlay" id="costes-bbva-modal">
        <div class="modal">
          <div class="modal-title">Importar extracto BBVA</div>
          <p style="font-size:13px;color:var(--muted);margin-bottom:16px">
            Exporta el extracto mensual desde BBVA en formato CSV y súbelo aquí.<br>
            El sistema clasificará automáticamente los gastos.
          </p>
          <div id="costes-bbva-preview" style="margin-bottom:16px"></div>
          <div class="modal-actions">
            <button class="btn hidden" id="costes-bbva-confirm" style="flex:1">Confirmar importación</button>
            <button class="btn-ghost" onclick="document.getElementById('costes-bbva-modal').classList.remove('open');Costes._bbvaPending=null">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="page-title">Costes</div>
          <div class="page-subtitle">Gastos directos e indirectos · ${costes.length} registros</div>
        </div>
        <div class="page-actions">
          <label class="btn-outline" style="cursor:pointer">
            Importar BBVA CSV
            <input type="file" id="costes-bbva-input" accept=".csv,.txt,.xlsx,.xls" />
          </label>
          <button class="btn" id="costes-add-btn">+ Añadir gasto</button>
          ${costes.length > 0 ? `<button class="btn-ghost" id="costes-reset-btn" style="color:var(--red);border-color:rgba(184,64,64,0.2)">Borrar todo</button>` : ''}
        </div>
      </div>

      <!-- Tabs -->
      <div class="module-tabs">
        ${[['gastos','Todos los gastos'],['directos','Directos'],['indirectos','Indirectos'],['resumen','Resumen mensual']].map(([k,l]) =>
          `<button class="module-tab ${this.activeTab===k?'active':''}" data-ctab="${k}">${l}</button>`
        ).join('')}
      </div>

      <!-- Filtros -->
      <div class="card" style="padding:16px 20px">
        <div class="filter-bar" style="margin-bottom:0">
          <div class="filter-group">
            <span class="filter-label">Mes</span>
            <select class="filter-select" id="cf-mes">
              <option value="">Todos los meses</option>
              ${meses.map(m => `<option value="${m}" ${this.filterMes===m?'selected':''}>${Fmt.month(m)}</option>`).join('')}
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Tipo</span>
            <select class="filter-select" id="cf-tipo">
              <option value="">Todos</option>
              <option value="Directo" ${this.filterTipo==='Directo'?'selected':''}>Directo</option>
              <option value="Indirecto" ${this.filterTipo==='Indirecto'?'selected':''}>Indirecto</option>
            </select>
          </div>
          <div class="filter-group">
            <span class="filter-label">Categoría</span>
            <select class="filter-select" id="cf-cat">
              <option value="">Todas</option>
              ${[...new Set(costes.map(c => c.categoria))].sort().map(c =>
                `<option value="${c}" ${this.filterCat===c?'selected':''}>${c}</option>`
              ).join('')}
            </select>
          </div>
          <button class="btn-ghost" id="costes-clear-btn" style="align-self:flex-end">Limpiar</button>
        </div>
      </div>

      <!-- Contenido del tab activo -->
      <div id="costes-tab-content"></div>

      ${costes.length === 0 ? `
        <div class="card wip-card" style="margin-top:-8px">
          <div class="wip-icon">◎</div>
          <div class="wip-title">Sin gastos registrados</div>
          <div class="wip-text">
            Importa el extracto mensual del BBVA en CSV o añade gastos manualmente.<br>
            El sistema los clasificará en directos (médicos, medicamentos) e indirectos (personal, local, marketing...).
          </div>
        </div>` : ''}
    `;
  },

  // ── Init ──
  init() {
    // Tabs
    document.querySelectorAll('[data-ctab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.ctab;
        this.renderTabContent();
        document.querySelectorAll('[data-ctab]').forEach(b =>
          b.classList.toggle('active', b.dataset.ctab === this.activeTab));
      });
    });

    // Filtros
    ['cf-mes','cf-tipo','cf-cat'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        this.filterMes  = document.getElementById('cf-mes')?.value  || '';
        this.filterTipo = document.getElementById('cf-tipo')?.value || '';
        this.filterCat  = document.getElementById('cf-cat')?.value  || '';
        this.renderTabContent();
      });
    });
    document.getElementById('costes-clear-btn')?.addEventListener('click', () => {
      this.filterMes=''; this.filterTipo=''; this.filterCat='';
      document.getElementById('cf-mes').value='';
      document.getElementById('cf-tipo').value='';
      document.getElementById('cf-cat').value='';
      this.renderTabContent();
    });

    // Botón añadir
    document.getElementById('costes-add-btn')?.addEventListener('click', () => this.openModal());

    // Importar BBVA
    document.getElementById('costes-bbva-input')?.addEventListener('change', e => {
      if (e.target.files[0]) this.handleBBVAFile(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('costes-bbva-confirm')?.addEventListener('click', () => this.confirmBBVA());

    // Reset
    document.getElementById('costes-reset-btn')?.addEventListener('click', () => {
      if (confirm('¿Borrar todos los gastos? Esta acción no se puede deshacer.')) {
        App.updateCostes([]);
        App.navigate('costes');
      }
    });

    if (App.state.costes.length > 0) this.renderTabContent();
  },

  // ── Datos filtrados ──
  getFiltered() {
    let list = App.state.costes;
    if (this.filterMes)  list = list.filter(c => c.mes === this.filterMes);
    if (this.filterTipo) list = list.filter(c => c.tipo === this.filterTipo);
    if (this.filterCat)  list = list.filter(c => c.categoria === this.filterCat);
    return list;
  },

  // ── Render tabs ──
  renderTabContent() {
    const el = document.getElementById('costes-tab-content');
    if (!el) return;
    let filtered = this.getFiltered();
    if (this.activeTab === 'directos')   filtered = filtered.filter(c => c.tipo === 'Directo');
    if (this.activeTab === 'indirectos') filtered = filtered.filter(c => c.tipo === 'Indirecto');

    if (this.activeTab === 'resumen') {
      el.innerHTML = this.renderResumen();
    } else {
      el.innerHTML = this.renderTabla(filtered);
    }
  },

  renderTabla(list) {
    if (!list.length) return `<div class="card" style="text-align:center;padding:40px;color:var(--muted);font-size:13px">No hay gastos con los filtros actuales</div>`;

    const total = list.reduce((s,c) => s + c.importe, 0);
    const totalDir = list.filter(c=>c.tipo==='Directo').reduce((s,c)=>s+c.importe,0);
    const totalInd = list.filter(c=>c.tipo==='Indirecto').reduce((s,c)=>s+c.importe,0);

    return `
      <!-- Mini KPIs -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px">
        ${[
          { l:'Total gastos',   v:Fmt.eur(total),    c:'var(--red)'    },
          { l:'Directos',       v:Fmt.eur(totalDir), c:'var(--purple)' },
          { l:'Indirectos',     v:Fmt.eur(totalInd), c:'var(--blue)'   },
          { l:'Nº registros',   v:Fmt.num(list.length), c:'var(--muted)'},
        ].map(k=>`<div class="kpi-card"><div class="kpi-bar" style="background:linear-gradient(90deg,${k.c},transparent)"></div>
          <div class="kpi-label">${k.l}</div>
          <div class="kpi-value" style="color:${k.c};font-size:20px">${k.v}</div></div>`).join('')}
      </div>

      <div class="card" style="padding:0;overflow:hidden">
        <div class="table-wrap" style="max-height:560px;overflow-y:auto">
          <table>
            <thead><tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Subcategoría</th>
              <th>Proveedor</th>
              <th>Concepto</th>
              <th class="r">Importe</th>
              <th>Línea</th>
              <th></th>
            </tr></thead>
            <tbody>
              ${list.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(c => {
                const col = COSTES_CONFIG.colors[c.categoria] || { bg:'#F5F5F3', text:'var(--muted)' };
                return `<tr>
                  <td style="white-space:nowrap;font-size:12px;color:var(--muted)">${c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES') : c.mes}</td>
                  <td><span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:${c.tipo==='Directo'?'var(--purpleS)':'var(--blueS)'};color:${c.tipo==='Directo'?'var(--purple)':'var(--blue)'}">${c.tipo}</span></td>
                  <td><span style="font-size:11px;padding:3px 8px;border-radius:4px;background:${col.bg};color:${col.text}">${c.categoria}</span></td>
                  <td style="font-size:12px;color:var(--muted)">${c.subcategoria || '—'}</td>
                  <td style="font-size:13px;font-weight:500;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.proveedor || '—'}</td>
                  <td style="font-size:12px;color:var(--muted);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.concepto || '—'}</td>
                  <td class="r" style="font-weight:600;color:var(--red);white-space:nowrap">${Fmt.eur(c.importe)}</td>
                  <td style="font-size:11px;color:var(--dim)">${c.lineaNegocio || 'Todas'}</td>
                  <td style="white-space:nowrap">
                    <button onclick="Costes.editGasto('${c.id}')" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:12px;padding:4px 8px;border-radius:4px" title="Editar">✏️</button>
                    <button onclick="Costes.deleteGasto('${c.id}')" style="background:none;border:none;cursor:pointer;color:var(--red);font-size:12px;padding:4px 8px;border-radius:4px" title="Borrar">🗑</button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="font-weight:600;color:var(--accentD)">TOTAL</td>
                <td class="r" style="font-weight:700;color:var(--red)">${Fmt.eur(total)}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;
  },

  renderResumen() {
    const costes = App.state.costes;
    if (!costes.length) return `<div class="card wip-card"><div class="wip-text">Sin datos para mostrar</div></div>`;

    // Por mes
    const meses = [...new Set(costes.map(c => c.mes))].sort().reverse();

    return `
      ${meses.map(mes => {
        const items = costes.filter(c => c.mes === mes);
        const total = items.reduce((s,c) => s + c.importe, 0);
        const directos   = items.filter(c => c.tipo==='Directo').reduce((s,c)=>s+c.importe,0);
        const indirectos = items.filter(c => c.tipo==='Indirecto').reduce((s,c)=>s+c.importe,0);

        // Por categoría
        const byCat = {};
        items.forEach(c => {
          if (!byCat[c.categoria]) byCat[c.categoria] = { importe:0, tipo:c.tipo, n:0 };
          byCat[c.categoria].importe += c.importe;
          byCat[c.categoria].n++;
        });
        const cats = Object.entries(byCat).sort((a,b) => b[1].importe - a[1].importe);

        return `
          <div class="card" style="margin-bottom:16px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
              <div class="card-title" style="margin-bottom:0;font-size:20px">${Fmt.month(mes)}</div>
              <div style="display:flex;gap:20px;flex-wrap:wrap">
                <div style="text-align:right">
                  <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em">Directos</div>
                  <div style="font-size:16px;font-weight:600;color:var(--purple);font-family:var(--font-display)">${Fmt.eur(directos)}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em">Indirectos</div>
                  <div style="font-size:16px;font-weight:600;color:var(--blue);font-family:var(--font-display)">${Fmt.eur(indirectos)}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em">Total</div>
                  <div style="font-size:20px;font-weight:700;color:var(--red);font-family:var(--font-display)">${Fmt.eur(total)}</div>
                </div>
              </div>
            </div>

            <!-- Barra de composición -->
            <div style="height:8px;border-radius:4px;background:var(--border);overflow:hidden;margin-bottom:16px;display:flex">
              ${cats.map(([cat, d]) => {
                const col = COSTES_CONFIG.colors[cat] || { text:'var(--muted)' };
                const pct = total > 0 ? (d.importe/total)*100 : 0;
                return `<div style="width:${pct}%;background:${col.text};opacity:0.7" title="${cat}: ${Fmt.eur(d.importe)}"></div>`;
              }).join('')}
            </div>

            <!-- Tabla por categoría -->
            <div class="table-wrap">
              <table>
                <thead><tr>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th class="r">Importe</th>
                  <th class="r">% s/total</th>
                  <th class="r">Nº gastos</th>
                </tr></thead>
                <tbody>
                  ${cats.map(([cat, d]) => {
                    const col = COSTES_CONFIG.colors[cat] || { bg:'#F5F5F3', text:'var(--muted)' };
                    const pct = total > 0 ? (d.importe/total)*100 : 0;
                    return `<tr>
                      <td><span style="font-size:12px;padding:3px 10px;border-radius:20px;background:${col.bg};color:${col.text};font-weight:500">${cat}</span></td>
                      <td><span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:${d.tipo==='Directo'?'var(--purpleS)':'var(--blueS)'};color:${d.tipo==='Directo'?'var(--purple)':'var(--blue)'}">${d.tipo}</span></td>
                      <td class="r" style="font-weight:600;color:var(--red)">${Fmt.eur(d.importe)}</td>
                      <td class="r" style="color:var(--muted)">${Fmt.pct(pct)}</td>
                      <td class="r" style="color:var(--dim)">${d.n}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="font-weight:600;color:var(--accentD)">TOTAL ${Fmt.month(mes).toUpperCase()}</td>
                    <td class="r" style="font-weight:700;color:var(--red)">${Fmt.eur(total)}</td>
                    <td class="r" style="color:var(--muted)">100%</td>
                    <td class="r" style="color:var(--dim)">${items.length}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>`;
      }).join('')}`;
  },

  // ── BBVA Import ──
  handleBBVAFile(file) {
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx') ||
                   file.name.toLowerCase().endsWith('.xls');
    const reader = new FileReader();

    reader.onload = ev => {
      let gastos;
      if (isXlsx) {
        // Leer como ArrayBuffer para XLSX.js
        gastos = CostesParser.parseBBVA(ev.target.result, true);
      } else {
        // Leer como texto para PapaParse
        gastos = CostesParser.parseBBVA(ev.target.result, false);
      }

      if (!gastos.length) {
        alert('No se detectaron gastos en el archivo. Asegúrate de que es un extracto BBVA (xlsx o csv).');
        return;
      }
      this._bbvaPending = gastos;

      // Resumen para confirmar
      const total = gastos.reduce((s,g) => s+g.importe, 0);
      const byCat = {};
      gastos.forEach(g => { byCat[g.categoria] = (byCat[g.categoria]||0)+g.importe; });

      document.getElementById('costes-bbva-preview').innerHTML = `
        <div style="background:var(--bg);border-radius:8px;padding:14px 16px;border:1px solid var(--border);margin-bottom:4px">
          <div style="font-size:13px;font-weight:600;margin-bottom:10px">
            Se han detectado <strong style="color:var(--accentD)">${gastos.length} gastos</strong>
            por un total de <strong style="color:var(--red)">${Fmt.eur(total)}</strong>
          </div>
          ${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cat,imp]) => {
            const col = COSTES_CONFIG.colors[cat] || { bg:'#F5F5F3', text:'var(--muted)' };
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:12px;padding:2px 8px;border-radius:20px;background:${col.bg};color:${col.text}">${cat}</span>
              <span style="font-size:12px;font-weight:600;color:var(--red)">${Fmt.eur(imp)}</span>
            </div>`;
          }).join('')}
        </div>
        <p style="font-size:12px;color:var(--muted);margin-top:8px">Puedes editar la clasificación de cada gasto después de importar.</p>`;

      document.getElementById('costes-bbva-confirm').classList.remove('hidden');
      document.getElementById('costes-bbva-modal').classList.add('open');
    };

    if (isXlsx) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, 'utf-8');
    }
  },

  confirmBBVA() {
    if (!this._bbvaPending) return;
    const nuevos  = this._bbvaPending.filter(g =>
      !App.state.costes.some(c => c.id === g.id));
    const updated = [...App.state.costes, ...nuevos];
    App.updateCostes(updated);
    this._bbvaPending = null;
    document.getElementById('costes-bbva-modal').classList.remove('open');
    App.navigate('costes');
  },

  // ── Modal añadir/editar ──
  openModal(id = null) {
    this.editingId = id;
    document.getElementById('costes-modal-title').textContent = id ? 'Editar gasto' : 'Añadir gasto';

    if (id) {
      const g = App.state.costes.find(c => c.id === id);
      if (!g) return;
      document.getElementById('cm-fecha').value    = g.fecha ? Parsers.toInputDate(new Date(g.fecha)) : '';
      document.getElementById('cm-importe').value  = g.importe;
      document.getElementById('cm-proveedor').value= g.proveedor || '';
      document.getElementById('cm-concepto').value = g.concepto  || '';
      document.getElementById('cm-forma').value    = g.formaPago || 'Transferencia';
      document.getElementById('cm-linea').value    = g.lineaNegocio || 'Todas';
      document.getElementById('cm-tipo').value     = g.tipo || '';
      this.onTipoChange(g.tipo);
      document.getElementById('cm-cat').value      = g.categoria || '';
      this.onCatChange(g.categoria);
      document.getElementById('cm-subcat').value   = g.subcategoria || '';
    } else {
      document.getElementById('cm-fecha').value    = '';
      document.getElementById('cm-importe').value  = '';
      document.getElementById('cm-proveedor').value= '';
      document.getElementById('cm-concepto').value = '';
      document.getElementById('cm-tipo').value     = '';
      document.getElementById('cm-cat').innerHTML  = '<option value="">Seleccionar tipo primero</option>';
      document.getElementById('cm-subcat').innerHTML= '<option value="">Seleccionar categoría primero</option>';
    }
    document.getElementById('costes-modal').classList.add('open');
  },

  closeModal() {
    document.getElementById('costes-modal').classList.remove('open');
    this.editingId = null;
  },

  onTipoChange(val) {
    const tipo = val || document.getElementById('cm-tipo')?.value || '';
    const cats = COSTES_CONFIG.categorias[tipo] || [];
    const sel  = document.getElementById('cm-cat');
    sel.innerHTML = `<option value="">Seleccionar...</option>` +
      cats.map(c => `<option value="${c}">${c}</option>`).join('');
    document.getElementById('cm-subcat').innerHTML = '<option value="">Seleccionar categoría primero</option>';
  },

  onCatChange(val) {
    const cat   = val || document.getElementById('cm-cat')?.value || '';
    const subs  = COSTES_CONFIG.subcategorias[cat] || [];
    const sel   = document.getElementById('cm-subcat');
    sel.innerHTML = `<option value="">Seleccionar...</option>` +
      subs.map(s => `<option value="${s}">${s}</option>`).join('');
  },

  saveGasto() {
    const fecha    = document.getElementById('cm-fecha').value;
    const importe  = parseFloat(document.getElementById('cm-importe').value);
    const tipo     = document.getElementById('cm-tipo').value;
    const cat      = document.getElementById('cm-cat').value;
    const subcat   = document.getElementById('cm-subcat').value;
    const proveedor= document.getElementById('cm-proveedor').value.trim();
    const concepto = document.getElementById('cm-concepto').value.trim();
    const forma    = document.getElementById('cm-forma').value;
    const linea    = document.getElementById('cm-linea').value;

    if (!fecha || !importe || !tipo || !cat) {
      alert('Por favor rellena Fecha, Importe, Tipo y Categoría.');
      return;
    }

    const fechaDate = new Date(fecha);
    const gasto = {
      id:           this.editingId || `manual-${Date.now()}`,
      fecha:        fechaDate,
      mes:          Fmt.monthKey(fechaDate),
      año:          fechaDate.getFullYear(),
      tipo, categoria: cat, subcategoria: subcat,
      proveedor, concepto,
      importe:      Math.abs(importe),
      formaPago:    forma,
      lineaNegocio: linea,
      notas:        '',
      fuente:       'Manual',
    };

    let costes = [...App.state.costes];
    if (this.editingId) {
      const idx = costes.findIndex(c => c.id === this.editingId);
      if (idx >= 0) costes[idx] = gasto;
    } else {
      costes.push(gasto);
    }

    App.updateCostes(costes);
    this.closeModal();
    App.navigate('costes');
  },

  editGasto(id) { this.openModal(id); },

  deleteGasto(id) {
    if (!confirm('¿Eliminar este gasto?')) return;
    App.updateCostes(App.state.costes.filter(c => c.id !== id));
    this.renderTabContent();
  },
};
