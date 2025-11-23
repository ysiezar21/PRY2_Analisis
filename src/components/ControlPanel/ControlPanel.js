import React from 'react';
import AlgorithmControls from '../AlgorithmControls/AlgorithmControls';
import GraphControls from '../GraphControls/GraphControls';

const ControlPanel = ({ config, onConfigChange, onRunAlgorithm, isRunning }) => {
  const handleInputChange = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="control-panel">
      <h2>Configuración del Grafo</h2>
      
      <div className="config-section">
        <h3>Parámetros del Grafo</h3>
        
        <div className="input-group">
          <label>Número de Nodos:</label>
          <input 
            type="number" 
            min="1" 
            max="100"
            value={config.nodeCount}
            onChange={(e) => handleInputChange('nodeCount', parseInt(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label>Número de Colores (k):</label>
          <input 
            type="number" 
            min="3" 
            max="20"
            value={config.colorCount}
            onChange={(e) => handleInputChange('colorCount', parseInt(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label>Auto-incrementar colores:</label>
          <input 
            type="checkbox" 
            checked={config.autoIncreaseColors}
            onChange={(e) => handleInputChange('autoIncreaseColors', e.target.checked)}
          />
        </div>
      </div>

      <AlgorithmControls 
        config={config}
        onConfigChange={handleInputChange}
        onRunAlgorithm={onRunAlgorithm}
        isRunning={isRunning}
      />

      <GraphControls />
    </div>
  );
};

export default ControlPanel;