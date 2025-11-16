import { grafo, nodo } from './grafo.js';

const colores = [
  "#FF0000", // rojo
  "#0000FF", // azul
  "#00FF00", // verde
  "#FFFF00", // amarillo
  "#FFA500", // naranja
  "#800080", // morado
  "#00FFFF", // cian
  "#FFC0CB", // rosa
  "#A52A2A", // marrón
  "#808080", // gris
  "#008000", // verde oscuro
  "#FFD700", // dorado
  "#4B0082", // índigo
  "#FF4500", // naranja oscuro
  "#2E8B57", // verde mar
  "#1E90FF", // azul cielo
  "#D2691E", // chocolate
  "#ADFF2F", // verde amarillento
  "#FF1493", // rosa profundo
  "#00FA9A", // verde primavera
  "#7FFF00", // lima
  "#DC143C", // carmesí
  "#00CED1", // turquesa oscuro
  "#9400D3", // violeta oscuro
  "#FF6347", // tomate
  "#40E0D0", // turquesa
  "#EE82EE", // violeta
  "#F5DEB3", // trigo
  "#9ACD32", // amarillo verdoso
  "#FF69B4", // rosa fuerte
  "#BA55D3", // orquídea oscura
  "#CD5C5C", // rojo indio
  "#4DB6AC", // teal claro
  "#FF8C00", // naranja oscuro 2
  "#20B2AA", // teal
  "#87CEEB", // azul cielo claro
  "#6A5ACD", // azul pizarra
  "#B22222", // rojo oscuro
  "#5F9EA0", // cadete
  "#DDA0DD", // orquídea
  "#66CDAA", // aquamarina oscura
  "#8B0000", // rojo profundo
  "#8A2BE2", // azul violeta
  "#00BFFF", // azul profundo
  "#C71585", // rosa intenso
  "#7B68EE", // azul medio
  "#32CD32", // verde lima
  "#FFB6C1", // rosa claro
  "#00FF7F", // verde fuerte
  "#4682B4"  // azul acero
];

function prueba(){
    console.log("Función de prueba en Algoritmos.js");
    let grafoprueba = new grafo();
    grafoprueba.crearGrafo(25);
    grafoprueba = monteCarlo(grafoprueba, 3);
    grafoprueba.imprimirGrafo();
    
    let grafoprueba2 = new grafo();
    grafoprueba2.crearGrafo(100);
    grafoprueba2 = lasVegas(grafoprueba2, 3);
    grafoprueba2.imprimirGrafo();
}

function lasVegas(grafo, numeroMaximoDeColores = 3) {
    let intentos = 0;
    let subColores = colores.slice(0,numeroMaximoDeColores);
    let cantColoresAumentados = 0
    
    while (true) {
        intentos++;
        if (intentos % 100000 === 0) {
            cantColoresAumentados++;
            if (cantColoresAumentados + numeroMaximoDeColores > colores.length) {
                console.log("No se pudo encontrar una solución con los colores disponibles.");
                return null; 
            } 
            subColores = colores.slice(0,numeroMaximoDeColores + cantColoresAumentados);
            grafo.agregarCantidadColoresAumentado(cantColoresAumentados);
            console.log(`Aumentando número de colores a ${numeroMaximoDeColores + cantColoresAumentados}`);
        }

        grafo.nodos.forEach(nodo => {
            const indice = Math.floor(Math.random() * (numeroMaximoDeColores + cantColoresAumentados));
            nodo.cambiarColor(subColores[indice]);

        });
       
        let conflictos = 0;
        grafo.nodos.forEach(nodo => {
            nodo.vecinos.forEach(vecino => {
                if (nodo.color === vecino.color) conflictos++;
            });
        });
        conflictos /= 2; 

        if (conflictos === 0) {
            console.log(`Solución encontrada en ${intentos} intentos`);
            return grafo; 
        }
    }
}

function monteCarlo(grafo, numeroMaximoDeColores = 3, iteraciones = 1000) {
    let mejoresConflictos = Infinity;
    let intentos = 0;
    let grafoNuevo = grafo;
    let subColores = colores.slice(0,numeroMaximoDeColores);

    for (let i = 0; i < iteraciones; i++) {
        intentos++;
        grafo.nodos.forEach(nodo => {
            const indice = Math.floor(Math.random() * numeroMaximoDeColores);
            nodo.cambiarColor(subColores[indice]);
        });
        let conflictos = 0;
        grafo.nodos.forEach(nodo => {
            nodo.vecinos.forEach(vecino => {
                if (nodo.color === vecino.color) conflictos++;
            });
        });
        conflictos /= 2;

        if (conflictos < mejoresConflictos) {
            mejoresConflictos = conflictos;
            grafoNuevo = grafo;
            grafoNuevo.intentos = intentos;
            grafoNuevo.numeroConflictos = mejoresConflictos;

            
        }
    }

    console.log(`Iteraciones: ${iteraciones}, Mejor número de conflictos: ${mejoresConflictos}`);
    return grafoNuevo;
}





prueba();
