import './grafo.js';

const colores = [
  "#FF0000", // rojo
  "#0000FF", // azul
  "#00FF00", // verde
  "#FFFF00", // amarillo
  "#FFA500", // naranja
  "#800080", // morado
  "#00FFFF", // cian
  "#FFC0CB", // rosa
  "#808080", // gris
  "#008000", // verde oscuro
  "#FF1493", // rosa profundo
  "#751b1bff", // carmesí
  "#F5DEB3", // trigo
  "#BA55D3", // orquídea oscura
  "#CD5C5C", // rojo indio
  "#887cd7ff", // azul pizarra
  "#4aa285ff", // aquamarina oscura
  "#C71585", // rosa intenso
  "#6a3131ff", // chocolate
  "#00FF7F", // verde fuerte
];
let tiempoEspera = 1;
let aumentosFlag = false;

export function setTiempoEspera(tiempo) {
  tiempoEspera = tiempo; 
};
export function getTiempoEspera() {
  return tiempoEspera;
};
export function setAumentosFlag(bandera) {
  aumentosFlag = bandera; 
};
export function getAumentosFlag() { 
  return aumentosFlag; 
};

function copiarGrafo(g) {
  return {
    nodos: g.nodos.map((n, index) => ({
      id: index,
      color: n.color,
      vecinos: n.vecinos.map(v => g.nodos.indexOf(v))
    })),
    intentos: g.intentos,
    numeroConflictos: g.numeroConflictos
  };
};

function monteCarlo(grafo, numeroMaximoDeColores = 3, iteraciones = 1000) {
  let mejoresConflictos = Infinity;
  let intentos = 0;
  let grafoNuevo = grafo;
  let subColores = colores.slice(0, numeroMaximoDeColores);
  let frames = [];
  let mejorFrame = null;
  let historialConflictos = [];
  let cantColoresAumentados = 0;

  for (let i = 0; i < iteraciones; i++) {
    intentos++;
    subColores = colores.slice(0, numeroMaximoDeColores + cantColoresAumentados);
    if (aumentosFlag){
      if (intentos % 2000 === 0) {
        cantColoresAumentados++;
      }
      if (cantColoresAumentados + numeroMaximoDeColores > colores.length) {
        console.log("No se pudo encontrar una solución con los colores disponibles.");
        return null; 
      }
      grafo.agregarCantidadColoresAumentado(cantColoresAumentados);
      console.log(`Aumentando número de colores a ${numeroMaximoDeColores + cantColoresAumentados}`);
      grafo.ActualizarColoresUsados(subColores);
    }

    const coloresLocales = subColores;
    const maxLocal = numeroMaximoDeColores;
    
    grafo.nodos.forEach(nodo => {
      const indice = Math.floor(Math.random() * maxLocal);
      nodo.cambiarColor(coloresLocales[indice]);
    });

    let conflictos = grafo.obtenerConflictos();

    // Guardar en historial 
    historialConflictos.push({
      iteracion: i,
      conflictos: conflictos,
      esMejor: conflictos < mejoresConflictos
    }); 

    // Guardamos un frame de esta iteración
    frames.push(copiarGrafo(grafo));

    if (conflictos < mejoresConflictos) {
      mejoresConflictos = conflictos;
      grafoNuevo = grafo;
      grafoNuevo.intentos = intentos;
      grafoNuevo.numeroConflictos = mejoresConflictos;
      grafoNuevo.ActualizarColoresUsados(subColores);
      mejorFrame = copiarGrafo(grafoNuevo);
    }
    if (conflictos === 0) {
      console.log(`Iteraciones: ${iteraciones}, Mejor número de conflictos: ${mejoresConflictos}`);
      grafo= grafoNuevo;
      grafo.intentos = intentos;
      grafo.numeroConflictos = mejoresConflictos;
      grafo.ActualizarColoresUsados(subColores);
      frames.push(mejorFrame);
      return { 
        grafo, 
        frames,
        historialConflictos 
  };
    };
  
  };
  console.log(`Iteraciones: ${iteraciones}, Mejor número de conflictos: ${mejoresConflictos}`);
  grafo= grafoNuevo;
  grafo.intentos = intentos;
  grafo.numeroConflictos = mejoresConflictos;
  grafo.ActualizarColoresUsados(subColores);
  frames.push(mejorFrame);
  return { 
    grafo, 
    frames,
    historialConflictos 
  };
};

function lasVegas(grafo, numeroMaximoDeColores = 3) {
  let intentos = 0;
  let subColores = colores.slice(0, numeroMaximoDeColores);
  let cantColoresAumentados = 0;
  let frames = [];
  let historialConflictos = []; 

  while (true) {
    intentos++;
    grafo.intentos = intentos;
    subColores = colores.slice(0, numeroMaximoDeColores + cantColoresAumentados);
    if (aumentosFlag){
      if (intentos % 2000 === 0) {
        cantColoresAumentados++;
        if (cantColoresAumentados + numeroMaximoDeColores > colores.length) {
          console.log("No se pudo encontrar una solución con los colores disponibles.");
          return null; 
        } 
        
        grafo.agregarCantidadColoresAumentado(cantColoresAumentados);
        console.log(`Aumentando número de colores a ${numeroMaximoDeColores + cantColoresAumentados}`);
        grafo.ActualizarColoresUsados(subColores);
      }

    }

    const coloresLocales = subColores; 
    const maxLocalVegas = numeroMaximoDeColores + cantColoresAumentados;
    
    grafo.nodos.forEach(nodo => {
      const indice = Math.floor(Math.random() * maxLocalVegas);
      nodo.cambiarColor(coloresLocales[indice]);
    });

    // Guardamos un frame de esta iteración
    frames.push(copiarGrafo(grafo));

    let conflictos = 0;
    grafo.nodos.forEach(nodo => {
      nodo.vecinos.forEach(vecino => {
        if (nodo.color === vecino.color) conflictos++;
      });
    });
    conflictos /= 2;

    // Guardar en historial 
    historialConflictos.push({
      iteracion: intentos - 1, // -1 porque empezamos en 0
      conflictos: conflictos,
      coloresUtilizados: numeroMaximoDeColores + cantColoresAumentados
    });

    if (conflictos === 0) {
      console.log(`Solución encontrada en ${intentos} intentos`);
      return { 
        grafo, 
        frames,
        historialConflictos 
      };
    };
  };
};

export { monteCarlo, lasVegas };
