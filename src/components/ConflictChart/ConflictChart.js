import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ConflictChart = ({ historialConflictos, algoritmo }) => {
  if (!historialConflictos || historialConflictos.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>📊 Ejecuta un algoritmo para ver la gráfica de conflictos</p>
        <p>La gráfica mostrará la evolución de los conflictos durante la ejecución</p>
      </div>
    );
  }

  // Preparar datos para la gráfica (muestrear si son muchos datos)
  const prepararDatos = () => {
    if (historialConflictos.length <= 100) {
      return historialConflictos.map((item, index) => ({
        ...item,
        iteracion: item.iteracion !== undefined ? item.iteracion : index
      }));
    }
    
    // Muestrear cada N puntos para no saturar la gráfica
    const sampleRate = Math.ceil(historialConflictos.length / 100);
    return historialConflictos
      .filter((_, index) => index % sampleRate === 0)
      .map((item, index) => ({
        ...item,
        iteracion: item.iteracion !== undefined ? item.iteracion : index * sampleRate
      }));
  };

  const datosGrafica = prepararDatos();
  const algoritmoNombre = algoritmo === 'monteCarlo' ? 'Monte Carlo' : 'Las Vegas';

  return (
    <div className="conflict-chart">
      <h3>📈 Evolución de Conflictos - {algoritmoNombre}</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={datosGrafica}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="iteracion" 
              label={{ value: 'Iteración', position: 'insideBottom', offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Conflictos', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`${value} conflictos`, 'Conflictos']}
              labelFormatter={(label) => `Iteración: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="conflictos" 
              stroke="#e74c3c" 
              strokeWidth={2}
              dot={datosGrafica.length < 50}
              activeDot={{ r: 6 }}
              name="Conflictos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Estadísticas resumen */}
      <div className="chart-stats">
        <h4>📊 Resumen Estadístico</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span>Máximo de conflictos:</span>
            <strong>{Math.max(...historialConflictos.map(h => h.conflictos))}</strong>
          </div>
          <div className="stat-item">
            <span>Mínimo de conflictos:</span>
            <strong>{Math.min(...historialConflictos.map(h => h.conflictos))}</strong>
          </div>
          <div className="stat-item">
            <span>Iteraciones totales:</span>
            <strong>{historialConflictos.length}</strong>
          </div>
          <div className="stat-item">
            <span>Promedio de conflictos:</span>
            <strong>{(historialConflictos.reduce((sum, h) => sum + h.conflictos, 0) / historialConflictos.length).toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictChart;
