import { grafo } from '../backend/grafo.js';
import { monteCarlo, lasVegas, getTiempoEspera} from '../backend/Algoritmos.js';

class AlgorithmService {
  
  // Acepta grafo existente o crea nuevo
  obtenerGrafoParaAlgoritmo(config) {
    // Si se proporciona grafo existente, usarlo
    if (config.grafoExistente) {
      return this.convertirGrafoVisualAGrafoInterno(config.grafoExistente);
    }
    
    // Si no, crear nuevo (backward compatibility)
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

  //  FUNCIÓN PARA CONVERTIR GRAFO VISUAL A INTERNO
  convertirGrafoVisualAGrafoInterno(grafoVisual) {
    const nuevoGrafo = new grafo();
    
    // Agregar nodos (manteniendo colores si los tienen)
    grafoVisual.nodos.forEach(nodoVisual => {
      const nodo = nuevoGrafo.agregarNodo(nodoVisual.color || null);
    });
    
    // Agregar aristas
    grafoVisual.aristas.forEach(aristaVisual => {
      if (aristaVisual.source < nuevoGrafo.nodos.length && 
          aristaVisual.target < nuevoGrafo.nodos.length) {
        nuevoGrafo.conectarNodos(
          nuevoGrafo.nodos[aristaVisual.source],
          nuevoGrafo.nodos[aristaVisual.target]
        );
      }
    });
    
    return nuevoGrafo;
  }

  async ejecutarMonteCarlo(grafo, colorCount, iterations, onFrame) {
    const startTime = performance.now();
    const resultado = monteCarlo(grafo, colorCount, iterations);
    
    // Reproducir frames con historial de conflictos
    if (resultado && resultado.frames) {
      for (let i = 0; i < resultado.frames.length; i++) {
        const frameVisual = this.convertirGrafoParaVisualizacionFrame(resultado.frames[i]);
        const conflictData = resultado.historialConflictos && resultado.historialConflictos[i];
        
        onFrame(frameVisual, conflictData);
        await new Promise(resolve => setTimeout(resolve, getTiempoEspera()));
      }
    }
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);

    return {
      grafo: resultado?.grafo || grafo,
      tiempo: executionTime,
      intentos: resultado?.grafo?.intentos || iterations,
      conflictos: resultado?.grafo?.numeroConflictos || 0,
      exito: resultado?.grafo?.numeroConflictos === 0,
      coloresAumentados: resultado?.grafo?.cantidadColoresAumentados || 0,
      historialConflictos: resultado?.historialConflictos || []
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
        historialConflictos: []
      };
    }

    // Reproducir frames con historial de conflictos
    if (resultado.frames) {
      for (let i = 0; i < resultado.frames.length; i++) {
        const frameVisual = this.convertirGrafoParaVisualizacionFrame(resultado.frames[i]);
        const conflictData = resultado.historialConflictos && resultado.historialConflictos[i];
        
        onFrame(frameVisual, conflictData);
        await new Promise(resolve => setTimeout(resolve, getTiempoEspera()));
      }
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
      historialConflictos: resultado.historialConflictos || []
    };
  }

  async ejecutarAlgoritmo(config, onFrame) {
    try {
      //  Usar grafo existente o crear nuevo
      const grafoObj = this.obtenerGrafoParaAlgoritmo(config);
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
        historialConflictos: []
      };
    }
  }

  convertirGrafoParaVisualizacion(grafo) {
    if (!grafo || !grafo.nodos) {
      return { nodos: [], aristas: [] };
    }

    const total = grafo.nodos.length;
    const centerX = 400;
    const centerY = 300;
    const radius = 250;

    const nodos = grafo.nodos.map((nodo, index) => {
      const angle = (2 * Math.PI * index) / total;
      return {
        id: index,
        color: nodo.color || '#CCCCCC',
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

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

    const total = frame.nodos.length;
    const centerX = 600;
    const centerY = 600;
    const radius = 550;

    const nodos = frame.nodos.map((n, index) => {
      const angle = (2 * Math.PI * index) / total;
      return {
        id: n.id,
        color: n.color,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

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

const algorithmService = new AlgorithmService();
export default algorithmService;
