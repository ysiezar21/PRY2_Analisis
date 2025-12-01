import { grafo } from '../backend/grafo.js';
import { monteCarlo, lasVegas } from '../backend/Algoritmos.js';

class AlgorithmService {
  
  crearGrafo(config) {
    const nuevoGrafo = new grafo();
    
    if (config.generarAleatorio) {
      nuevoGrafo.crearGrafo(config.nodeCount);
    } else {
      for (let i = 0; i < config.nodeCount; i++) {
        nuevoGrafo.agregarNodo();
      }
    }
    
    return nuevoGrafo;
  }

  async ejecutarMonteCarlo(grafo, colorCount, iterations, onFrame) {
    const startTime = performance.now();
    const resultado = monteCarlo(grafo, colorCount, iterations);
    
    // 🆕 Reproducir frames con historial de conflictos
    for (let i = 0; i < resultado.frames.length; i++) {
      onFrame(
        this.convertirGrafoParaVisualizacionFrame(resultado.frames[i]),
        resultado.historialConflictos && resultado.historialConflictos[i] // 🆕 Pasar datos de conflicto
      );
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);

    return {
      grafo: resultado.grafo,
      tiempo: executionTime,
      intentos: resultado.grafo.intentos || iterations,
      conflictos: resultado.grafo.numeroConflictos || 0,
      exito: resultado.grafo.numeroConflictos === 0,
      coloresAumentados: resultado.grafo.cantidadColoresAumentados || 0,
      historialConflictos: resultado.historialConflictos || [] // 🆕 Nuevo: retornar historial
    };
  }

  async ejecutarLasVegas(grafo, colorCount, onFrame) {
    const startTime = performance.now();
    const resultado = lasVegas(grafo, colorCount);
    
    if (!resultado) {
      return {
        grafo,
        tiempo: '0',
        intentos: 'No encontrado',
        conflictos: 'N/A',
        exito: false,
        error: 'No se pudo encontrar solución',
        historialConflictos: [] // 🆕 Nuevo: historial vacío
      };
    }

    // 🆕 Reproducir frames con historial de conflictos
    for (let i = 0; i < resultado.frames.length; i++) {
      onFrame(
        this.convertirGrafoParaVisualizacionFrame(resultado.frames[i]),
        resultado.historialConflictos && resultado.historialConflictos[i] // 🆕 Pasar datos de conflicto
      );
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);

    return {
      grafo: resultado.grafo,
      tiempo: executionTime,
      intentos: resultado.grafo.intentos || 'N/A',
      conflictos: resultado.grafo.numeroConflictos || 0,
      exito: resultado.grafo.numeroConflictos === 0,
      coloresAumentados: resultado.grafo.cantidadColoresAumentados || 0,
      historialConflictos: resultado.historialConflictos || [] // 🆕 Nuevo: retornar historial
    };
  }

  async ejecutarAlgoritmo(config, onFrame) {
    try {
      const grafoObj = this.crearGrafo(config);
      let resultado;
      
      if (config.algorithm === 'monteCarlo') {
        resultado = await this.ejecutarMonteCarlo(grafoObj, config.colorCount, config.iterations, onFrame);
      } else {
        resultado = await this.ejecutarLasVegas(grafoObj, config.colorCount, onFrame);
      }

      const grafoVisual = this.convertirGrafoParaVisualizacion(resultado.grafo);
      return { 
        ...resultado, 
        grafoVisual, 
        config 
      };
      
    } catch (error) {
      console.error('Error ejecutando algoritmo:', error);
      return { 
        error: error.message, 
        exito: false,
        historialConflictos: [] // 🆕 Nuevo: historial vacío en caso de error
      };
    }
  }

  convertirGrafoParaVisualizacion(grafo) {
    if (!grafo || !grafo.nodos) {
      return { nodos: [], aristas: [] };
    }

    const nodos = grafo.nodos.map((nodo, index) => ({
      id: index,
      color: nodo.color || '#CCCCCC',
      x: Math.random() * 500 + 50,
      y: Math.random() * 400 + 50
    }));

    const aristas = [];
    grafo.nodos.forEach((nodo, index) => {
      if (nodo.vecinos) {
        nodo.vecinos.forEach(vecino => {
          const targetIndex = grafo.nodos.indexOf(vecino);
          if (targetIndex > index && targetIndex !== -1) {
            aristas.push({
              source: index,
              target: targetIndex,
              tieneConflicto: nodo.color === vecino.color
            });
          }
        });
      }
    });

    return { nodos, aristas };
  }

  convertirGrafoParaVisualizacionFrame(frame) {
    if (!frame || !frame.nodos) {
      return { nodos: [], aristas: [] };
    }

    const nodos = frame.nodos.map(n => ({
      id: n.id,
      color: n.color,
      x: Math.random() * 500 + 50,
      y: Math.random() * 400 + 50
    }));

    const aristas = [];
    frame.nodos.forEach((nodo, index) => {
      if (nodo.vecinos) {
        nodo.vecinos.forEach(targetIndex => {
          if (targetIndex > index && frame.nodos[targetIndex]) {
            aristas.push({
              source: index,
              target: targetIndex,
              tieneConflicto: nodo.color === frame.nodos[targetIndex].color
            });
          }
        });
      }
    });

    return { nodos, aristas };
  }
}

export default new AlgorithmService();
