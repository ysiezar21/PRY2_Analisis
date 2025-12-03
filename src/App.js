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
    generarAleatorio: true,
    tiempoEspera: 1
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [executionStats, setExecutionStats] = useState(null);
  const [graphData, setGraphData] = useState({ nodos: [], aristas: [] });
  const [mode, setMode] = useState('view');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [recolorMetrics, setRecolorMetrics] = useState(null);
  const [conflictHistory, setConflictHistory] = useState([]);

  // FUNCIÓN PARA DISTRIBUCIÓN CIRCULAR
  const distribuirNodosCircularmente = (nodos) => {
    const total = nodos.length;
    const centerX = 600;
    const centerY = 600;
    const radius = 550;

    return nodos.map((nodo, index) => {
      const angle = (2 * Math.PI * index) / total;
      return {
        ...nodo,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  };

  // 🆕 FUNCIÓN PARA VALIDAR INPUTS NUMÉRICOS
  const validarInputsAntesDeEjecutar = () => {
    const errores = [];
    
    // Validar nodos
    if (graphConfig.nodeCount < 3) {
      errores.push("El número mínimo de nodos es 3");
    } else if (graphConfig.nodeCount > 120) {
      errores.push("El número máximo de nodos es 120");
    }
    
    // Validar colores
    if (graphConfig.colorCount < 3) {
      errores.push("El número mínimo de colores (k) es 3");
    } else if (graphConfig.colorCount > 20) {
      errores.push("El número máximo de colores (k) es 20");
    }
    
    return {
      valido: errores.length === 0,
      errores,
      mensaje: errores.length > 0 ? errores.join('\n') : ''
    };
  };

  // 🆕 FUNCIÓN PARA VALIDAR QUE TODOS LOS NODOS TIENEN AL MENOS UNA CONEXIÓN
  const validarConexionesGrafo = (grafoData) => {
    // Crear un mapa de conexiones por nodo
    const conexionesPorNodo = {};
    
    // Inicializar contadores
    grafoData.nodos.forEach(nodo => {
      conexionesPorNodo[nodo.id] = 0;
    });
    
    // Contar conexiones
    grafoData.aristas.forEach(arista => {
      conexionesPorNodo[arista.source] = (conexionesPorNodo[arista.source] || 0) + 1;
      conexionesPorNodo[arista.target] = (conexionesPorNodo[arista.target] || 0) + 1;
    });
    
    // Encontrar nodos sin conexiones
    const nodosSinConexion = Object.entries(conexionesPorNodo)
      .filter(([id, count]) => count === 0)
      .map(([id]) => parseInt(id));
    
    return {
      valido: nodosSinConexion.length === 0,
      nodosSinConexion,
      mensaje: nodosSinConexion.length > 0 
        ? `Los siguientes nodos no tienen conexiones: ${nodosSinConexion.join(', ')}`
        : 'Todos los nodos están conectados'
    };
  };

  // 1. FUNCIÓN PARA GENERAR GRAFO SIN COLORES (PARA ALGORITMO) CON DISTRIBUCIÓN CIRCULAR
  const handleGenerateGraphForAlgorithm = () => {
    // Validación de nodos
    if (graphConfig.nodeCount < 3 || graphConfig.nodeCount > 120) {
      alert(`❌ Error: El número de nodos debe estar entre 3 y 120 para grafos aleatorios`);
      return;
    }
    
    // Validación de colores
    if (graphConfig.colorCount < 3 || graphConfig.colorCount > 20) {
      alert(`❌ Error: El número de colores (k) debe estar entre 3 y 20`);
      return;
    }

    const total = graphConfig.nodeCount;
    
    // Crear nodos iniciales sin posición
    const nodosIniciales = Array.from({ length: total }, (_, i) => ({
      id: i,
      x: 0, // Temporal, se calculará después
      y: 0, // Temporal, se calculará después
      color: null, // 🆕 IMPORTANTE: Sin color inicial
      esManual: false
    }));

    // 🆕 Aplicar distribución circular
    const nodos = distribuirNodosCircularmente(nodosIniciales);

    let aristas = [];

    // Si está seleccionada la opción aleatoria, generar aristas
    if (graphConfig.generarAleatorio) {
      const posiblesAristas = [];

      for (let i = 0; i < total; i++) {
        for (let j = i + 1; j < total; j++) {
          if (Math.random() < 0.3) {
            posiblesAristas.push({ 
              source: i, 
              target: j, 
              tieneConflicto: false,
              esManual: false 
            });
          }
        }
      }

      aristas = posiblesAristas;
    }

    const nuevoGrafo = { nodos, aristas };
    setGraphData(nuevoGrafo);
    setExecutionStats(null);
    setRecolorMetrics(null);
    setConflictHistory([]);
    setSelectedNodes([]);
    setMode('view');
    
    console.log(`✅ Grafo para algoritmo generado: ${total} nodos (distribución circular), ${aristas.length} aristas, SIN colores iniciales`);
    return nuevoGrafo;
  };

  // 🆕 2. FUNCIÓN PARA AGREGAR NODO MANUAL CON DISTRIBUCIÓN CIRCULAR
  const handleAddManualNode = () => {
    if (graphData.nodos.length >= 60) {
      alert("❌ Límite máximo de 60 nodos para grafos manuales alcanzado");
      return;
    }

    const nuevoId = graphData.nodos.length;
    
    // 🆕 AGREGAR NODO SIN POSICIÓN INICIAL
    const nuevoNodo = { 
      id: nuevoId, 
      x: 0, // Temporal, se calculará después
      y: 0, // Temporal, se calculará después
      color: null,
      esManual: true
    };
    
    // 🆕 CREAR NUEVA LISTA DE NODOS Y APLICAR DISTRIBUCIÓN CIRCULAR
    const nuevosNodos = [...graphData.nodos, nuevoNodo];
    const nodosConPosicion = distribuirNodosCircularmente(nuevosNodos);
    
    const newGraphData = {
      ...graphData,
      nodos: nodosConPosicion,
      aristas: [...graphData.aristas]
    };
    
    setGraphData(newGraphData);
    console.log(`➕ Nodo manual agregado: ${nuevoId} con distribución circular`);
    return newGraphData;
  };

  // Manejar agregar nodo con clic (MÁXIMO 60 NODOS)
  const handleAddNode = (x, y) => {
    if (graphData.nodos.length >= 60) {
      alert("❌ Límite máximo de 60 nodos para grafos manuales alcanzado");
      return;
    }

    const nuevoId = graphData.nodos.length;
    
    // 🆕 AGREGAR NODO SIN POSICIÓN INICIAL
    const nuevoNodo = { 
      id: nuevoId, 
      x: 0, // Temporal, se calculará después
      y: 0, // Temporal, se calculará después
      color: null,
      esManual: true
    };
    
    // 🆕 CREAR NUEVA LISTA DE NODOS Y APLICAR DISTRIBUCIÓN CIRCULAR
    const nuevosNodos = [...graphData.nodos, nuevoNodo];
    const nodosConPosicion = distribuirNodosCircularmente(nuevosNodos);
    
    const newGraphData = {
      ...graphData,
      nodos: nodosConPosicion,
      aristas: [...graphData.aristas]
    };
    
    setGraphData(newGraphData);
    console.log(`➕ Nodo manual (clic) agregado: ${nuevoId} con distribución circular`);
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
        esManual: true
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

  //  GENERAR GRAFO ALEATORIO CON DISTRIBUCIÓN CIRCULAR Y COLOR AZUL INICIAL
  const handleGenerateRandom = () => {
    const total = graphConfig.nodeCount;
    
    // Validación
    if (total < 3 || total > 120) {
      alert("❌ Nodos: 3-120 (aleatorio)");
      return;
    }

    // Crear nodos iniciales sin posición
    const nodosIniciales = Array.from({ length: total }, (_, i) => ({
      id: i,
      x: 0, // Temporal
      y: 0, // Temporal
      color: null, 
      esManual: false
    }));

    // 🆕 Aplicar distribución circular
    const nodos = distribuirNodosCircularmente(nodosIniciales);
    
    const randomGraph = {
      nodos: nodos,
      aristas: []
    };
    
    // Agregar aristas aleatorias (solo si está marcada la opción)
    if (graphConfig.generarAleatorio) {
      for (let i = 0; i < total * 1.5; i++) {
        const source = Math.floor(Math.random() * total);
        let target = Math.floor(Math.random() * total);
        
        while (target === source) {
          target = Math.floor(Math.random() * total);
        }
        
        const aristaExists = randomGraph.aristas.some(arista => 
          (arista.source === source && arista.target === target) ||
          (arista.source === target && arista.target === source)
        );
        
        if (!aristaExists) {
          randomGraph.aristas.push({ 
            source, 
            target, 
            tieneConflicto: false,
            esManual: false
          });
        }
      }
    }
    
    setGraphData(randomGraph);
    setSelectedNodes([]);
    setMode('view');
    setExecutionStats(null);
    setRecolorMetrics(null);
    setConflictHistory([]);
    console.log("🎲 Grafo aleatorio generado (con distribución circular)");
  };

  // 🆕 3. FUNCIÓN PARA EJECUTAR ALGORITMO CON VALIDACIONES COMPLETAS
  const handleRunAlgorithm = async () => {
    // Validación 1: Grafo existe
    if (graphData.nodos.length === 0) {
      alert("❌ No hay grafo para ejecutar el algoritmo. Genera un grafo primero.");
      return;
    }

    // Validación 2: Inputs numéricos
    const validacionInputs = validarInputsAntesDeEjecutar();
    if (!validacionInputs.valido) {
      alert(`❌ Configuración incorrecta:\n\n${validacionInputs.mensaje}`);
      return;
    }

    // Validación 3: Conexiones de nodos
    const validacionConexiones = validarConexionesGrafo(graphData);
    if (!validacionConexiones.valido) {
      alert(`❌ Grafo no válido:\n\n${validacionConexiones.mensaje}\n\nConecta todos los nodos antes de ejecutar el algoritmo.`);
      return;
    }

    // Si pasa todas las validaciones, ejecutar
    setIsRunning(true);
    setExecutionStats(null);
    setRecolorMetrics(null);
    setConflictHistory([]);

    try {
      console.log(`✅ Ejecutando ${graphConfig.algorithm === 'monteCarlo' ? 'Monte Carlo' : 'Las Vegas'} con ${graphData.nodos.length} nodos`);
      
      const resultado = await algorithmService.ejecutarAlgoritmo(
        {
          ...graphConfig,
          grafoExistente: graphData
        },
        (updatedGraphData, conflictData) => {
          if (updatedGraphData) {
            setGraphData(prev => ({ 
              ...prev, 
              nodos: updatedGraphData.nodos 
            }));
          }
          if (conflictData) {
            setConflictHistory(prev => [...prev, conflictData]);
          }
        }
      );

      const porcentajeExito = calcularPorcentajeExito(resultado);
      
      setExecutionStats({
        intentos: resultado.intentos,
        conflictos: resultado.conflictos,
        tiempo: `${resultado.tiempo}ms`,
        exito: resultado.exito,
        coloresAumentados: resultado.coloresAumentados || 0,
        error: resultado.error,
        historialConflictos: resultado.historialConflictos || [],
        porcentajeExito: porcentajeExito 
      });

      console.log(`✅ Algoritmo completado. Porcentaje de éxito: ${porcentajeExito}%`);

    } catch (error) {
      console.error('Error:', error);
      setExecutionStats({
        error: 'Error ejecutando el algoritmo',
        exito: false,
        porcentajeExito: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  // FUNCIÓN PARA CALCULAR PORCENTAJE DE ÉXITO
  const calcularPorcentajeExito = (resultado) => {
    if (resultado.error) return 0;
    
    if (graphConfig.algorithm === 'monteCarlo') {
      // Para Monte Carlo: éxito si encontró solución con 0 conflictos
      return resultado.exito ? 100 : 0;
    } else {
      // Para Las Vegas: porcentaje basado en intentos vs éxito
      if (resultado.exito && resultado.intentos !== 'N/A') {
        const intentos = parseInt(resultado.intentos) || 1000;
        // Mientras menos intentos, mayor porcentaje
        return Math.max(10, Math.min(100, Math.round((1000 / intentos) * 100)));
      }
      return resultado.exito ? 100 : 0;
    }
  };

  // FUNCIÓN PARA RECOLORAR NODO 
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

  // FUNCIÓN PARA CALCULAR MÉTRICAS DE RECOLORACIÓN 
  const calcularMetricasRecoloracion = (nodeId, newColor, updatedGraph) => {
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

  // FUNCIÓN PARA CALCULAR PROBABILIDAD DE ÉXITO 
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

  // LIMPIAR GRAFO 
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
    console.log("Grafo limpiado completamente");
  };

  // MANEJAR CAMBIO DE CONFIGURACIÓN CON VALIDACIONES MEJORADAS
  const handleConfigChange = (newConfig) => {
    // 🆕 VALIDACIÓN MEJORADA - NO CAMBIAR INMEDIATAMENTE
    // Los valores se mantienen como los escribe el usuario
    // La validación final se hace al ejecutar el algoritmo
    setGraphConfig(newConfig);
    setExecutionStats(null);
    setSelectedNodes([]);
    setRecolorMetrics(null);
    setConflictHistory([]);
  };

  // INFORMACIÓN DEL GRAFO ACTUAL
  const infoGrafoActual = () => {
    const nodosManuales = graphData.nodos.filter(n => n.esManual).length;
    const aristasManuales = graphData.aristas.filter(a => a.esManual).length;
    const tieneColores = graphData.nodos.some(n => n.color !== null);
    const nodosSinColor = graphData.nodos.filter(n => n.color === null).length;
    
    return {
      totalNodos: graphData.nodos.length,
      nodosManuales,
      nodosAutomaticos: graphData.nodos.length - nodosManuales,
      nodosSinColor,
      totalAristas: graphData.aristas.length,
      aristasManuales,
      tieneColores,
      esValidoParaAlgoritmo: graphData.nodos.length > 0,
      maximoManual: 60,
      maximoAleatorio: 120
    };
  };

  const info = infoGrafoActual();

  return (
    <div className="app">
      <ControlPanel 
        config={graphConfig}
        onConfigChange={handleConfigChange}
        onRunAlgorithm={handleRunAlgorithm}
        onGenerateGraph={handleGenerateGraphForAlgorithm} 
        onAddManualNode={handleAddManualNode} 
        isRunning={isRunning}
        onAddNode={handleAddNode}
        onConnectNodes={handleConnectNodes}
        onGenerateRandom={handleGenerateRandom}
        onClearGraph={handleClearGraph}
        mode={mode}
        onModeChange={setMode}
        infoGrafo={info}
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
          infoGrafo={info}
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
