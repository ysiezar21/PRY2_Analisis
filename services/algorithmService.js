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

  ejecutarMonteCarlo(grafo, colorCount, iterations, onFrame) {
    const resultado = monteCarlo(grafo, colorCount, iterations);
    return this.reproducirFrames(resultado, onFrame);
  }

  ejecutarLasVegas(grafo, colorCount, onFrame) {
    const resultado = lasVegas(grafo, colorCount);
    if (!resultado) {
      return {
        grafo,
        tiempo: '0',
        intentos: 'No encontrado',
        conflictos: 'N/A',
        exito: false,
        error: 'No se pudo encontrar solución'
      };
    }
    return this.reproducirFrames(resultado, onFrame);
  }

  // Reproduce los frames con delay
  async reproducirFrames(resultado, onFrame) {
    const startTime = performance.now();
    for (let i = 0; i < resultado.frames.length; i++) {
      onFrame(this.convertirGrafoParaVisualizacionFrame(resultado.frames[i]));
      // Ajusta el delay (en ms) para ver el cambio de cada iteración
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);

    const grafoFinal = resultado.grafo;

    return {
      grafo: grafoFinal,
      tiempo: executionTime,
      intentos: grafoFinal.intentos || 'N/A',
      conflictos: grafoFinal.numeroConflictos || 0,
      exito: grafoFinal.numeroConflictos === 0,
      coloresAumentados: grafoFinal.cantidadColoresAumentados || 0
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
      return { ...resultado, grafoVisual, config };
      
    } catch (error) {
      console.error('Error ejecutando algoritmo:', error);
      return { error: error.message, exito: false };
    }
  }

  convertirGrafoParaVisualizacion(grafo) {
    const nodos = grafo.nodos.map((nodo, index) => ({
      id: index,
      color: nodo.color || '#CCCCCC',
      x: Math.random() * 500 + 50,
      y: Math.random() * 400 + 50
    }));

    const aristas = [];
    grafo.nodos.forEach((nodo, index) => {
      nodo.vecinos.forEach(vecino => {
        const targetIndex = grafo.nodos.indexOf(vecino);
        if (targetIndex > index) {
          aristas.push({
            source: index,
            target: targetIndex,
            tieneConflicto: nodo.color === vecino.color
          });
        }
      });
    });

    return { nodos, aristas };
  }

  convertirGrafoParaVisualizacionFrame(frame) {
    const nodos = frame.nodos.map(n => ({
      id: n.id,
      color: n.color,
      x: Math.random() * 500 + 50,
      y: Math.random() * 400 + 50
    }));

    const aristas = [];
    frame.nodos.forEach((nodo, index) => {
      nodo.vecinos.forEach(targetIndex => {
        if (targetIndex > index) {
          aristas.push({
            source: index,
            target: targetIndex,
            tieneConflicto: nodo.color === frame.nodos[targetIndex].color
          });
        }
      });
    });

    return { nodos, aristas };
  }
}

export default new AlgorithmService();
