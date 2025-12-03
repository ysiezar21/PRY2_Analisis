import { grafo } from '../backend/grafo.js';
import { monteCarlo, lasVegas, getTiempoEspera } from '../backend/Algoritmos.js';

class AlgorithmService {
  
  // Acepta grafo existente o crea nuevo
  obtenerGrafoParaAlgoritmo(config) {
    // Si se proporciona grafo existente, usarlo
    if (config.grafoExistente) {
      return this.convertirGrafoVisualAGrafoInterno(config.grafoExistente);
    }
    
    // Si no, crear nuevo
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

  // CONVERTIR GRAFO VISUAL A INTERNO
  convertirGrafoVisualAGrafoInterno(grafoVisual) {
    console.log(`🔄 Convirtiendo grafo visual a interno: ${grafoVisual.nodos.length} nodos, ${grafoVisual.aristas.length} aristas`);
    
    const nuevoGrafo = new grafo();
    
    // 1. PRIMERO: Crear todos los nodos y guardar referencias
    const nodosCreados = [];
    
    grafoVisual.nodos.forEach((nodoVisual, index) => {
      // Crear nodo con su color actual (si tiene)
      const nodo = nuevoGrafo.agregarNodo(nodoVisual.color || null);
      nodosCreados[index] = nodo; // Guardar referencia por índice
      
      console.log(`   Nodo ${index} creado con color: ${nodoVisual.color || 'null'}`);
    });
    
    // 2. SEGUNDO: Crear las aristas/conexiones
    let conexionesCreadas = 0;
    
    grafoVisual.aristas.forEach(aristaVisual => {
      const sourceIndex = aristaVisual.source;
      const targetIndex = aristaVisual.target;
      
      // Verificar que ambos nodos existen
      if (sourceIndex < nodosCreados.length && 
          targetIndex < nodosCreados.length &&
          sourceIndex >= 0 && 
          targetIndex >= 0 &&
          sourceIndex !== targetIndex) {
        
        const nodoOrigen = nodosCreados[sourceIndex];
        const nodoDestino = nodosCreados[targetIndex];
        
        // Verificar que los nodos fueron creados correctamente
        if (nodoOrigen && nodoDestino) {
          // Conectar los nodos (esto agrega vecinos mutuamente)
          nuevoGrafo.conectarNodos(nodoOrigen, nodoDestino);
          conexionesCreadas++;
        } else {
          console.warn(`⚠️ No se pudo conectar nodos ${sourceIndex}-${targetIndex}: nodo no encontrado`);
        }
      } else {
        console.warn(`⚠️ Índices de arista inválidos: ${sourceIndex}-${targetIndex}`);
      }
    });
    
    // 3. VERIFICACIÓN
    console.log(`✅ Grafo convertido: ${nuevoGrafo.nodos.length} nodos, ${conexionesCreadas} conexiones creadas`);
    
    // Verificar estructura interna
    if (nuevoGrafo.nodos.length > 0) {
      const nodosConVecinos = nuevoGrafo.nodos.filter(n => n.vecinos && n.vecinos.length > 0).length;
      console.log(`   - Nodos con vecinos: ${nodosConVecinos}/${nuevoGrafo.nodos.length}`);
    }
    
    return nuevoGrafo;
  }

  async ejecutarMonteCarlo(grafo, colorCount, iterations, onFrame) {
    console.log(`🎲 Ejecutando Monte Carlo: k=${colorCount}, iteraciones=${iterations}`);
    
    const startTime = performance.now();
    const resultado = monteCarlo(grafo, colorCount, iterations);
    
    if (!resultado) {
      console.error('❌ Monte Carlo retornó null');
      return {
        grafo,
        tiempo: '0',
        intentos: '0',
        conflictos: 'N/A',
        exito: false,
        error: 'Algoritmo retornó null',
        historialConflictos: []
      };
    }
    
    // Reproducir frames con historial de conflictos
    if (resultado && resultado.frames && resultado.frames.length > 0) {
      console.log(`📊 Reproduciendo ${resultado.frames.length} frames...`);
      
      for (let i = 0; i < resultado.frames.length; i++) {
        const frameVisual = this.convertirGrafoParaVisualizacionFrame(resultado.frames[i]);
        const conflictData = resultado.historialConflictos && resultado.historialConflictos[i];
        
        if (onFrame) {
          onFrame(frameVisual, conflictData);
        }
        
        // Esperar tiempo configurado entre frames
        await new Promise(resolve => setTimeout(resolve, getTiempoEspera()));
      }
    }
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);

    console.log(`✅ Monte Carlo completado: ${executionTime}ms, ${resultado.intentos || iterations} intentos`);

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
    console.log(`🎰 Ejecutando Las Vegas: k=${colorCount}`);
    
    const startTime = performance.now();
    const resultado = lasVegas(grafo, colorCount);
    
    if (!resultado) {
      console.error('❌ Las Vegas retornó null');
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
    if (resultado.frames && resultado.frames.length > 0) {
      console.log(`📊 Reproduciendo ${resultado.frames.length} frames...`);
      
      for (let i = 0; i < resultado.frames.length; i++) {
        const frameVisual = this.convertirGrafoParaVisualizacionFrame(resultado.frames[i]);
        const conflictData = resultado.historialConflictos && resultado.historialConflictos[i];
        
        if (onFrame) {
          onFrame(frameVisual, conflictData);
        }
        
        await new Promise(resolve => setTimeout(resolve, getTiempoEspera()));
      }
    }
    
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);

    console.log(`✅ Las Vegas completado: ${executionTime}ms, ${resultado.grafo?.intentos || 'N/A'} intentos`);

    return {
      grafo: resultado.grafo,
      tiempo: executionTime,
      intentos: resultado.grafo?.intentos || 'N/A',
      conflictos: resultado.grafo?.numeroConflictos || 0,
      exito: resultado.grafo?.numeroConflictos === 0,
      coloresAumentados: resultado.grafo?.cantidadColoresAumentados || 0,
      historialConflictos: resultado.historialConflictos || []
    };
  }

