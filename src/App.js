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
  const [mode, setMode] = useState('view'); // 'view', 'addNode', 'connect'
  const [selectedNodes, setSelectedNodes] = useState([]);

  // Manejar agregar nodo
  const handleAddNode = (x, y) => {
    const newNodeId = graphData ? graphData.nodos.length : 0;
    const newGraphData = graphData 
      ? {
          ...graphData,
          nodos: [...graphData.nodos, { id: newNodeId, x, y, color: '#3498db' }],
          aristas: [...graphData.aristas]
        }
      : {
          nodos: [{ id: newNodeId, x, y, color: '#3498db' }],
          aristas: []
        };
    
    setGraphData(newGraphData);
  };

  // Manejar conectar nodos
  const handleConnectNodes = (nodeId) => {
    if (mode !== 'connect') return;

    const newSelectedNodes = [...selectedNodes, nodeId];
    
    if (newSelectedNodes.length === 2) {
      // Conectar los dos nodos seleccionados
      const [node1, node2] = newSelectedNodes;
      const newArista = { source: node1, target: node2, tieneConflicto: false };
      
      const newGraphData = {
        ...graphData,
        aristas: [...graphData.aristas, newArista]
      };
      
      setGraphData(newGraphData);
      setSelectedNodes([]);
    } else {
      setSelectedNodes(newSelectedNodes);
    }
  };

  // Generar grafo aleatorio
  const handleGenerateRandom = () => {
    console.log("Generando grafo aleatorio...");
    
    const randomGraph = {
      nodos: Array.from({ length: graphConfig.nodeCount }, (_, i) => ({
        id: i,
        x: Math.random() * 500 + 50,
        y: Math.random() * 400 + 50,
        color: '#3498db'
      })),
      aristas: []
    };
    
    // Agregar aristas aleatorias (conexiones)
    for (let i = 0; i < graphConfig.nodeCount * 1.5; i++) {
      const source = Math.floor(Math.random() * graphConfig.nodeCount);
      let target = Math.floor(Math.random() * graphConfig.nodeCount);
      
      // Asegurar que no sea el mismo nodo y que la conexión no exista
      while (target === source) {
        target = Math.floor(Math.random() * graphConfig.nodeCount);
      }
      
      // Verificar si la arista ya existe
      const aristaExists = randomGraph.aristas.some(arista => 
        (arista.source === source && arista.target === target) ||
        (arista.source === target && arista.target === source)
      );
      
      if (!aristaExists) {
        randomGraph.aristas.push({ 
          source, 
          target, 
          tieneConflicto: false 
        });
      }
    }
    
    setGraphData(randomGraph);
    setSelectedNodes([]);
    setMode('view'); // Cambiar a modo visualización
    console.log("Grafo aleatorio generado:", randomGraph);
  };

  // Limpiar grafo
  const handleClearGraph = () => {
    console.log("Limpiando grafo...");
    setGraphData(null);
    setSelectedNodes([]);
    setMode('view');
  };

  const handleRunAlgorithm = async () => {
    setIsRunning(true);
    setExecutionStats(null);

    try {
      const resultado = await algorithmService.ejecutarAlgoritmo(
        graphConfig,
        setGraphData
      );

      setExecutionStats({
        intentos: resultado.intentos,
        conflictos: resultado.conflictos,
        tiempo: `${resultado.tiempo}ms`,
        exito: resultado.exito,
        coloresAumentados: resultado.coloresAumentados || 0,
        error: resultado.error
      });

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
    setSelectedNodes([]);
  };

  return (
  <div className="app">
    <ControlPanel 
      config={graphConfig}
      onConfigChange={handleConfigChange}
      onRunAlgorithm={handleRunAlgorithm}
      isRunning={isRunning}
      // Agregar estas props:
      onAddNode={handleAddNode}
      onConnectNodes={handleConnectNodes}
      onGenerateRandom={handleGenerateRandom}
      onClearGraph={handleClearGraph}
      mode={mode}
      onModeChange={setMode}
    />
    
    <div className="main-content">
      <GraphVisualizer 
        graphData={graphData}
        config={graphConfig}
        stats={executionStats}
        onAddNode={handleAddNode}
        onConnectNodes={handleConnectNodes}
        mode={mode}
        selectedNodes={selectedNodes}
      />
    </div>
  </div>
);
}

export default App;
