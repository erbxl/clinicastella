// ═══════════════════════════════════════
// MÓDULO: CASHFLOW
// Cobros, pagos, saldo disponible, liquidez
// Depende de: Caja (cobros) + Costes (pagos)
// ═══════════════════════════════════════

const Cashflow = {
  render() {
    return `
      <div style="margin-bottom:20px">
        <h2 style="font-size:20px;font-weight:700">🏦 Cashflow</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">Control de liquidez · cobros vs pagos</p>
      </div>
      <div class="card">
        <div class="card-title">🚧 Módulo en construcción</div>
        <p style="color:var(--muted);font-size:13px">
          Necesita datos de Caja (cobros) y Costes (pagos) para calcular el saldo real.<br><br>
          Pendiente: conectar ambos módulos y mostrar el flujo mensual.
        </p>
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
      <div style="margin-bottom:20px">
        <h2 style="font-size:20px;font-weight:700">📈 Rentabilidad</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">Margen bruto · margen neto · CAC · LTV/CAC</p>
      </div>
      <div class="card">
        <div class="card-title">🚧 Módulo en construcción</div>
        <p style="color:var(--muted);font-size:13px">
          Necesita el módulo de Costes completado para calcular márgenes reales.<br><br>
          Pendiente: importar Excel de costes → calcular margen bruto y neto por mes y por agenda.
        </p>
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
      <div style="margin-bottom:20px">
        <h2 style="font-size:20px;font-weight:700">👥 Pacientes</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">${pids.length} pacientes en base de datos</p>
      </div>
      <div class="card">
        <div class="card-title">🚧 Módulo en construcción</div>
        <p style="color:var(--muted);font-size:13px">
          Pendiente: ficha completa de paciente con canal de captación, estado, historial de visitas.<br><br>
          Los datos de LTV y recurrencia ya están disponibles — ver pestaña Pacientes en el módulo Caja.
        </p>
      </div>`;
  },
  init() {},
};
