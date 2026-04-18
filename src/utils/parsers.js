// ═══════════════════════════════════════
// PARSERS — lectura de CSV y Excel
// ═══════════════════════════════════════

const Parsers = {

  // ── Número español "1.234,56" → 1234.56
  spanishNum(s) {
    if (s == null) return 0;
    if (typeof s === 'number') return s;
    const c = String(s).replace(/"/g,'').trim().replace(/\./g,'').replace(',','.');
    return parseFloat(c) || 0;
  },

  // ── Número con punto decimal (exportación propia) "1234.56" → 1234.56
  dotNum(s) {
    if (s == null) return 0;
    return parseFloat(String(s).replace(/"/g,'').trim()) || 0;
  },

  // ── Fecha "DD/MM/YYYY HH:MM" → Date
  date(s) {
    if (!s) return null;
    const m = String(s).replace(/"/g,'').trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!m) return null;
    return new Date(+m[3], +m[2]-1, +m[1]);
  },

  // ── Fecha para input[type=date] → "YYYY-MM-DD"
  toInputDate(d) {
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  // ── Extraer info de paciente del campo "Detalles" de Clínica Cloud
  // Formato: "123. NOMBRE [tel]: tratamiento"
  patientInfo(detalles) {
    if (!detalles) return { id: null, name: null, treatment: null };
    const d = String(detalles).replace(/"/g,'').trim();
    const m = d.match(/^(\d+)\.\s+(.+?)\s*\[([^\]]+)\]:\s*(.*)$/);
    if (m) return {
      id: m[1],
      name: m[2].trim(),
      treatment: m[4].replace(/Pres\.\s*N\.\s*\d+:\s*/, '').trim(),
    };
    return { id: null, name: null, treatment: d };
  },

  // ── Parser CSV de Clínica Cloud
  parseClinicaCloud(text) {
    const records = [];
    const isSemi = text.split(/\r?\n/)[0].includes(';');
    const parsed = Papa.parse(text, { delimiter: isSemi ? ';' : ',', quoteChar: '"', skipEmptyLines: true });
    const SKIP = ['TOTAL','EFECTIVO','TARJETA','TALÓN','BIZUM','FINANCIANDO','TRASFERENCIA','DESCUENTO','DOMICILIADO'];

    for (let i = 1; i < parsed.data.length; i++) {
      const r = parsed.data[i];
      if (!r[0]) continue;
      if (SKIP.some(s => String(r[0]).toUpperCase().includes(s))) continue;
      const fecha = this.date(r[0]);
      if (!fecha) continue;
      const tipo    = String(r[1]||'').replace(/"/g,'').trim();
      const agenda  = String(r[5]||'').replace(/"/g,'').trim();
      const details = String(r[6]||'').replace(/"/g,'').trim();
      const venta   = this.spanishNum(r[7]);
      const pb      = this.spanishNum(r[8]);
      const iv      = this.spanishNum(r[9]);
      const baseCalc = pb > 0 ? pb : venta / 1.21;
      const ivaCalc  = iv > 0 ? iv : venta - baseCalc;
      const pi = this.patientInfo(details);
      records.push({ fecha, tipo, agenda, venta, precioBase: baseCalc, iva: ivaCalc, ...pi });
    }
    return records;
  },

  // ── Parser BD exportada por esta app
  parseExportedBD(text) {
    const records = [];
    const isSemi = text.split(/\r?\n/)[0].includes(';');
    const parsed = Papa.parse(text, { delimiter: isSemi ? ';' : ',', quoteChar: '"', skipEmptyLines: true });
    if (!parsed.data.length) return records;

    const header = parsed.data[0].map(h => String(h).replace(/"/g,'').trim().toLowerCase());
    const idx = {
      fecha:     header.indexOf('fecha'),
      agenda:    header.indexOf('agenda'),
      id:        header.indexOf('idpaciente'),
      name:      header.indexOf('nombre'),
      treatment: header.indexOf('tratamiento'),
      venta:     header.indexOf('ventaconiva'),
      base:      header.indexOf('preciobase'),
      iva:       header.indexOf('iva'),
    };

    for (let i = 1; i < parsed.data.length; i++) {
      const r = parsed.data[i];
      if (!r[idx.fecha]) continue;
      const fecha = this.date(String(r[idx.fecha]||''));
      if (!fecha) continue;
      const venta = this.dotNum(r[idx.venta]);
      const id    = String(r[idx.id]||'').replace(/"/g,'').trim();
      if (!id || venta <= 0) continue;
      const base = this.dotNum(r[idx.base]);
      const iva  = this.dotNum(r[idx.iva]);
      records.push({
        fecha, tipo: 'Entrada',
        agenda:    String(r[idx.agenda]||'').replace(/"/g,'').trim(),
        id,
        name:      String(r[idx.name]||'').replace(/"/g,'').trim(),
        treatment: String(r[idx.treatment]||'').replace(/"/g,'').trim(),
        venta,
        precioBase: base > 0 ? base : venta / 1.21,
        iva: iva > 0 ? iva : venta - (base > 0 ? base : venta / 1.21),
      });
    }
    return records;
  },

  // ── Auto-detectar formato y parsear
  parseCSV(text) {
    const firstLine = text.split(/\r?\n/)[0];
    const isBD = firstLine.toLowerCase().includes('idpaciente') || firstLine.toLowerCase().includes('ventaconiva');
    return isBD ? this.parseExportedBD(text) : this.parseClinicaCloud(text);
  },

  // ── Exportar a CSV
  exportCSV(records, filename) {
    const header = ['Fecha','Agenda','IDPaciente','Nombre','Tratamiento','VentaConIVA','PrecioBase','IVA','Categoria','EsRecurrente'];
    const rows = records.map(r => [
      r.fecha ? r.fecha.toLocaleDateString('es-ES') : '',
      r.agenda||'', r.id||'', r.name||'', r.treatment||'',
      r.venta.toFixed(2), r.precioBase.toFixed(2), r.iva.toFixed(2),
      Calculations.categorizeTreatment(r.treatment),
      Calculations.isRecurrent(r.id) ? 'Recurrente' : 'Nuevo',
    ]);
    const content = [header,...rows].map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF'+content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  },
};
