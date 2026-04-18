// ═══════════════════════════════════════
// APP — router principal y estado global
// ═══════════════════════════════════════

const App = {
  // Estado global compartido entre módulos
  state: {
    // Caja
    cajaRecords:  [],
    cajaFiles:    [],
    // Costes
    costes:       [],
    // Página activa
    currentPage:  'dashboard',
  },

  init() {
    // Cargar datos persistidos
    const caja = Storage.loadCaja();
    if (caja) {
      this.state.cajaRecords = caja.records;
      this.state.cajaFiles   = caja.files;
      Calculations.rebuildMaps(this.getSalesRecords());
    }
    this.state.costes = Storage.loadCostes();

    // Navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.page));
    });

    // Render inicial
    this.navigate('dashboard');
  },

  navigate(page) {
    this.state.currentPage = page;
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === page);
    });
    const app = document.getElementById('app');
    switch(page) {
      case 'dashboard':     app.innerHTML = Dashboard.render();     Dashboard.init();     break;
      case 'caja':          app.innerHTML = Caja.render();          Caja.init();          break;
      case 'costes':        app.innerHTML = Costes.render();        Costes.init();        break;
      case 'cashflow':      app.innerHTML = Cashflow.render();      Cashflow.init();      break;
      case 'rentabilidad':  app.innerHTML = Rentabilidad.render();  Rentabilidad.init();  break;
      case 'pacientes':     app.innerHTML = Pacientes.render();     Pacientes.init();     break;
    }
  },

  // Solo registros de venta (Entrada, con ID y importe > 0)
  getSalesRecords() {
    return this.state.cajaRecords.filter(r => r.tipo === 'Entrada' && r.id && r.venta > 0);
  },

  // Actualizar caja (llamado desde módulo Caja tras importar)
  updateCaja(records, files) {
    this.state.cajaRecords = records;
    this.state.cajaFiles   = files;
    Calculations.rebuildMaps(this.getSalesRecords());
    Storage.saveCaja(records, files);
  },

  // Actualizar costes (llamado desde módulo Costes)
  updateCostes(costes) {
    this.state.costes = costes;
    Storage.saveCostes(costes);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
