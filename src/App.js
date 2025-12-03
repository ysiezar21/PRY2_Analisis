  import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel/ControlPanel';
import GraphVisualizer from './components/GraphVisualizer/GraphVisualizer';
import ConflictChart from './components/ConflictChart/ConflictChart';
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
  const [graphData, setGraphData] = useState({ nodos: [], aristas: [] });
  const [mode, setMode] = useState('view');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [recolorMetrics, setRecolorMetrics] = useState(null);
  const [conflictHistory, setConflictHistory] = useState([]);

  // 🆕 FUNCIÓN PARA COMPLETAR GRAFO AUTOMÁTICAMENTE
  const completarGrafo = (grafoActual, nodosRequeridos) => {
    if (grafoActual.nodos.length >= nodosRequeridos) {
      return grafoActual; // No necesita completar
    }

    const nuevoGrafo = { ...grafoActual };
    const nodosFaltantes = nodosRequeridos - grafoActual.nodos.length;
    
    // Agregar nodos faltantes
    for (let i = 0; i < nodosFaltantes; i++) {
      const nuevoId = nuevoGrafo.nodos.length;
      nuevoGrafo.nodos.push({
        id: nuevoId,
        x: Math.random() * 500 + 50,
        y: Math.random() * 400 + 50,
        color: '#3498db'
      });
    }

    // 🆕 Conectar nodos nuevos con los existentes (probabilísticamente)
    for (let i = grafoActual.nodos.length; i < nuevoGrafo.nodos.length; i++) {
      for (let j = 0; j < nuevoGrafo.nodos.length; j++) {
        if (i !== j && Math.random() < 0.3) { // 30% de probabilidad de conexión
          const aristaExists = nuevoGrafo.aristas.some(arista => 
            (arista.source === i && arista.target === j) ||
            (arista.source === j && arista.target === i)
          );
          
          if (!aristaExists) {
            nuevoGrafo.aristas.push({
              source: i,
              target: j,
              tieneConflicto: false
            });
          }
        }
      }
    }

    console.log(`✅ Grafo completado: ${nodosFaltantes} nodos agregados automáticamente`);
    return nuevoGrafo;
  };

  // Manejar agregar nodo
  const handleAddNode = (x, y) => {
    const nuevoId = graphData.nodos.length;
    const newGraphData = {
      ...graphData,
      nodos: [...graphData.nodos, { 
        id: nuevoId, 
        x, 
        y, 
        color: '#3498db',
        esManual: true // 🆕 Marcar como nodo manual
      }],
      aristas: [...graphData.aristas]
    };
    
    setGraphData(newGraphData);
    console.log(`➕ Nodo manual agregado: ${nuevoId} (${graphData.nodos.length + 1}/${graphConfig.nodeCount})`);
  };

  // Manejar conectar nodos
  const handleConnectNodes = (nodeId) => {
    if (mode !== 'connect') return;

    const newSelectedNodes = [...selectedNodes, nodeId];
    
    if (newSelectedNodes.length === 2) {
      const [node1, node2] = newSelectedNodes;
      const newArista = { 
        source: node1, 
        target: node2, 
        tieneConflicto: false,
        esManual: true // 🆕 Marcar como arista manual
      };
      
      const newGraphData = {
        ...graphData,
        aristas: [...graphData.aristas, newArista]
      };
      
      setGraphData(newGraphData);
      setSelectedNodes([]);
      console.log(`🔗 Conexión manual: ${node1} ↔ ${node2}`);
    } else {
      setSelectedNodes(newSelectedNodes);
    }
  };

  // 🆕 FUNCIÓN PARA RECOLORAR NODO
  const handleRecolorNode = (nodeId, newColor) => {
    console.log(`Recolorando nodo ${nodeId} a color: ${newColor}`);
    
    if (graphData && graphData.nodos[nodeId]) {
      const updatedGraph = {
        ...graphData,
        nodos: graphData.nodos.map((nodo, index) => 
          index === nodeId ? { ...nodo, color: newColor } : nodo
        )
      };
      
      setGraphData(updatedGraph);
      calcularMetricasRecoloracion(nodeId, newColor, updatedGraph);
    }
  };

  // 🆕 FUNCIÓN PARA CALCULAR MÉTRICAS DE RECOLORACIÓN
  const calcularMetricasRecoloracion = (nodeId, newColor, updatedGraph) => {
    const nodoRecolorado = updatedGraph.nodos[nodeId];
    let nuevosConflictos = 0;
    let nodosAfectados = new Set();
    
    updatedGraph.aristas.forEach(arista => {
      if (arista.source === nodeId || arista.target === nodeId) {
        const otroNodoId = arista.source === nodeId ? arista.target : arista.source;
        const otroNodo = updatedGraph.nodos[otroNodoId];
        
        if (otroNodo && otroNodo.color === newColor) {
          nuevosConflictos++;
          nodosAfectados.add(otroNodoId);
        }
      }
    });
    
    const probabilidadExito = calcularProbabilidadExito(updatedGraph);
    
    const metricas = {
      nodoRecolorado: nodeId,
      colorNuevo: newColor,
      nuevosConflictos: nuevosConflictos,
      nodosAfectados: Array.from(nodosAfectados),
      probabilidadExito: probabilidadExito,
      nodosPorRecolorear: nuevosConflictos
    };
    
    setRecolorMetrics(metricas);
  };

  // 🆕 FUNCIÓN TEMPORAL PARA CALCULAR PROBABILIDAD DE ÉXITO
  const calcularProbabilidadExito = (grafo) => {
    const totalAristas = grafo.aristas.length;
    const conflictos = grafo.aristas.filter(arista => {
      const nodoOrigen = grafo.nodos[arista.source];
      const nodoDestino = grafo.nodos[arista.target];
      return nodoOrigen && nodoDestino && nodoOrigen.color === nodoDestino.color;
    }).length;
    
    if (totalAristas === 0) return 100;
    return Math.max(0, 100 - (conflictos / totalAristas) * 100).toFixed(1);
  };

  // 🆕 ACTUALIZADA: Generar grafo aleatorio O usar el actual
  const handleGenerateRandom = () => {
    let randomGraph;
    
    if (graphData.nodos.length > 0) {
      // 🆕 Completar el grafo actual
      randomGraph = completarGrafo(graphData, graphConfig.nodeCount);
      console.log("🔄 Grafo actual completado automáticamente");
    } else {
      // Generar grafo completamente nuevo
      randomGraph = {
        nodos: Array.from({ length: graphConfig.nodeCount }, (_, i) => ({
          id: i,
          x: Math.random() * 500 + 50,
          y: Math.random() * 400 + 50,
          color: '#3498db'
        })),
        aristas: []
      };
      
      // Agregar aristas aleatorias
      for (let i = 0; i < graphConfig.nodeCount * 1.5; i++) {
        const source = Math.floor(Math.random() * graphConfig.nodeCount);
        let target = Math.floor(Math.random() * graphConfig.nodeCount);
        
        while (target === source) {
          target = Math.floor(Math.random() * graphConfig.nodeCount);
        }
        
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
      console.log("🎲 Nuevo grafo aleatorio generado");
    }
    
    setGraphData(randomGraph);
    setSelectedNodes([]);
    setMode('view');
    setRecolorMetrics(null);
    setConflictHistory([]);
  };

  // Limpiar grafo
  const handleClearGraph = () => {
    setGraphData({
      nodos: [],
      aristas: []
    });
    setSelectedNodes([]);
    setMode('view');
    setExecutionStats(null);
    setRecolorMetrics(null);
    setConflictHistory([]);
    console.log("🗑️ Grafo limpiado completamente");
  };

  // 🆕 ACTUALIZADA: Preparar grafo para algoritmo
  const prepararGrafoParaAlgoritmo = () => {
    if (graphData.nodos.length === 0) {
      // Si no hay grafo, generar uno automáticamente
      handleGenerateRandom();
      return graphData; // Retornará el nuevo grafo en el siguiente render
    }
    
    // 🆕 Completar el grafo actual si es necesario
    if (graphData.nodos.length < graphConfig.nodeCount) {
      const grafoCompletado = completarGrafo(graphData, graphConfig.nodeCount);
      setGraphData(grafoCompletado);
      return grafoCompletado;
    }
    
    return graphData;
  };

  // 🆕 ACTUALIZADA: Manejar ejecución de algoritmo
  const handleRunAlgorithm = async () => {
    setIsRunning(true);
    setExecutionStats(null);
    setRecolorMetrics(null);
    setConflictHistory([]);

    try {
      // 🆕 Preparar el grafo (usar actual o generar)
      const grafoParaAlgoritmo = prepararGrafoParaAlgoritmo();
      
      const resultado = await algorithmService.ejecutarAlgoritmo(
        {
          ...graphConfig,
          grafoExistente: grafoParaAlgoritmo // 🆕 Pasar el grafo actual
        },
        (graphData, conflictData) => {
          setGraphData(graphData);
          if (conflictData) {
            setConflictHistory(prev => [...prev, conflictData]);
          }
        }
      );

      setExecutionStats({
        intentos: resultado.intentos,
        conflictos: resultado.conflictos,
        tiempo: `${resultado.tiempo}ms`,
        exito: resultado.exito,
        coloresAumentados: resultado.coloresAumentados || 0,
        error: resultado.error,
        historialConflictos: resultado.historialConflictos || []
      });

      console.log(`✅ Algoritmo ejecutado sobre grafo con ${grafoParaAlgoritmo.nodos.length} nodos`);

    } catch (error) {
      console.error('Error:', error);
      setExecutionStats({
        error: 'Error ejecutando el algoritmo',
        exito: false,
        historialConflictos: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleConfigChange = (newConfig) => {
    setGraphConfig(newConfig);
    setExecutionStats(null);
    // 🆕 NO limpiar el grafo aquí, mantener el trabajo del usuario
    setSelectedNodes([]);
    setRecolorMetrics(null);
    setConflictHistory([]);
  };

  // 🆕 INFORMACIÓN DEL GRAFO ACTUAL
  const infoGrafoActual = () => {
    const nodosManuales = graphData.nodos.filter(n => n.esManual).length;
    const aristasManuales = graphData.aristas.filter(a => a.esManual).length;
    
    return {
      totalNodos: graphData.nodos.length,
      nodosManuales,
      nodosAutomaticos: graphData.nodos.length - nodosManuales,
      totalAristas: graphData.aristas.length,
      aristasManuales,
      necesitaCompletar: graphData.nodos.length < graphConfig.nodeCount
    };
  };

  const info = infoGrafoActual();

  return (
    <div className="app">
      <ControlPanel 
        config={graphConfig}
        onConfigChange={handleConfigChange}
        onRunAlgorithm={handleRunAlgorithm}
        isRunning={isRunning}
        onAddNode={handleAddNode}
        onConnectNodes={handleConnectNodes}
        onGenerateRandom={handleGenerateRandom}
        onClearGraph={handleClearGraph}
        mode={mode}
        onModeChange={setMode}
        infoGrafo={info} // 🆕 Pasar información del grafo
      />
      
      <div className="main-content">
        <GraphVisualizer 
          graphData={graphData}
          config={graphConfig}
          stats={executionStats}
          onAddNode={handleAddNode}
          onConnectNodes={handleConnectNodes}
          onRecolorNode={handleRecolorNode}
          mode={mode}
          selectedNodes={selectedNodes}
          recolorMetrics={recolorMetrics}
          infoGrafo={info} // 🆕 Pasar información del grafo
        />
        
        <ConflictChart 
          historialConflictos={conflictHistory.length > 0 ? conflictHistory : (executionStats?.historialConflictos || [])}
          algoritmo={graphConfig.algorithm}
        />
      </div>
    </div>
  );
}

export default App;
