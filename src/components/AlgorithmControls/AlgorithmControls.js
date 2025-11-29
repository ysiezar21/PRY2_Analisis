import React from 'react';

const AlgorithmControls = ({ config, onConfigChange, onRunAlgorithm, isRunning }) => {
  return (
    <div className="algorithm-controls">
      <h3>Configuración del Algoritmo</h3>
      
      <div className="input-group">
        <label>Algoritmo:</label>
        <select 
          value={config.algorithm}
          onChange={(e) => onConfigChange('algorithm', e.target.value)}
        >
          <option value="monteCarlo">Monte Carlo</option>
          <option value="lasVegas">Las Vegas</option>
        </select>
      </div>

      {config.algorithm === 'monteCarlo' && (
        <div className="input-group">
          <label>Iteraciones:</label>
          <input 
            type="number" 
            min="100" 
            max="10000"
            value={config.iterations}
            onChange={(e) => onConfigChange('iterations', parseInt(e.target.value))}
          />
        </div>
      )}

      <button 
        className="run-button"
        onClick={onRunAlgorithm}
        disabled={isRunning}
      >
        {isRunning ? 'Ejecutando...' : 'Ejecutar Algoritmo'}
      </button>
    </div>
  );
};

export default AlgorithmControls;