  async ejecutarAlgoritmo(config, onFrame) {
    console.log(`🚀 Iniciando ejecución de algoritmo: ${config.algorithm}, k=${config.colorCount}`);
    
    try {
      // Usar grafo existente o crear nuevo
      const grafoObj = this.obtenerGrafoParaAlgoritmo(config);
      
      if (!grafoObj || !grafoObj.nodos || grafoObj.nodos.length === 0) {
        throw new Error('Grafo no válido o vacío');
      }
      
      console.log(`📐 Grafo preparado: ${grafoObj.nodos.length} nodos`);
      
      let resultado;
      
      if (config.algorithm === 'monteCarlo') {
        resultado = await this.ejecutarMonteCarlo(
          grafoObj, 
          config.colorCount, 
          config.iterations, 
          onFrame
        );
      } else {
        resultado = await this.ejecutarLasVegas(
          grafoObj, 
          config.colorCount, 
          onFrame
        );
      }

      // Convertir grafo resultante para visualización
      const grafoVisual = this.convertirGrafoParaVisualizacion(resultado.grafo || grafoObj);
      
      console.log(`🎉 Algoritmo completado: ${resultado.exito ? 'ÉXITO' : 'FALLO'}, ${resultado.conflictos} conflictos`);
      
      return { 
        ...resultado, 
        grafoVisual, 
        config 
      };
      
    } catch (error) {
      console.error('❌ Error ejecutando algoritmo:', error);
      return { 
        error: error.message, 
        exito: false,
        historialConflictos: []
      };
    }
  }

  convertirGrafoParaVisualizacion(grafo) {
    if (!grafo || !grafo.nodos) {
      console.warn('Grafo nulo o sin nodos en convertirGrafoParaVisualizacion');
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
        y: centerY + radius * Math.sin(angle),
        // Propiedad adicional para identificar nodos originales
        esOriginal: true
      };
    });

    const aristas = [];
    
    // Reconstruir aristas desde la estructura de vecinos
    grafo.nodos.forEach((nodo, index) => {
      if (nodo.vecinos && Array.isArray(nodo.vecinos)) {
        nodo.vecinos.forEach(vecino => {
          const targetIndex = grafo.nodos.indexOf(vecino);
          if (targetIndex !== -1 && targetIndex > index) {
            // Evitar duplicados
            const aristaExistente = aristas.find(a => 
              (a.source === index && a.target === targetIndex) ||
              (a.source === targetIndex && a.target === index)
            );
            
            if (!aristaExistente) {
              aristas.push({
                source: index,
                target: targetIndex,
                tieneConflicto: nodo.color === vecino.color
              });
            }
          }
        });
      }
    });

    console.log(`🔄 Grafo convertido para visualización: ${nodos.length} nodos, ${aristas.length} aristas`);
    
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
        id: n.id !== undefined ? n.id : index,
        color: n.color || '#CCCCCC',
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    const aristas = [];
    
    // Para frames, usar la estructura de vecinos si existe
    if (frame.nodos[0] && frame.nodos[0].vecinos) {
      frame.nodos.forEach((nodo, index) => {
        if (nodo.vecinos && Array.isArray(nodo.vecinos)) {
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
    }

    return { nodos, aristas };
  }
}

const algorithmService = new AlgorithmService();
export default algorithmService;
