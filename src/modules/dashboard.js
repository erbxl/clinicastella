// ═══════════════════════════════════════
// MÓDULO: DASHBOARD
// Vista general — resumen de todos los módulos
// ═══════════════════════════════════════

const Dashboard = {
  render() {
    const sales   = App.getSalesRecords();
    const costes  = App.state.costes;
    const hasCaja = sales.length > 0;

    // KPIs rápidos del último mes con datos
    let lastMonthKPIs = null;
    if (hasCaja) {
      const months = [...new Set(sales.map(r => Fmt.monthKey(r.fecha)))].sort();
      const lastMonth = months[months.length - 1];
      const lastRecs  = sales.filter(r => Fmt.monthKey(r.fecha) === lastMonth);
      lastMonthKPIs = { ...Calculations.computeKPIs(lastRecs, sales), label: Fmt.month(lastMonth) };
    }

    return `
      <div style="margin-bottom:24px">
        <h2 style="font-size:22px;font-weight:700">Clínica Stella</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:4px">Panel de control · visión global</p>
      </div>

      ${hasCaja ? `
        <!-- KPIs último mes -->
        <div class="card" style="margin-bottom:14px">
          <div class="card-title">📊 Último mes con datos · ${lastMonthKPIs.label}</div>
          <div class="kpi-grid">
            ${[
              { l:'Venta total',      v:Fmt.eur(lastMonthKPIs.cajaTotal),      c:'var(--accent)', i:'💰' },
              { l:'Base (s/IVA)',     v:Fmt.eur(lastMonthKPIs.cajaBase),       c:'var(--teal)',   i:'💳' },
              { l:'Pacientes únicos', v:Fmt.num(lastMonthKPIs.numPats),        c:'var(--blue)',   i:'👥' },
              { l:'Nuevos',          v:Fmt.num(lastMonthKPIs.newPats),         c:'var(--green)',  i:'🆕' },
              { l:'Recurrentes',     v:Fmt.num(lastMonthKPIs.recPats),         c:'var(--purple)', i:'🔄' },
              { l:'Ticket medio',    v:Fmt.eur(lastMonthKPIs.ticketMedio),     c:'var(--blue)',   i:'🎫' },
              { l:'LTV medio',       v:Fmt.eur(lastMonthKPIs.ltvMedio),        c:'var(--accent)', i:'📈' },
            ].map(k => `<div class="kpi-card"><div class="kpi-bar" style="background:linear-gradient(90deg,${k.c},transparent)"></div><div class="kpi-label">${k.i} ${k.l}</div><div class="kpi-value" style="color:${k.c}">${k.v}</div></div>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Estado de los módulos -->
      <div class="card">
        <div class="card-title">🗂 Estado del sistema</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
          ${[
            { icon:'💰', name:'Caja',          status: hasCaja ? `✅ ${sales.length} ventas · ${App.state.cajaFiles.length} archivos` : '⬜ Sin datos',  page:'caja',         ok: hasCaja },
            { icon:'📋', name:'Costes',         status: costes.length ? `✅ ${costes.length} registros` : '⬜ Sin datos',                                  page:'costes',       ok: costes.length > 0 },
            { icon:'🏦', name:'Cashflow',       status: hasCaja && costes.length ? '🟡 Pendiente' : '⬜ Requiere Caja + Costes',                           page:'cashflow',     ok: false },
            { icon:'📈', name:'Rentabilidad',   status: hasCaja && costes.length ? '🟡 Pendiente' : '⬜ Requiere Caja + Costes',                           page:'rentabilidad', ok: false },
            { icon:'👥', name:'Pacientes',      status: hasCaja ? `🟡 ${[...new Set(sales.map(r=>r.id))].length} pacientes (básico)` : '⬜ Sin datos',     page:'pacientes',    ok: false },
          ].map(m => `
            <div class="card" style="margin-bottom:0;cursor:pointer" onclick="App.navigate('${m.page}')">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
                <span style="font-size:20px">${m.icon}</span>
                <span style="font-weight:700;font-size:14px">${m.name}</span>
              </div>
              <div style="font-size:12px;color:var(--muted)">${m.status}</div>
            </div>`).join('')}
        </div>
      </div>

      ${!hasCaja ? `
        <div style="text-align:center;padding:40px 0">
          <div style="font-size:40px;margin-bottom:12px">📊</div>
          <div style="font-size:16px;font-weight:600;margin-bottom:8px">Empieza subiendo los datos de caja</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:20px">Exporta el CSV desde Clínica Cloud y súbelo en el módulo Caja</div>
          <button class="btn" onclick="App.navigate('caja')">Ir a Caja →</button>
        </div>
      ` : ''}`;
  },

  init() {},
};
