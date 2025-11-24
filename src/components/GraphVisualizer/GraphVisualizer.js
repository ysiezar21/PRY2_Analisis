import React from 'react';

const GraphVisualizer = ({ graphData, config, stats }) => {
  return (
    <div className="graph-visualizer">
      <h2>Visualización del Grafo</h2>
      <div className="graph-placeholder">
        <p>El grafo se visualizará aquí</p>
        <p><strong>Nodos:</strong> {config.nodeCount}</p>
        <p><strong>Colores:</strong> {config.colorCount}</p>
        <p><strong>Algoritmo:</strong> {config.algorithm === 'monteCarlo' ? 'Monte Carlo' : 'Las Vegas'}</p>
        <p><strong>Iteraciones:</strong> {config.iterations}</p>
        
        {stats && (
          <div style={{marginTop: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '5px'}}>
            <h4>Estadísticas de Ejecución:</h4>
            <p>Intentos: {stats.intentos}</p>
            <p>Conflictos: {stats.conflictos}</p>
            <p>Tiempo: {stats.tiempo}</p>
            <p>Estado: {stats.exito ? '✅ Éxito' : '❌ Fallo'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphVisualizer;