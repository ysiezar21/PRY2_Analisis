import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel/ControlPanel';
import GraphVisualizer from './components/GraphVisualizer/GraphVisualizer';
import './styles/components.css';

function App() {
  const [graphConfig, setGraphConfig] = useState({
    nodeCount: 10,
    colorCount: 3,
    algorithm: 'monteCarlo',
    iterations: 1000,
    autoIncreaseColors: false
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [executionStats, setExecutionStats] = useState(null);

  const handleRunAlgorithm = () => {
    console.log('Ejecutando algoritmo con config:', graphConfig);
    setIsRunning(true);
    
    // Simulación de ejecución - luego conectaremos con tus algoritmos reales
    setTimeout(() => {
      setIsRunning(false);
      setExecutionStats({
        intentos: 150,
        conflictos: 2,
        tiempo: '1.2s',
        exito: true
      });
    }, 2000);
  };

  const handleConfigChange = (newConfig) => {
    setGraphConfig(newConfig);
    // Reset stats cuando cambia la configuración
    setExecutionStats(null);
  };

  return (
    <div className="app">
      <ControlPanel 
        config={graphConfig}
        onConfigChange={handleConfigChange}
        onRunAlgorithm={handleRunAlgorithm}
        isRunning={isRunning}
      />
      
      <div className="main-content">
        <GraphVisualizer 
          graphData={null}
          config={graphConfig}
          stats={executionStats}
        />
      </div>
    </div>
  );
}

export default App;