// ═══════════════════════════════════════
// MÓDULO: CAJA
// Importación de CSV de Clínica Cloud
// Análisis de ventas, pacientes, LTV
// ═══════════════════════════════════════

const Caja = {
  // Filtros locales del módulo
  filters: { from: '', to: '', type: 'all', agendas: [], cats: [] },
  activeTab: 'dashboard',
  pendingUpload: null,

  render() {
    return `
      <!-- Modal de periodo -->
      <div class="modal-overlay" id="caja-modal">
        <div class="modal">
          <div class="modal-title">📅 Confirmar periodo del archivo</div>
          <p id="caja-modal-filename" style="font-size:12px;color:var(--muted);margin-bottom:16px"></p>
          <div id="caja-modal-detected"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
            <div><label class="modal-label">Desde</label><input type="date" class="modal-input" id="caja-modal-from" /></div>
            <div><label class="modal-label">Hasta</label><input type="date" class="modal-input" id="caja-modal-to" /></div>
          </div>
          <div class="modal-actions">
            <button class="btn" id="caja-modal-confirm" style="flex:1">✓ Confirmar e importar</button>
            <button class="btn-ghost" id="caja-modal-cancel">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Header de módulo -->
      <div class="page-header">
        <div>
          <div class="page-title">Caja</div>
          <div class="page-subtitle">Ventas e ingresos · importados desde Clínica Cloud</div>
        </div>
        <div class="page-actions" id="caja-header-actions">
          <label class="btn" id="caja-upload-btn">Subir CSV
            <input type="file" id="caja-file-input" accept=".csv,.txt" />
          </label>
          <button class="btn-ghost hidden" id="caja-export-btn">Exportar BD</button>
          <button class="btn-danger hidden" id="caja-reset-btn">Borrar datos</button>
        </div>
      </div>

      <!-- Si no hay datos -->
      <div id="caja-empty" class="${App.state.cajaRecords.length ? 'hidden' : ''}">
        <label class="drop-zone">
          <div style="font-size:40px;margin-bottom:12px">📊</div>
          <div style="font-size:17px;font-weight:700;margin-bottom:8px">Sube tu primer CSV de caja</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:20px">Exportado de Clínica Cloud · se acumula mes a mes</div>
          <div class="btn" style="display:inline-flex">Seleccionar archivo</div>
          <input type="file" id="caja-file-input-drop" accept=".csv,.txt" />
        </label>
      </div>

      <!-- Contenido principal -->
      <div id="caja-content" class="${App.state.cajaRecords.length ? '' : 'hidden'}">
        <!-- Tabs -->
        <div class="module-tabs" style="">
          ${[['dashboard','📊 Dashboard'],['agenda','👨‍⚕️ Agenda'],['newrec','🆕 Nuevos vs Recurrentes'],['category','💼 Línea Negocio'],['patients','👥 Pacientes']].map(([k,l]) =>
            `<button class="nav-btn ${this.activeTab===k?'active':''}" data-cajtab="${k}">${l}</button>`
          ).join('')}
        </div>

        <!-- Filtros -->
        <div class="card" id="caja-filters">
          <div class="filter-bar">
            <div class="filter-group"><span class="filter-label">Desde</span><input type="date" class="filter-input" id="cf-from" value="${this.filters.from}" /></div>
            <div class="filter-group"><span class="filter-label">Hasta</span><input type="date" class="filter-input" id="cf-to"   value="${this.filters.to}" /></div>
            <div class="filter-group"><span class="filter-label">Tipo paciente</span>
              <select class="filter-select" id="cf-type">
                <option value="all"       ${this.filters.type==='all'?'selected':''}>Todos</option>
                <option value="new"       ${this.filters.type==='new'?'selected':''}>Nuevos</option>
                <option value="recurrent" ${this.filters.type==='recurrent'?'selected':''}>Recurrentes</option>
              </select>
            </div>
            <button class="btn-ghost" id="caja-clear-btn" style="align-self:flex-end">Limpiar</button>
          </div>
          <div id="caja-agenda-chips-row" style="margin-bottom:8px"></div>
          <div id="caja-cat-chips-row"></div>
        </div>

        <!-- Contenido de cada tab -->
        <div id="caja-tab-content"></div>

        <!-- Archivos -->
        <div class="files-list">
          <div class="files-title">Archivos en base de datos</div>
          <div class="file-chips" id="caja-file-chips"></div>
        </div>
      </div>`;
  },

  init() {
    // Botones de upload
    ['caja-file-input','caja-file-input-drop'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', e => { if (e.target.files[0]) this.handleFile(e.target.files[0]); e.target.value=''; });
    });

    // Modal
    document.getElementById('caja-modal-confirm').addEventListener('click', () => this.confirmUpload());
    document.getElementById('caja-modal-cancel').addEventListener('click', () => {
      document.getElementById('caja-modal').classList.remove('open'); this.pendingUpload = null;
    });

    // Tabs
    document.querySelectorAll('[data-cajtab]').forEach(btn => {
      btn.addEventListener('click', () => { this.activeTab = btn.dataset.cajtab; this.renderTabContent(); this.updateTabButtons(); });
    });

    // Filtros
    document.getElementById('cf-from').addEventListener('change', e => { this.filters.from = e.target.value; this.renderTabContent(); });
    document.getElementById('cf-to').addEventListener('change',   e => { this.filters.to   = e.target.value; this.renderTabContent(); });
    document.getElementById('cf-type').addEventListener('change', e => { this.filters.type = e.target.value; this.renderTabContent(); });
    document.getElementById('caja-clear-btn').addEventListener('click', () => this.clearFilters());

    // Botones header
    const expBtn = document.getElementById('caja-export-btn');
    const rstBtn = document.getElementById('caja-reset-btn');
    if (expBtn) expBtn.addEventListener('click', () => this.exportBD());
    if (rstBtn) rstBtn.addEventListener('click', () => this.reset());

    if (App.state.cajaRecords.length) {
      this.updateHeaderButtons();
      this.buildChips();
      this.renderTabContent();
      this.renderFileChips();
    }
  },

  // ── File handling ──
  handleFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      const records = Parsers.parseCSV(ev.target.result);
      const dates = records.map(r => r.fecha).filter(Boolean);
      const minD = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
      const maxD = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
      this.pendingUpload = { fileName: file.name, records };
      this.openModal(file.name, minD, maxD);
    };
    reader.readAsText(file, 'utf-8');
  },

  openModal(name, minD, maxD) {
    document.getElementById('caja-modal-filename').textContent = '📄 ' + name;
    document.getElementById('caja-modal-from').value = minD ? Parsers.toInputDate(minD) : '';
    document.getElementById('caja-modal-to').value   = maxD ? Parsers.toInputDate(maxD) : '';
    const det = document.getElementById('caja-modal-detected');
    if (minD || maxD) {
      det.innerHTML = `<div style="background:var(--surface);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:var(--muted);border:1px solid var(--border)">
        Fechas detectadas: <strong style="color:var(--accent)">${minD?minD.toLocaleDateString('es-ES'):'—'} → ${maxD?maxD.toLocaleDateString('es-ES'):'—'}</strong></div>`;
    } else {
      det.innerHTML = `<div style="background:var(--redS);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:var(--red);border:1px solid rgba(248,113,113,0.2)">⚠️ No se detectaron fechas. Introduce el periodo manualmente.</div>`;
    }
    document.getElementById('caja-modal').classList.add('open');
  },

  confirmUpload() {
    const from = document.getElementById('caja-modal-from').value;
    const to   = document.getElementById('caja-modal-to').value;
    if (!from || !to) return;
    document.getElementById('caja-modal').classList.remove('open');

    const { fileName, records } = this.pendingUpload;
    this.pendingUpload = null;
    if (App.state.cajaFiles.includes(fileName)) return;

    const newRecords = [...App.state.cajaRecords, ...records];
    const newFiles   = [...App.state.cajaFiles, fileName];
    App.updateCaja(newRecords, newFiles);

    this.filters.from = from; this.filters.to = to;

    // Refrescar UI
    document.getElementById('caja-empty').classList.add('hidden');
    document.getElementById('caja-content').classList.remove('hidden');
    this.updateHeaderButtons();
    this.buildChips();
    this.renderTabContent();
    this.renderFileChips();
    document.getElementById('cf-from').value = from;
    document.getElementById('cf-to').value   = to;
  },

  exportBD() {
    Parsers.exportCSV(App.getSalesRecords(), `clinica_stella_BD_${new Date().toISOString().slice(0,10)}.csv`);
  },

  reset() {
    if (!confirm('¿Borrar todos los datos de caja? Esta acción no se puede deshacer.')) return;
    App.updateCaja([], []);
    App.navigate('caja');
  },

  clearFilters() {
    this.filters = { from:'', to:'', type:'all', agendas:[], cats:[] };
    document.getElementById('cf-from').value = '';
    document.getElementById('cf-to').value   = '';
    document.getElementById('cf-type').value = 'all';
    this.buildChips();
    this.renderTabContent();
  },

  updateHeaderButtons() {
    document.getElementById('caja-export-btn')?.classList.remove('hidden');
    document.getElementById('caja-reset-btn')?.classList.remove('hidden');
  },

  updateTabButtons() {
    document.querySelectorAll('[data-cajtab]').forEach(b => b.classList.toggle('active', b.dataset.cajtab === this.activeTab));
  },

  // ── Chips ──
  buildChips() {
    const sales = App.getSalesRecords();
    const agendas = [...new Set(sales.map(r => r.agenda))].filter(Boolean).sort();
    const cats    = [...new Set(sales.map(r => Calculations.categorizeTreatment(r.treatment)))].sort();

    const agRow = document.getElementById('caja-agenda-chips-row');
    if (agendas.length) {
      agRow.innerHTML = `<span class="filter-label" style="margin-right:8px">Agenda:</span><div class="chips">${
        agendas.map(a => `<button class="chip${this.filters.agendas.includes(a)?' active':''}" data-agenda="${a}">${a}</button>`).join('')
      }</div>`;
      agRow.querySelectorAll('[data-agenda]').forEach(b => b.addEventListener('click', () => {
        const a = b.dataset.agenda;
        const i = this.filters.agendas.indexOf(a);
        if (i>=0) this.filters.agendas.splice(i,1); else this.filters.agendas.push(a);
        this.buildChips(); this.renderTabContent();
      }));
    }

    const catRow = document.getElementById('caja-cat-chips-row');
    if (cats.length) {
      catRow.innerHTML = `<span class="filter-label" style="margin-right:8px">Categoría:</span><div class="chips">${
        cats.map(c => `<button class="chip${this.filters.cats.includes(c)?' active':''}" data-cat="${c}">${c}</button>`).join('')
      }</div>`;
      catRow.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
        const c = b.dataset.cat;
        const i = this.filters.cats.indexOf(c);
        if (i>=0) this.filters.cats.splice(i,1); else this.filters.cats.push(c);
        this.buildChips(); this.renderTabContent();
      }));
    }
  },

  renderFileChips() {
    const el = document.getElementById('caja-file-chips');
    if (el) el.innerHTML = App.state.cajaFiles.map(f => `<span class="file-chip">📄 ${f}</span>`).join('');
  },

  // ── Datos filtrados ──
  getFiltered() {
    const { from, to, type, agendas, cats } = this.filters;
    const fromD = from ? new Date(from) : null;
    const toD   = to   ? new Date(to + 'T23:59:59') : null;
    let recs = App.getSalesRecords();
    if (fromD)        recs = recs.filter(r => r.fecha >= fromD);
    if (toD)          recs = recs.filter(r => r.fecha <= toD);
    if (agendas.length) recs = recs.filter(r => agendas.includes(r.agenda));
    if (cats.length)    recs = recs.filter(r => cats.includes(Calculations.categorizeTreatment(r.treatment)));
    if (type === 'new')       recs = recs.filter(r => !Calculations.isRecurrent(r.id));
    if (type === 'recurrent') recs = recs.filter(r =>  Calculations.isRecurrent(r.id));
    return recs;
  },

  // ── Render tabs ──
  renderTabContent() {
    const filtered = this.getFiltered();
    const kpis = Calculations.computeKPIs(filtered, App.getSalesRecords());
    const el = document.getElementById('caja-tab-content');
    if (!el) return;

    switch(this.activeTab) {
      case 'dashboard':   el.innerHTML = this.renderDashboard(filtered, kpis); break;
      case 'agenda':      el.innerHTML = this.renderAgenda(filtered, kpis); break;
      case 'newrec':      el.innerHTML = this.renderNewRec(filtered, kpis); break;
      case 'category':    el.innerHTML = this.renderCategory(filtered); break;
      case 'patients':    el.innerHTML = this.renderPatients(filtered); break;
    }
  },

  renderDashboard(filtered, kpis) {
    // Monthly chart data (from ALL sales, not filtered)
    const sales = App.getSalesRecords();
    const monthMap = {};
    sales.forEach(r => {
      const mk = Fmt.monthKey(r.fecha);
      if (!monthMap[mk]) monthMap[mk] = { caja:0, pats:new Set() };
      monthMap[mk].caja += r.venta; monthMap[mk].pats.add(r.id);
    });
    const months = Object.entries(monthMap).sort(([a],[b]) => a.localeCompare(b));
    const maxCaja = Math.max(...months.map(([,d]) => d.caja), 1);

    return `
      <div class="sales-banner">
        <div><div class="sb-label">💶 Venta Total (con IVA)</div><div class="sb-value" style="color:var(--accent)">${Fmt.eur(kpis.cajaTotal)}</div></div>
        <div class="divider-v"></div>
        <div><div class="sb-label">💳 Precio Base (sin IVA)</div><div class="sb-value" style="color:var(--teal)">${Fmt.eur(kpis.cajaBase)}</div></div>
        <div class="divider-v"></div>
        <div><div class="sb-label">📋 IVA</div><div class="sb-value" style="font-size:22px;color:var(--muted)">${Fmt.eur(kpis.iva)}</div></div>
      </div>
      <div class="kpi-grid">
        ${[
          { l:'Pacientes únicos',  v:Fmt.num(kpis.numPats),          c:'var(--blue)',   i:'👥' },
          { l:'Pacientes nuevos',  v:Fmt.num(kpis.newPats),          c:'var(--green)',  i:'🆕' },
          { l:'Recurrentes',       v:Fmt.num(kpis.recPats),          c:'var(--purple)', i:'🔄' },
          { l:'Ticket medio',      v:Fmt.eur(kpis.ticketMedio),      c:'var(--blue)',   i:'🎫' },
          { l:'Ticket nuevo',      v:Fmt.eur(kpis.ticketMedioNuevo), c:'var(--green)',  i:'⭐' },
          { l:'Ticket recurrente', v:Fmt.eur(kpis.ticketMedioRec),   c:'var(--purple)', i:'🔁' },
          { l:'LTV medio',         v:Fmt.eur(kpis.ltvMedio),         c:'var(--accent)', i:'📈' },
          { l:'LTV recurrentes',   v:Fmt.eur(kpis.ltvMedioRec),      c:'var(--teal)',   i:'💎' },
        ].map(k => `<div class="kpi-card"><div class="kpi-bar" style="background:linear-gradient(90deg,${k.c},transparent)"></div><div class="kpi-label">${k.i} ${k.l}</div><div class="kpi-value" style="color:${k.c}">${k.v}</div></div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">📊 Evolución mensual</div>
        <div class="chart-wrap">
          ${months.map(([mk,d]) => `
            <div class="chart-col">
              <span class="chart-val">${Fmt.eur(d.caja)}</span>
              <div class="chart-bar" style="height:${(d.caja/maxCaja)*150}px"></div>
              <span class="chart-label">${Fmt.month(mk)}</span>
              <span class="chart-sub">${d.pats.size} pac.</span>
            </div>`).join('')}
        </div>
      </div>`;
  },

  renderAgenda(filtered, kpis) {
    const agMap = {};
    filtered.forEach(r => {
      if (!agMap[r.agenda]) agMap[r.agenda] = { caja:0, cajaBase:0, pids:new Set() };
      agMap[r.agenda].caja += r.venta; agMap[r.agenda].cajaBase += r.precioBase; agMap[r.agenda].pids.add(r.id);
    });
    const rows = Object.entries(agMap).map(([ag,d]) => {
      const pids = [...d.pids];
      const ltvs = pids.map(p => Calculations.patientLTV[p]||0);
      return { ag, caja:d.caja, cajaBase:d.cajaBase, pats:pids.length, tm:pids.length>0?d.caja/pids.length:0, ltv:ltvs.length>0?ltvs.reduce((s,v)=>s+v,0)/ltvs.length:0 };
    }).sort((a,b) => b.caja-a.caja);

    return `<div class="card"><div class="card-title">👨‍⚕️ Análisis por agenda</div><div class="table-wrap"><table>
      <thead><tr><th>Agenda</th><th class="r">Venta (c/IVA)</th><th class="r">Base (s/IVA)</th><th class="r">Pacientes</th><th class="r">Ticket</th><th class="r">LTV medio</th></tr></thead>
      <tbody>${rows.map(r=>`<tr>
        <td><span class="dot"></span><strong>${r.ag}</strong></td>
        <td class="r text-accent fw-bold">${Fmt.eur(r.caja)}</td>
        <td class="r text-teal">${Fmt.eur(r.cajaBase)}</td>
        <td class="r">${r.pats}</td>
        <td class="r">${Fmt.eur(r.tm)}</td>
        <td class="r text-accent">${Fmt.eur(r.ltv)}</td>
      </tr>`).join('')}</tbody>
      ${rows.length>1?`<tfoot><tr><td class="text-accent">TOTAL</td><td class="r text-accent">${Fmt.eur(rows.reduce((s,r)=>s+r.caja,0))}</td><td class="r text-teal">${Fmt.eur(rows.reduce((s,r)=>s+r.cajaBase,0))}</td><td class="r">${kpis.numPats}</td><td class="r">${Fmt.eur(kpis.ticketMedio)}</td><td class="r text-accent">${Fmt.eur(kpis.ltvMedio)}</td></tr></tfoot>`:''}
    </table></div></div>`;
  },

  renderNewRec(filtered, kpis) {
    const agMap = {};
    filtered.forEach(r => {
      if (!agMap[r.agenda]) agMap[r.agenda] = { caja:0, pids:new Set(), newPids:new Set(), recPids:new Set(), recSpend:0 };
      const d = agMap[r.agenda];
      d.caja += r.venta; d.pids.add(r.id);
      if (Calculations.isRecurrent(r.id)) { d.recPids.add(r.id); d.recSpend += r.venta; }
      else d.newPids.add(r.id);
    });
    const agRows = Object.entries(agMap).map(([ag,d]) => {
      const sales = App.getSalesRecords();
      const newArr = [...d.newPids];
      const newFS = sales.filter(r => d.newPids.has(r.id) && r.agenda===ag && Calculations.patientFirstDate[r.id] && Fmt.monthKey(Calculations.patientFirstDate[r.id])===Fmt.monthKey(r.fecha)).reduce((s,r)=>s+r.venta,0);
      const recArr = [...d.recPids];
      const recLTVs = recArr.map(p => Calculations.patientLTV[p]||0);
      return { ag, newN:newArr.length, recN:recArr.length, caja:d.caja,
        tm:d.pids.size>0?d.caja/d.pids.size:0,
        tmNew:newArr.length>0?newFS/newArr.length:0,
        tmRec:recArr.length>0?d.recSpend/recArr.length:0,
        ltvRec:recLTVs.length>0?recLTVs.reduce((s,v)=>s+v,0)/recLTVs.length:0 };
    }).sort((a,b)=>b.caja-a.caja);

    return `
      <div class="card" style="margin-bottom:14px">
        <div class="card-title">📊 Resumen del periodo</div>
        <div class="summary-grid">
          <div class="summary-card" style="background:var(--greenS);border:1px solid rgba(74,222,128,0.2)">
            <div style="font-size:11px;color:var(--green);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">🆕 Pacientes nuevos</div>
            <div style="font-size:32px;font-weight:800;color:var(--green);margin-bottom:8px">${kpis.newPats}</div>
            <div style="font-size:12px;color:var(--muted)">Ticket primer mes: <strong style="color:var(--green)">${Fmt.eur(kpis.ticketMedioNuevo)}</strong></div>
            <div style="font-size:11px;color:var(--dim);margin-top:4px">Solo han venido en 1 mes</div>
          </div>
          <div class="summary-card" style="background:var(--purpleS);border:1px solid rgba(192,132,252,0.2)">
            <div style="font-size:11px;color:var(--purple);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">🔄 Pacientes recurrentes</div>
            <div style="font-size:32px;font-weight:800;color:var(--purple);margin-bottom:8px">${kpis.recPats}</div>
            <div style="font-size:12px;color:var(--muted)">Ticket periodo: <strong style="color:var(--purple)">${Fmt.eur(kpis.ticketMedioRec)}</strong></div>
            <div style="font-size:12px;color:var(--muted);margin-top:2px">LTV medio: <strong style="color:var(--accent)">${Fmt.eur(kpis.ltvMedioRec)}</strong></div>
            <div style="font-size:11px;color:var(--dim);margin-top:4px">Han venido en 2+ meses distintos</div>
          </div>
          <div class="summary-card" style="background:var(--accentS);border:1px solid var(--accentB)">
            <div style="font-size:11px;color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📈 Ticket general</div>
            <div style="font-size:32px;font-weight:800;color:var(--accent);margin-bottom:8px">${Fmt.eur(kpis.ticketMedio)}</div>
            <div style="font-size:12px;color:var(--muted)">LTV global: <strong style="color:var(--accent)">${Fmt.eur(kpis.ltvMedio)}</strong></div>
          </div>
        </div>
      </div>
      <div class="card"><div class="card-title">👨‍⚕️ Desglose por agenda</div><div class="table-wrap"><table>
        <thead><tr>
          <th>Agenda</th>
          <th class="r" style="color:var(--green)">Nuevos</th>
          <th class="r" style="color:var(--purple)">Recurrentes</th>
          <th class="r">Ticket mes</th>
          <th class="r" style="color:var(--green)">Ticket nuevo</th>
          <th class="r" style="color:var(--purple)">Ticket recurrente</th>
          <th class="r" style="color:var(--accent)">LTV recurrentes</th>
          <th class="r">Venta</th>
        </tr></thead>
        <tbody>${agRows.map(r=>`<tr>
          <td><span class="dot"></span><strong>${r.ag}</strong></td>
          <td class="r"><span class="badge badge-new">${r.newN}</span></td>
          <td class="r"><span class="badge badge-rec">${r.recN}</span></td>
          <td class="r">${Fmt.eur(r.tm)}</td>
          <td class="r text-green fw-bold">${Fmt.eur(r.tmNew)}</td>
          <td class="r" style="color:var(--purple);font-weight:600">${Fmt.eur(r.tmRec)}</td>
          <td class="r text-accent fw-bold">${Fmt.eur(r.ltvRec)}</td>
          <td class="r text-accent">${Fmt.eur(r.caja)}</td>
        </tr>`).join('')}</tbody>
        ${agRows.length>1?`<tfoot><tr>
          <td class="text-accent">TOTAL</td>
          <td class="r"><span class="badge badge-new">${kpis.newPats}</span></td>
          <td class="r"><span class="badge badge-rec">${kpis.recPats}</span></td>
          <td class="r">${Fmt.eur(kpis.ticketMedio)}</td>
          <td class="r text-green">${Fmt.eur(kpis.ticketMedioNuevo)}</td>
          <td class="r" style="color:var(--purple)">${Fmt.eur(kpis.ticketMedioRec)}</td>
          <td class="r text-accent">${Fmt.eur(kpis.ltvMedioRec)}</td>
          <td class="r text-accent">${Fmt.eur(kpis.cajaTotal)}</td>
        </tr></tfoot>`:''}
      </table></div></div>`;
  },

  renderCategory(filtered) {
    const catMap = {};
    filtered.forEach(r => {
      const cat = Calculations.categorizeTreatment(r.treatment);
      if (!catMap[cat]) catMap[cat] = { caja:0, cajaBase:0, pids:new Set(), n:0 };
      catMap[cat].caja += r.venta; catMap[cat].cajaBase += r.precioBase; catMap[cat].pids.add(r.id); catMap[cat].n++;
    });
    const catClass = { 'Medicina Estética':'cat-estetica','Capilar':'cat-capilar','Injerto Capilar':'cat-injerto','Vascular':'cat-vascular','Productos':'cat-productos' };
    const rows = Object.entries(catMap).map(([cat,d]) => {
      const pids = [...d.pids]; const ltvs = pids.map(p => Calculations.patientLTV[p]||0);
      return { cat, caja:d.caja, cajaBase:d.cajaBase, pats:pids.length, n:d.n, tm:pids.length>0?d.caja/pids.length:0, ltv:ltvs.length>0?ltvs.reduce((s,v)=>s+v,0)/ltvs.length:0 };
    }).sort((a,b) => b.caja-a.caja);

    return `<div class="card"><div class="card-title">💼 Análisis por línea de negocio</div><div class="table-wrap"><table>
      <thead><tr><th>Categoría</th><th class="r">Venta (c/IVA)</th><th class="r">Base (s/IVA)</th><th class="r">Pacientes</th><th class="r">Tratamientos</th><th class="r">Ticket</th><th class="r">LTV medio</th></tr></thead>
      <tbody>${rows.map(r=>`<tr>
        <td><span class="${catClass[r.cat]||'cat-otros'}">${r.cat}</span></td>
        <td class="r text-accent fw-bold">${Fmt.eur(r.caja)}</td>
        <td class="r text-teal">${Fmt.eur(r.cajaBase)}</td>
        <td class="r">${r.pats}</td><td class="r">${r.n}</td>
        <td class="r">${Fmt.eur(r.tm)}</td>
        <td class="r text-accent">${Fmt.eur(r.ltv)}</td>
      </tr>`).join('')}</tbody>
    </table></div></div>`;
  },

  renderPatients(filtered) {
    const pids = [...new Set(filtered.map(r => r.id))];
    const periodSpend = {};
    filtered.forEach(r => { periodSpend[r.id] = (periodSpend[r.id]||0) + r.venta; });
    const data = pids.map(pid => ({
      id: pid,
      name: Calculations.patientName[pid] || pid,
      isRec: Calculations.isRecurrent(pid),
      firstPurchase: Calculations.patientFirstDate[pid],
      periodSpend: periodSpend[pid]||0,
      ltv: Calculations.patientLTV[pid]||0,
    })).sort((a,b) => b.ltv-a.ltv);

    return `<div class="card"><div class="card-title">👥 Listado de pacientes (${data.length})</div>
      <div style="overflow-x:auto;max-height:520px;overflow-y:auto"><table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th class="r">1ª compra</th><th class="r">Gasto periodo</th><th class="r">LTV total</th></tr></thead>
        <tbody>${data.slice(0,150).map(p=>`<tr>
          <td style="color:var(--dim);font-size:12px">${p.id}</td>
          <td style="font-weight:600">${p.name}</td>
          <td>${p.isRec?'<span class="badge badge-rec">RECURRENTE</span>':'<span class="badge badge-new">NUEVO</span>'}</td>
          <td class="r">${p.firstPurchase?p.firstPurchase.toLocaleDateString('es-ES'):'—'}</td>
          <td class="r">${Fmt.eur(p.periodSpend)}</td>
          <td class="r text-accent fw-bold">${Fmt.eur(p.ltv)}</td>
        </tr>`).join('')}${data.length>150?`<tr><td colspan="6" style="text-align:center;color:var(--dim);font-size:12px">Mostrando 150 de ${data.length}</td></tr>`:''}</tbody>
      </table></div></div>`;
  },
};
