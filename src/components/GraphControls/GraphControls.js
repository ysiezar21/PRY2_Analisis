import React from 'react';

const GraphControls = ({ 
  onAddNode, 
  onConnectNodes, 
  onClearGraph, 
  mode, 
  onModeChange 
}) => {
  
  const handleModeChange = (newMode) => {
    console.log("Cambiando modo a:", newMode);
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      console.error("onModeChange no está definido");
    }
  };

  const handleClearGraph = () => {
    console.log("Limpiando grafo...");
    if (onClearGraph) {
      onClearGraph();
    } else {
      console.error("onClearGraph no está definido");
    }
  };

  return (
    <div className="graph-controls">
      <h3>Controles del Grafo</h3>
      
      <div className="input-group">
        <label>Modo:</label>
        <select value={mode} onChange={(e) => handleModeChange(e.target.value)}>
          <option value="view">Visualización</option>
          <option value="connect">Conectar Nodos</option>
        </select>
      </div>
      
      <div className="button-group">
        {/* SOLO BOTÓN LIMPIAR - ELIMINADO GENERAR ALEATORIO */}
        <button className="control-button" onClick={handleClearGraph}>
          Limpiar Grafo
        </button>
      </div>
      
      <div className="mode-instructions">
        {mode === 'connect' && (
          <p> Selecciona dos nodos para conectarlos</p>
        )}
        {mode === 'view' && (
          <p> Haz clic en un nodo para cambiar su color</p>
        )}
      </div>
    </div>
  );
};

export default GraphControls;
