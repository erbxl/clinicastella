// ═══════════════════════════════════════
// MÓDULO: CASHFLOW
// Cobros, pagos, saldo disponible, liquidez
// Depende de: Caja (cobros) + Costes (pagos)
// ═══════════════════════════════════════

const Cashflow = {
  render() {
    return `
      <div style="margin-bottom:20px">
        <div class="page-title">Cashflow</div>
        <div class="page-subtitle">Control de liquidez · cobros vs pagos</div>
      </div>
      <div class="card wip-card">
        <div class="wip-icon">◎</div>
        <div class="wip-title">Módulo en construcción</div>
        <div class="wip-text">
        <p style="color:var(--muted);font-size:13px">
          Necesita datos de Caja (cobros) y Costes (pagos) para calcular el saldo real.<br><br>
          Pendiente: conectar ambos módulos y mostrar el flujo mensual.
        </div>
      </div>`;
  },
  init() {},
};


// ═══════════════════════════════════════
// MÓDULO: RENTABILIDAD (DEVENGO)
// Margen bruto y neto, CAC, LTV/CAC
// Depende de: Caja + Costes
// ═══════════════════════════════════════

const Rentabilidad = {
  render() {
    return `
      <div class="page-header" style="border-bottom:none;padding-bottom:0;margin-bottom:24px"><div><div class="page-title">Rentabilidad</div><div class="page-subtitle">Margen bruto · margen neto · CAC · LTV/CAC</div></div></div>
      <div class="card wip-card">
        <div class="wip-icon">◎</div>
        <div class="wip-title">Módulo en construcción</div>
        <div class="wip-text">
        <p style="color:var(--muted);font-size:13px">
          Necesita el módulo de Costes completado para calcular márgenes reales.<br><br>
          Pendiente: importar Excel de costes → calcular margen bruto y neto por mes y por agenda.
        </div>
      </div>`;
  },
  init() {},
};


// ═══════════════════════════════════════
// MÓDULO: PACIENTES
// Ficha de paciente, historial, estado
// ═══════════════════════════════════════

const Pacientes = {
  render() {
    const sales = App.getSalesRecords();
    const pids = [...new Set(sales.map(r => r.id))].filter(Boolean);

    return `
      <div class="page-header" style="border-bottom:none;padding-bottom:0;margin-bottom:24px"><div><div class="page-title">Pacientes</div><div class="page-subtitle">${pids.length} pacientes en base de datos</div>
      </div>
      <div class="card wip-card">
        <div class="wip-icon">◎</div>
        <div class="wip-title">Módulo en construcción</div>
        <div class="wip-text">
        <p style="color:var(--muted);font-size:13px">
          Pendiente: ficha completa de paciente con canal de captación, estado, historial de visitas.<br><br>
          Los datos de LTV y recurrencia ya están disponibles — ver pestaña Pacientes en el módulo Caja.
        </div>
      </div>`;
  },
  init() {},
};
