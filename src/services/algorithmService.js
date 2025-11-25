// Importamos las funciones de tu backend
import { grafo } from '../backend/grafo.js';
import { monteCarlo, lasVegas } from '../backend/Algoritmos.js';

class AlgorithmService {
  
  // Crear un grafo basado en la configuración
  crearGrafo(config) {
    const nuevoGrafo = new grafo();
    
    if (config.generarAleatorio) {
      // Generar grafo aleatorio
      nuevoGrafo.crearGrafo(config.nodeCount);
    } else {
      // Crear grafo con nodos pero sin conexiones (para modo manual)
      for (let i = 0; i < config.nodeCount; i++) {
        nuevoGrafo.agregarNodo();
      }
    }
    
    return nuevoGrafo;
  }

  // Ejecutar algoritmo Monte Carlo
  ejecutarMonteCarlo(grafo, colorCount, iterations) {
    console.log('Ejecutando Monte Carlo...');
    const startTime = performance.now();
    
    const resultado = monteCarlo(grafo, colorCount, iterations);
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);
    
    return {
      grafo: resultado,
      tiempo: executionTime,
      intentos: resultado.intentos || iterations,
      conflictos: resultado.numeroConflictos || 0,
      exito: resultado.numeroConflictos === 0
    };
  }

  // Ejecutar algoritmo Las Vegas
  ejecutarLasVegas(grafo, colorCount) {
    console.log('Ejecutando Las Vegas...');
    const startTime = performance.now();
    
    const resultado = lasVegas(grafo, colorCount);
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);
    
    if (resultado === null) {
      return {
        grafo: grafo,
        tiempo: executionTime,
        intentos: 'No encontrado',
        conflictos: 'N/A',
        exito: false,
        error: 'No se pudo encontrar solución'
      };
    }
    
    return {
      grafo: resultado,
      tiempo: executionTime,
      intentos: resultado.intentos || 'N/A',
      conflictos: resultado.numeroConflictos || 0,
      exito: resultado.numeroConflictos === 0,
      coloresAumentados: resultado.cantidadColoresAumentados || 0
    };
  }

  // Función principal que orquesta la ejecución
  async ejecutarAlgoritmo(config) {
    try {
      // Crear el grafo
      const grafo = this.crearGrafo(config);
      
      let resultado;
      
      // Ejecutar el algoritmo seleccionado
      if (config.algorithm === 'monteCarlo') {
        resultado = this.ejecutarMonteCarlo(grafo, config.colorCount, config.iterations);
      } else {
        resultado = this.ejecutarLasVegas(grafo, config.colorCount);
      }
      
      // Convertir el grafo a formato para la visualización
      const grafoVisual = this.convertirGrafoParaVisualizacion(resultado.grafo);
      
      return {
        ...resultado,
        grafoVisual: grafoVisual,
        config: config
      };
      
    } catch (error) {
      console.error('Error ejecutando algoritmo:', error);
      return {
        error: error.message,
        exito: false
      };
    }
  }

  // Convertir el grafo interno a formato para visualización
  convertirGrafoParaVisualizacion(grafo) {
    const nodos = grafo.nodos.map((nodo, index) => ({
      id: index,
      color: nodo.color || '#CCCCCC',
      x: Math.random() * 500 + 50, // Posición aleatoria temporal
      y: Math.random() * 400 + 50
    }));

    const aristas = [];
    grafo.nodos.forEach((nodo, index) => {
      nodo.vecinos.forEach(vecino => {
        const targetIndex = grafo.nodos.indexOf(vecino);
        if (targetIndex > index) { // Evitar duplicados
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
}

export default new AlgorithmService();