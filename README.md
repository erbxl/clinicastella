# Clínica Stella · Sistema de Gestión

Panel de gestión interno para análisis de ingresos, costes, cashflow y rentabilidad.

## Estructura del proyecto

```
clinica-stella/
│
├── index.html                  ← Entrada única (GitHub Pages sirve esto)
│
├── src/
│   ├── styles/
│   │   └── main.css            ← Estilos globales y design system
│   │
│   ├── utils/
│   │   ├── storage.js          ← localStorage (persistencia)
│   │   ├── parsers.js          ← Lectura de CSV/Excel
│   │   ├── formatters.js       ← Formato de números y fechas
│   │   └── calculations.js     ← Lógica de negocio compartida
│   │
│   ├── modules/
│   │   ├── dashboard.js        ← Vista general
│   │   ├── caja.js             ← ✅ Ventas e ingresos (completo)
│   │   ├── costes.js           ← 🚧 Gastos mensuales (en construcción)
│   │   ├── stubs.js            ← 🚧 Cashflow, Rentabilidad, Pacientes
│   │   └── dashboard.js        ← ✅ Panel de control
│   │
│   └── app.js                  ← Router y estado global
│
└── README.md
```

## Módulos

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| 💰 Caja | ✅ Completo | CSV Clínica Cloud · LTV · nuevos/recurrentes · agenda |
| 📋 Costes | 🚧 En construcción | Excel de gastos mensuales |
| 🏦 Cashflow | ⬜ Pendiente | Requiere Caja + Costes |
| 📈 Rentabilidad | ⬜ Pendiente | Margen bruto/neto · CAC · LTV/CAC |
| 👥 Pacientes | ⬜ Pendiente | Ficha completa · canal · estado |

## Despliegue en GitHub Pages

1. Sube este repositorio a GitHub
2. Ve a **Settings → Pages**
3. Selecciona `main` branch, carpeta `/ (root)`
4. Tu URL será `https://[usuario].github.io/clinica-stella`

## Datos

- Los datos se guardan en `localStorage` del navegador
- Exporta la BD en CSV desde el módulo Caja como backup
- Para restaurar: sube el CSV exportado (el parser lo detecta automáticamente)
