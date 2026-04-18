// ═══════════════════════════════════════
// STORAGE — persistencia en localStorage
// Cada módulo tiene su propia clave
// ═══════════════════════════════════════

const STORAGE_KEYS = {
  caja:     'stella-caja-v1',
  costes:   'stella-costes-v1',
  pacientes:'stella-pacientes-v1',
};

const Storage = {
  save(module, data) {
    try {
      localStorage.setItem(STORAGE_KEYS[module], JSON.stringify(data));
      return true;
    } catch(e) {
      console.warn('Storage save error:', e);
      return false;
    }
  },

  load(module) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS[module]);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      console.warn('Storage load error:', e);
      return null;
    }
  },

  delete(module) {
    try {
      localStorage.removeItem(STORAGE_KEYS[module]);
    } catch(e) {}
  },

  // Caja: records + files list
  saveCaja(records, files) {
    this.save('caja', {
      records: records.map(r => ({ ...r, fecha: r.fecha.toISOString() })),
      files,
      savedAt: new Date().toISOString(),
    });
  },

  loadCaja() {
    const d = this.load('caja');
    if (!d) return null;
    return {
      records: d.records.map(r => ({ ...r, fecha: new Date(r.fecha) })),
      files: d.files || [],
    };
  },

  // Costes: array de objetos { mes, categoria, subcategoria, importe, proveedor, notas }
  saveCostes(costes) {
    this.save('costes', { costes, savedAt: new Date().toISOString() });
  },

  loadCostes() {
    const d = this.load('costes');
    return d ? d.costes : [];
  },
};
