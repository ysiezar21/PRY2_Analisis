import React from 'react';
import AlgorithmControls from '../AlgorithmControls/AlgorithmControls';
import GraphControls from '../GraphControls/GraphControls';
import { setAumentosFlag, setTiempoEspera } from '../../backend/Algoritmos'; 

const ControlPanel = ({ 
  config, 
  onConfigChange, 
  onRunAlgorithm,
  onGenerateGraph,
  onAddManualNode,
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
    // VALIDACIÓN MEJORADA - NO CAMBIAR INMEDIATAMENTE
    let valorValidado = value;
    
    if (field === 'nodeCount') {
      // Solo validar límites extremos, permitir escribir
      if (value < 1) valorValidado = 1;
      else if (value > 120) valorValidado = 120;
      else valorValidado = value;
    }
    
    if (field === 'colorCount') {
      // Permitir escribir cualquier número, validar al ejecutar
      if (value < 1) valorValidado = 1;
      else if (value > 20) valorValidado = 20;
      else valorValidado = value;
    }
    
    onConfigChange({
      ...config,
      [field]: valorValidado
    });
  };

  return (
    <div className="control-panel">
      <h2>Configuración del Grafo</h2>

      {/* --- INFO DEL GRAFO --- */}
      {infoGrafo && infoGrafo.totalNodos > 0 && (
        <div className="graph-info">
          <h3>📊 Grafo Actual</h3>
          <div className="info-stats">
            <div className="info-item">
              <span>Nodos totales: </span>
              <strong>{infoGrafo.totalNodos}</strong>
            </div>
            <div className="info-item">
              <span>Manuales: </span>
              <span>{infoGrafo.nodosManuales}</span>
            </div>
            <div className="info-item">
              <span>Sin color: </span>
              <span style={{ color: infoGrafo.nodosSinColor > 0 ? '#e74c3c' : '#27ae60' }}>
                {infoGrafo.nodosSinColor}
              </span>
            </div>
            <div className="info-item">
              <span>Aristas: </span>
              <span>{infoGrafo.totalAristas}</span>
            </div>
            {infoGrafo.totalNodos > infoGrafo.maximoManual && (
              <div className="info-warning">
                ⚠️ Límite manual: {infoGrafo.maximoManual} nodos
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
            min="1"  // Cambiado de 3 a 1 para permitir escribir
            max="120"
            value={config.nodeCount}
            onChange={(e) => handleInputChange('nodeCount', parseInt(e.target.value))}
            onBlur={(e) => {
              // Validar solo cuando se pierde el foco
              const valor = parseInt(e.target.value);
              if (valor < 3) handleInputChange('nodeCount', 3);
              if (valor > 120) handleInputChange('nodeCount', 120);
            }}
          />
          <small style={{ color: '#bdc3c7', fontSize: '12px' }}>
            Escribe un número (3-120) y presiona Tab o haz clic fuera
          </small>
        </div>

        <div className="input-group">
          <label>Número de Colores (k):</label>
          <input 
            type="number" 
            min="1"  // Cambiado de 3 a 1 para permitir escribir
            max="20"
            value={config.colorCount}
            onChange={(e) => handleInputChange('colorCount', parseInt(e.target.value))}
            onBlur={(e) => {
              // Validar solo cuando se pierde el foco
              const valor = parseInt(e.target.value);
              if (valor < 3) handleInputChange('colorCount', 3);
              if (valor > 20) handleInputChange('colorCount', 20);
            }}
          />
          <small style={{ color: '#bdc3c7', fontSize: '12px' }}>
            Escribe un número (3-20) y presiona Tab o haz clic fuera
          </small>
        </div>

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
            value={config.tiempoEspera ?? 1}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              handleInputChange("tiempoEspera", value);
              setTiempoEspera(value);   
            }}
          />
          <span>{config.tiempoEspera ?? 1} ms</span>
        </div>
      </div>

      {/* 🆕 BOTONES DE ACCIÓN PRINCIPAL */}
      <div className="action-buttons">
        <h3>Acciones Principales</h3>
        
        <div className="button-group">
          <button 
            className="control-button primary"
            onClick={onGenerateGraph}
            disabled={isRunning}
          >
            🎲 Generar Grafo (para algoritmo)
          </button>
          
          <button 
            className="control-button secondary"
            onClick={onAddManualNode}
            disabled={isRunning || (infoGrafo?.totalNodos >= infoGrafo?.maximoManual)}
            title={infoGrafo?.totalNodos >= infoGrafo?.maximoManual ? "Límite de 60 nodos manuales alcanzado" : ""}
          >
            ➕ Agregar Nodo Manual
          </button>
        </div>
        
        <p style={{ fontSize: '12px', color: '#bdc3c7', marginTop: '8px' }}>
          <strong>"Generar Grafo":</strong> Crea grafo SIN colores iniciales (ideal para algoritmos)<br/>
          <strong>"Agregar Nodo Manual":</strong> Añade nodos hasta el límite de 60 (distribución circular)
        </p>
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
