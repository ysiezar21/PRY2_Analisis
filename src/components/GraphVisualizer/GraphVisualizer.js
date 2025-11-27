import React from 'react';

const GraphVisualizer = ({ graphData, config, stats }) => {
  // Función para renderizar el grafo visualmente
  const renderGrafo = () => {
    if (!graphData) {
      return (
        <div className="graph-placeholder">
          <p>El grafo se visualizará aquí</p>
          <p><strong>Nodos:</strong> {config.nodeCount}</p>
          <p><strong>Colores:</strong> {config.colorCount}</p>
          <p><strong>Algoritmo:</strong> {config.algorithm === 'monteCarlo' ? 'Monte Carlo' : 'Las Vegas'}</p>
          <p><strong>Iteraciones:</strong> {config.iterations}</p>
          <p>Ejecuta el algoritmo para ver los resultados</p>
        </div>
      );
    }

    return (
      <div className="graph-container">
        <svg width="100%" height="500" viewBox="0 0 600 500">
          {/* Renderizar aristas */}
          {graphData.aristas.map((arista, index) => (
            <line
              key={index}
              x1={graphData.nodos[arista.source].x}
              y1={graphData.nodos[arista.source].y}
              x2={graphData.nodos[arista.target].x}
              y2={graphData.nodos[arista.target].y}
              stroke={arista.tieneConflicto ? "#e74c3c" : "#34495e"}
              strokeWidth={arista.tieneConflicto ? 3 : 2}
            />
          ))}
          
          {/* Renderizar nodos */}
          {graphData.nodos.map((nodo) => (
            <g key={nodo.id} transform={`translate(${nodo.x}, ${nodo.y})`}>
              <circle
                r="20"
                fill={nodo.color}
                stroke="#2c3e50"
                strokeWidth="2"
              />
              <text
                textAnchor="middle"
                dy=".3em"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {nodo.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="graph-visualizer">
      <h2>Visualización del Grafo</h2>
      
      {renderGrafo()}
      
      {stats && (
        <div className="execution-stats">
          <h3>Estadísticas de Ejecución</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Intentos:</label>
              <span>{stats.intentos}</span>
            </div>
            <div className="stat-item">
              <label>Conflictos:</label>
              <span className={stats.conflictos > 0 ? 'conflict' : 'success'}>
                {stats.conflictos}
              </span>
            </div>
            <div className="stat-item">
              <label>Tiempo:</label>
              <span>{stats.tiempo}</span>
            </div>
            <div className="stat-item">
              <label>Estado:</label>
              <span className={stats.exito ? 'success' : 'error'}>
                {stats.exito ? '✅ Éxito' : stats.error ? `❌ ${stats.error}` : '❌ Fallo'}
              </span>
            </div>
            {stats.coloresAumentados > 0 && (
              <div className="stat-item">
                <label>Colores Aumentados:</label>
                <span>+{stats.coloresAumentados}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;
