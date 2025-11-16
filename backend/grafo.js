class nodo {
    constructor(color = null) { 
        this.color = color;
        this.vecinos = [];
    }

    conseguirColor() {
        return this.color;
    }

    cambiarColor(nuevoColor) {
        if (this.color !== nuevoColor) {
            this.color = nuevoColor;
        } else {
            return false;
        }
    }

    agregarVecino(nodoVecino) {
        this.vecinos.push(nodoVecino);
    }

    eliminarVecino(nodoVecino) {
        this.vecinos = this.vecinos.filter(vecino => vecino !== nodoVecino);
    }
}

class grafo {
    constructor() {
        this.nodos = [];
        this.cantidadNodos = 0;
        this.intentos = 0;
        this.numeroConflictos = 0;
        this.cantidadColoresAumentados = 0;
    }
    agregarCantidadColoresAumentado(num){
        this.cantidadColoresAumentados = num;
    }
    agregarNodo(color = null) { 
        const nuevoNodo = new nodo(color);
        this.nodos.push(nuevoNodo);
        this.cantidadNodos += 1;
        return nuevoNodo;
    }

    eliminarNodo(nodoAEliminar) {
        this.nodos = this.nodos.filter(nodo => nodo !== nodoAEliminar);
        this.nodos.forEach(nodo => nodo.eliminarVecino(nodoAEliminar));
        this.cantidadNodos -= 1;
    }

    conectarNodos(nodo1, nodo2) {
        nodo1.agregarVecino(nodo2);
        nodo2.agregarVecino(nodo1);
    }

    desconectarNodos(nodo1, nodo2) {
        nodo1.eliminarVecino(nodo2);
        nodo2.eliminarVecino(nodo1);
    }

    obtenerConflictos() {
        let conflictos = 0;
        for (const nodo of this.nodos) {
            for (const vecino of nodo.vecinos) {
                if (nodo.conseguirColor() === vecino.conseguirColor()) {
                    conflictos += 1;
                }
            }
        }
        return conflictos / 2;
    }

    validarNodos() {
        for (const nodo of this.nodos) {
            if (nodo.vecinos.length === 0) {
                return false;
            }
        }
        return true;
    }

    imprimirGrafo() {
        let indice = 0;
        for (const nodo of this.nodos) {
            console.log(`Nodo ${indice}: Color ${nodo.conseguirColor()}, Vecinos: ${nodo.vecinos.map(vecino => this.nodos.indexOf(vecino)).join(", ")}`);
            indice += 1;
        }
        if (this.cantidadColoresAumentados > 0) {
            console.log(`Cantidad de colores aumentados: ${this.cantidadColoresAumentados}`);
        }
    }

    crearGrafo(numMaximoNodos) {
        console.log("Creando grafo...");
        this.agregarNodo();
        for (let i = 1; i < numMaximoNodos; i++) {
            
            let probabilidadConexion = 100 / this.nodos.length; 

            for (let j = 0; j < this.nodos.length; j++) {
                if (Math.random() * 100 < probabilidadConexion) {
                    let nodonuevo = this.agregarNodo(); 
                    this.conectarNodos(nodonuevo, this.nodos[j]);
                    j = this.nodos.length;
                } else if (j === this.nodos.length - 1) {
                    j = 0;
                }
            }
        }
    }
}

export { grafo, nodo };
