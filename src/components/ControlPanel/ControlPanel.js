import React from 'react';
import AlgorithmControls from '../AlgorithmControls/AlgorithmControls';
import GraphControls from '../GraphControls/GraphControls';
import { setAumentosFlag, setTiempoEspera } from '../../backend/Algoritmos'; 

const ControlPanel = ({ 
  config, 
  onConfigChange, 
  onRunAlgorithm, 
  isRunning,
  onAddNode,
  onConnectNodes, 
  onGenerateRandom,
  onClearGraph,
  mode,
  onModeChange,
  infoGrafo 
}) => {

  const handleInputChange = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="control-panel">
      <h2>Configuración del Grafo</h2>

      {/* --- INFO DEL GRAFO --- */}
      {infoGrafo && infoGrafo.totalNodos > 2 && (
        <div className="graph-info">
          <h3> Grafo Actual</h3>
          <div className="info-stats">
            <div className="info-item">
              <span>Nodos: </span>
              <strong>{infoGrafo.totalNodos}/{config.nodeCount}</strong>
            </div>
            <div className="info-item">
              <span>Manuales: </span>
              <span>{infoGrafo.nodosManuales}</span>
            </div>
            <div className="info-item">
              <span>Automáticos: </span>
              <span>{infoGrafo.nodosAutomaticos}</span>
            </div>
            <div className="info-item">
              <span>Aristas: </span>
              <span>{infoGrafo.totalAristas}</span>
            </div>
            {infoGrafo.necesitaCompletar && (
              <div className="info-warning">
                 Se agregarán {config.nodeCount - infoGrafo.totalNodos} nodos automáticamente
              </div>
            )}
          </div>
        </div>
      )}

      <div className="config-section">
        <h3>Parámetros del Grafo</h3>

        <div className="input-group">
          <label>Número de Nodos:</label>
          <input 
            type="number" 
            min="3" 
            max="120"
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

        {/* ← NUEVO CAMPO */}
        <div className="input-group">
          <label>Generar aristas aleatorias:</label>
          <input
            type="checkbox"
            checked={config.generarAleatorio}
            onChange={(e) => handleInputChange('generarAleatorio', e.target.checked)}
          />
        </div>

        <div className="input-group">
          <label>Auto-incrementar colores:</label>
          <input
            type="checkbox" 
            checked={config.autoIncreaseColors}
            onChange={(e) => {
              const checked = e.target.checked;
              handleInputChange('autoIncreaseColors', checked);

              setAumentosFlag(checked);
            }}
          />
        </div>

        <div className="input-group">
          <label>Tiempo de espera (ms):</label>
          <input
            type="range"
            min="0"
            max="1000"
            value={config.tiempoEspera ?? 0}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              handleInputChange("tiempoEspera", value);
              setTiempoEspera(value);   
            }}
          />
          <span>{config.tiempoEspera ?? 0} ms</span>
        </div>
      </div>

      <AlgorithmControls 
        config={config}
        onConfigChange={handleInputChange}
        onRunAlgorithm={onRunAlgorithm}
        isRunning={isRunning}
      />

      <GraphControls 
        onAddNode={onAddNode}
        onConnectNodes={onConnectNodes}
        onGenerateRandom={onGenerateRandom}
        onClearGraph={onClearGraph}
        mode={mode}
        onModeChange={onModeChange}
        tieneGrafo={infoGrafo?.totalNodos > 0}
      />
    </div>
  );
};

export default ControlPanel;
