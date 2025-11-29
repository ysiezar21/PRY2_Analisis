import React, { useState, useRef, useEffect } from 'react';

const GraphVisualizer = ({ graphData, config, stats, onAddNode, onConnectNodes, mode, selectedNodes }) => {
  const svgRef = useRef();
  const [localGraph, setLocalGraph] = useState(graphData);

  // Efecto para sincronizar con graphData externo
  useEffect(() => {
    if (graphData) {
      setLocalGraph(graphData);
    }
  }, [graphData]);

  // Manejar clic en el SVG
  const handleSvgClick = (event) => {
    if (mode === 'addNode') {
      const svg = svgRef.current;
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      
      onAddNode(svgPoint.x, svgPoint.y);
    }
  };

  // Manejar clic en un nodo
  const handleNodeClick = (nodeId, event) => {
    event.stopPropagation();
    
    if (mode === 'connect') {
      onConnectNodes(nodeId);
    }
  };

  // Función para renderizar el grafo visualmente
  const renderGrafo = () => {
    if (!localGraph || localGraph.nodos.length === 0) {
      return (
        <div className="graph-placeholder">
          <p>El grafo se visualizará aquí</p>
          <p><strong>Nodos:</strong> {config.nodeCount}</p>
          <p><strong>Colores:</strong> {config.colorCount}</p>
          <p><strong>Algoritmo:</strong> {config.algorithm === 'monteCarlo' ? 'Monte Carlo' : 'Las Vegas'}</p>
          <p><strong>Iteraciones:</strong> {config.iterations}</p>
          <p>Usa los controles para agregar nodos o ejecuta el algoritmo</p>
        </div>
      );
    }

    return (
      <div className="graph-container">
        <svg 
          ref={svgRef}
          width="100%" 
          height="500" 
          viewBox="0 0 600 500"
          onClick={handleSvgClick}
          style={{ cursor: mode === 'addNode' ? 'crosshair' : 'default' }}
        >
          {/* Renderizar aristas */}
          {localGraph.aristas.map((arista, index) => (
            <line
              key={index}
              x1={localGraph.nodos[arista.source].x}
              y1={localGraph.nodos[arista.source].y}
              x2={localGraph.nodos[arista.target].x}
              y2={localGraph.nodos[arista.target].y}
              stroke={arista.tieneConflicto ? "#e74c3c" : "#34495e"}
              strokeWidth={arista.tieneConflicto ? 3 : 2}
              className="edge"
            />
          ))}
          
          {/* Renderizar nodos */}
          {localGraph.nodos.map((nodo) => (
            <g 
              key={nodo.id} 
              transform={`translate(${nodo.x}, ${nodo.y})`}
              onClick={(e) => handleNodeClick(nodo.id, e)}
              style={{ cursor: mode === 'connect' ? 'pointer' : 'default' }}
            >
              <circle
                r="20"
                fill={nodo.color || '#3498db'}
                stroke={selectedNodes.includes(nodo.id) ? "#e74c3c" : "#2c3e50"}
                strokeWidth={selectedNodes.includes(nodo.id) ? 3 : 2}
                className="node"
              />
              <text
                textAnchor="middle"
                dy=".3em"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                className="node-label"
              >
                {nodo.id}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Información del modo actual */}
        <div className="mode-info">
          {mode === 'addNode' && <p>Modo: Agregar Nodos - Haz clic para agregar</p>}
          {mode === 'connect' && <p>Modo: Conectar - Selecciona dos nodos: {selectedNodes.join(', ')}</p>}
          {mode === 'view' && <p>Modo: Visualización</p>}
        </div>
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
