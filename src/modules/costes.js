// ═══════════════════════════════════════
// MÓDULO: COSTES
// Introducción y gestión de gastos mensuales
// Categorías: personal, alquiler, suministros,
//             marketing, material clínico, otros
// ═══════════════════════════════════════

const Costes = {
  render() {
    const costes = App.state.costes;
    const total = costes.reduce((s,c) => s+c.importe, 0);

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px">
        <div>
          <h2 style="font-size:20px;font-weight:700">📋 Costes</h2>
          <p style="color:var(--muted);font-size:13px;margin-top:2px">Gastos mensuales de la clínica</p>
        </div>
        <div style="display:flex;gap:8px">
          <label class="btn">📁 Importar Excel<input type="file" id="costes-file-input" accept=".xlsx,.csv" /></label>
          <button class="btn-ghost" id="costes-add-btn">+ Añadir gasto</button>
        </div>
      </div>

      <!-- TODO: modal de añadir gasto -->
      <!-- TODO: tabla de costes con filtro por mes -->
      <!-- TODO: resumen por categoría -->

      <div class="card">
        <div class="card-title">🚧 Módulo en construcción</div>
        <p style="color:var(--muted);font-size:13px">
          Este módulo se conectará con el módulo de Cashflow y Rentabilidad.<br><br>
          Pendiente: importar el Excel de costes mensual que tienes.
        </p>
      </div>`;
  },

  init() {
    document.getElementById('costes-file-input')?.addEventListener('change', e => {
      if (e.target.files[0]) this.importExcel(e.target.files[0]);
      e.target.value = '';
    });
  },

  importExcel(file) {
    // TODO: leer Excel con XLSX.js y parsear estructura de costes
    console.log('Importar costes:', file.name);
  },
};
