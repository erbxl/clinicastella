// ═══════════════════════════════════════
// FORMATTERS — formato de números y fechas
// ═══════════════════════════════════════

const Fmt = {
  eur:    n => (n||0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
  num:    n => (n||0).toLocaleString('es-ES'),
  pct:    n => (n||0).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %',
  month:  k => { const [y,m] = k.split('-'); return `${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][+m-1]} ${y}`; },
  monthKey: d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
};
