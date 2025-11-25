import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel/ControlPanel';
import GraphVisualizer from './components/GraphVisualizer/GraphVisualizer';
import algorithmService from './services/algorithmService';
import './styles/components.css';

function App() {
  const [graphConfig, setGraphConfig] = useState({
    nodeCount: 10,
    colorCount: 3,
    algorithm: 'monteCarlo',
    iterations: 1000,
    autoIncreaseColors: false,
    generarAleatorio: true
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [executionStats, setExecutionStats] = useState(null);
  const [graphData, setGraphData] = useState(null);

  const handleRunAlgorithm = async () => {
    setIsRunning(true);
    setExecutionStats(null);
    
    try {
      const resultado = await algorithmService.ejecutarAlgoritmo(graphConfig);
      
      setExecutionStats({
        intentos: resultado.intentos,
        conflictos: resultado.conflictos,
        tiempo: `${resultado.tiempo}ms`,
        exito: resultado.exito,
        coloresAumentados: resultado.coloresAumentados || 0,
        error: resultado.error
      });
      
      setGraphData(resultado.grafoVisual);
      
      console.log('Resultado del algoritmo:', resultado);
      
    } catch (error) {
      console.error('Error:', error);
      setExecutionStats({
        error: 'Error ejecutando el algoritmo',
        exito: false
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleConfigChange = (newConfig) => {
    setGraphConfig(newConfig);
    setExecutionStats(null);
    setGraphData(null);
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
          graphData={graphData}
          config={graphConfig}
          stats={executionStats}
        />
      </div>
    </div>
  );
}

export default App;
