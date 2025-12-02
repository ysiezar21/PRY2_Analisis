import React, { useState, useRef, useEffect } from 'react';

const GraphVisualizer = ({ 
  graphData, 
  config, 
  stats, 
  onAddNode, 
  onConnectNodes, 
  onRecolorNode,
  mode, 
  selectedNodes,
  recolorMetrics,
  infoGrafo
}) => {
  const svgRef = useRef();
  const [localGraph, setLocalGraph] = useState({ nodos: [], aristas: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Efecto para sincronizar con graphData externo
  useEffect(() => {
    if (graphData) {
      setLocalGraph(graphData);
    } else {
      setLocalGraph({ nodos: [], aristas: [] });
    }
  }, [graphData]);

  // 🆕 CORREGIDO: Manejar clic en el SVG - cálculo correcto de coordenadas
  const handleSvgClick = (event) => {
    if (mode === 'addNode') {
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      
      console.log(`Agregando nodo en posición: ${svgP.x}, ${svgP.y}`);
      onAddNode(svgP.x, svgP.y);
    }
    
    // Cerrar color picker si se hace clic fuera
    if (showColorPicker) {
      setShowColorPicker(false);
      setSelectedNode(null);
    }
  };

  // Función para manejar clic en nodo (recoloración)
  const handleNodeClick = (nodeId, event) => {
    event.stopPropagation();
    
    if (mode === 'connect') {
      console.log(`Nodo ${nodeId} seleccionado para conectar`);
      onConnectNodes(nodeId);
    } else if (mode === 'view') {
      console.log(`Nodo ${nodeId} seleccionado para recolorar`);
      setSelectedNode(nodeId);
      setShowColorPicker(true);
    }
  };

  // Función para cambiar color de nodo
  const handleColorChange = (color) => {
    if (selectedNode !== null && onRecolorNode) {
      console.log(`Cambiando color del nodo ${selectedNode} a: ${color}`);
      onRecolorNode(selectedNode, color);
      setShowColorPicker(false);
      setSelectedNode(null);
    }
  };


  // Paleta de colores predefinida
  const colorPalette = [
    "#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FFA500",
    "#800080", "#00FFFF", "#FFC0CB", "#A52A2A", "#808080",
    "#008000", "#FFD700", "#4B0082", "#FF4500", "#2E8B57",
    "#1E90FF", "#D2691E", "#ADFF2F", "#FF1493", "#00FA9A"
  ];

  // Función para calcular conflictos en tiempo real
  const calcularConflictos = (nodos, aristas) => {
    return aristas.map(arista => {
      const nodoOrigen = nodos[arista.source];
      const nodoDestino = nodos[arista.target];
      
      if (nodoOrigen && nodoDestino && nodoOrigen.color && nodoDestino.color) {
        const tieneConflicto = nodoOrigen.color === nodoDestino.color;
        return {
          ...arista,
          tieneConflicto: tieneConflicto
        };
      }
      return {
        ...arista,
        tieneConflicto: false
      };
    });
  };

  const aristasConConflictos = calcularConflictos(localGraph.nodos, localGraph.aristas);
  const conflictosTotales = aristasConConflictos.filter(arista => arista.tieneConflicto).length;

  // 🆕 COMPONENTE DEL SELECTOR DE COLORES
  const ColorPicker = () => {
    if (!showColorPicker || selectedNode === null) return null;

    return (
      <div className="color-picker-overlay">
        <div className="color-picker">
          <h4>Seleccionar color para nodo {selectedNode}</h4>
          <div className="color-grid">
            {colorPalette.slice(0, config.colorCount).map((color, index) => (
              <button
                key={index}
                className="color-option"
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                title={`Color ${index + 1}`}
              />
            ))}
          </div>
          <button 
            className="cancel-button"
            onClick={() => {
              setShowColorPicker(false);
              setSelectedNode(null);
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  // Siempre renderizar el SVG, incluso cuando está vacío
  const renderGrafo = () => {
    return (
      <div className="graph-container">
        <svg 
          ref={svgRef}
          width="100%" 
          height="700"
          viewBox="0 0 1000 1000"
          onClick={handleSvgClick}
          style={{ 
            cursor: mode === 'addNode' ? 'crosshair' : 
                    mode === 'connect' ? 'pointer' : 'default',
            border: '2px dashed #bdc3c7',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            minHeight: '300px'
          }}
        >

          {/* Renderizar aristas con conflictos */}
          {aristasConConflictos.map((arista, index) => (
            <line
              key={index}
              x1={localGraph.nodos[arista.source]?.x || 0}
              y1={localGraph.nodos[arista.source]?.y || 0}
              x2={localGraph.nodos[arista.target]?.x || 0}
              y2={localGraph.nodos[arista.target]?.y || 0}
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
              style={{ 
                cursor: (mode === 'connect' || mode === 'view') ? 'pointer' : 'default',
                opacity: selectedNode === nodo.id ? 0.8 : 1
              }}
            >
              <circle
                r="20"
                fill={nodo.color || '#3498db'}
                stroke={selectedNodes.includes(nodo.id) || selectedNode === nodo.id ? "#e74c3c" : "#2c3e50"}
                strokeWidth={selectedNodes.includes(nodo.id) || selectedNode === nodo.id ? 3 : 2}
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
          
          {/* Mensaje cuando no hay nodos */}
          {localGraph.nodos.length === 0 && (
            <text x="300" y="250" textAnchor="middle" fill="#7f8c8d" fontSize="16">
              Haz clic para agregar nodos
            </text>
          )}
        </svg>
        
        {/* 🆕 SELECTOR DE COLORES */}
        <ColorPicker />
        
        {/* Información del modo actual */}
        <div className="mode-info">
          {mode === 'addNode' && (
            <p>🎯 <strong>Modo Agregar Nodos</strong> - Haz clic en el área para agregar nodos</p>
          )}
          {mode === 'connect' && (
            <p>🔗 <strong>Modo Conectar</strong> - Selecciona dos nodos: {selectedNodes.join(', ')}</p>
          )}
          {mode === 'view' && (
            <p>🎨 <strong>Modo Visualización/Recoloración</strong> - Haz clic en un nodo para cambiar su color</p>
          )}
          
          {/* Información del grafo actual */}
          <p>📊 <strong>Grafo actual:</strong> {localGraph.nodos.length} nodos, {localGraph.aristas.length} aristas</p>
          {localGraph.nodos.length > 0 && (
            <p style={{ color: conflictosTotales > 0 ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
              ⚠️ <strong>Conflictos detectados:</strong> {conflictosTotales}
              {conflictosTotales === 0 && ' ✅ Sin conflictos'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="graph-visualizer">
      <h2>Visualización del Grafo</h2>
      
      {renderGrafo()}
      
      {/* Estadísticas de ejecución */}
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

      {/* Métricas de recoloración */}
      {recolorMetrics && (
        <div className="recolor-metrics">
          <h3>Métricas de Recoloración</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Nodo recoloreado:</label>
              <span>{recolorMetrics.nodoRecolorado}</span>
            </div>
            <div className="stat-item">
              <label>Nuevos conflictos:</label>
              <span className={recolorMetrics.nuevosConflictos > 0 ? 'conflict' : 'success'}>
                {recolorMetrics.nuevosConflictos}
              </span>
            </div>
            <div className="stat-item">
              <label>Probabilidad de éxito:</label>
              <span>{recolorMetrics.probabilidadExito}%</span>
            </div>
            <div className="stat-item">
              <label>Nodos por recolorear:</label>
              <span>{recolorMetrics.nodosPorRecolorear}</span>
            </div>
          </div>
          {recolorMetrics.nodosAfectados.length > 0 && (
            <div className="affected-nodes">
              <p><strong>Nodos afectados:</strong> {recolorMetrics.nodosAfectados.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;
