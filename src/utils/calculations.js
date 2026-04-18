// ═══════════════════════════════════════
// CALCULATIONS — lógica de negocio compartida
// ═══════════════════════════════════════

const Calculations = {

  // ── Categorizar tratamiento
  categorizeTreatment(t) {
    if (!t) return 'Otros';
    const s = t.toLowerCase();
    if (s.includes('injerto')) return 'Injerto Capilar';
    if (s.includes('capilar')||s.includes('cabello')||s.includes('dutasteride')||s.includes('prp')||s.includes('plasma rico')) return 'Capilar';
    if (s.includes('vascular')||s.includes('varices')||s.includes('esclerosis')) return 'Vascular';
    if (s.includes('derma')||s.includes('rosac')||s.includes('acne')||s.includes('psoriasis')) return 'Dermatología';
    if (s.includes('botox')||s.includes('hialurónico')||s.includes('relleno')||s.includes('peeling')||s.includes('microdermoabrasión')||s.includes('bb-glow')||s.includes('rejuvenecimiento')||s.includes('ipl')||s.includes('hidrolift')||s.includes('profhilo')||s.includes('maq semipermanente')||s.includes('aqualix')||s.includes('prostolane')||s.includes('grasa localizada')||s.includes('presoterapia')||s.includes('depilación')||s.includes('estética')) return 'Medicina Estética';
    if (s.includes('consulta gratuita')||s.includes('revision gratis')) return 'Consulta';
    if (s.includes('syl')||s.includes('cream')||s.includes('gel ')||s.includes('hidrasyl')||s.includes('glicosyl')||s.includes('arni')) return 'Productos';
    return 'Otros';
  },

  // ── Mapas derivados (se reconstruyen al importar datos)
  patientMonths:    {},  // pid → Set de month-keys
  patientLTV:       {},  // pid → gasto histórico total
  patientFirstDate: {},  // pid → primera compra Date
  patientName:      {},  // pid → nombre

  rebuildMaps(salesRecords) {
    this.patientMonths    = {};
    this.patientLTV       = {};
    this.patientFirstDate = {};
    this.patientName      = {};

    salesRecords.forEach(r => {
      if (!this.patientMonths[r.id]) this.patientMonths[r.id] = new Set();
      this.patientMonths[r.id].add(Fmt.monthKey(r.fecha));
      this.patientLTV[r.id] = (this.patientLTV[r.id]||0) + r.venta;
      if (!this.patientFirstDate[r.id] || r.fecha < this.patientFirstDate[r.id])
        this.patientFirstDate[r.id] = r.fecha;
      if (!this.patientName[r.id] && r.name)
        this.patientName[r.id] = r.name;
    });
  },

  // ── Recurrente = ha venido en más de 1 mes distinto en el histórico
  isRecurrent(pid) {
    return this.patientMonths[pid] && this.patientMonths[pid].size > 1;
  },

  // ── KPIs de un conjunto de registros filtrados
  computeKPIs(filteredRecords, salesRecords) {
    const cajaTotal = filteredRecords.reduce((s,r) => s + r.venta, 0);
    const cajaBase  = filteredRecords.reduce((s,r) => s + r.precioBase, 0);
    const uniquePids = [...new Set(filteredRecords.map(r => r.id))];
    const numPats    = uniquePids.length;
    const ticketMedio = numPats > 0 ? cajaTotal / numPats : 0;

    const newPids = uniquePids.filter(p => !this.isRecurrent(p));
    const recPids = uniquePids.filter(p =>  this.isRecurrent(p));

    // Ticket nuevo = gasto en primer mes del histórico
    const newSpend = salesRecords.filter(r => {
      if (!newPids.includes(r.id)) return false;
      const fp = this.patientFirstDate[r.id];
      return fp && Fmt.monthKey(fp) === Fmt.monthKey(r.fecha);
    }).reduce((s,r) => s + r.venta, 0);
    const ticketMedioNuevo = newPids.length > 0 ? newSpend / newPids.length : 0;

    const recSpend = filteredRecords.filter(r => recPids.includes(r.id)).reduce((s,r) => s + r.venta, 0);
    const ticketMedioRec = recPids.length > 0 ? recSpend / recPids.length : 0;

    const allLTVs = uniquePids.map(p => this.patientLTV[p]||0);
    const ltvMedio = allLTVs.length > 0 ? allLTVs.reduce((s,v) => s+v,0) / allLTVs.length : 0;
    const recLTVs  = recPids.map(p => this.patientLTV[p]||0);
    const ltvMedioRec = recLTVs.length > 0 ? recLTVs.reduce((s,v) => s+v,0) / recLTVs.length : 0;

    return {
      cajaTotal, cajaBase, iva: cajaTotal - cajaBase,
      numPats, newPats: newPids.length, recPats: recPids.length,
      ticketMedio, ticketMedioNuevo, ticketMedioRec,
      ltvMedio, ltvMedioRec,
      newPids, recPids, uniquePids,
    };
  },

  // ── Margen bruto: ingresos (caja base) - costes directos del periodo
  computeMargen(cajaBase, costesPeriodo) {
    const costesDirectos = costesPeriodo
      .filter(c => c.tipo === 'directo')
      .reduce((s,c) => s + c.importe, 0);
    const costesIndirectos = costesPeriodo
      .filter(c => c.tipo === 'indirecto')
      .reduce((s,c) => s + c.importe, 0);
    const margenBruto = cajaBase - costesDirectos;
    const margenNeto  = margenBruto - costesIndirectos;
    return {
      costesDirectos, costesIndirectos,
      costesTotales: costesDirectos + costesIndirectos,
      margenBruto,  margenBruto_pct: cajaBase > 0 ? (margenBruto / cajaBase) * 100 : 0,
      margenNeto,   margenNeto_pct:  cajaBase > 0 ? (margenNeto  / cajaBase) * 100 : 0,
    };
  },
};
