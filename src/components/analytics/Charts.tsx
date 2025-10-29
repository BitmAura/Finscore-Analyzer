// Thin wrapper to re-export the JS chart implementations and avoid heavy TS types
// Keep this file as TSX so other imports keep working

// @ts-ignore - Chart.js types are not fully compatible with React 18
export { LineChart, BarChart, DoughnutChart, RadarChart, AreaChart, MultiAxisChart } from './Charts.js'

// Re-export default as well
// @ts-ignore - Chart.js types are not fully compatible with React 18
export { default } from './Charts.js'
