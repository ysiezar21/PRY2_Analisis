import React from 'react';

const GraphControls = () => {
  return (
    <div className="graph-controls">
      <h3>Controles del Grafo</h3>
      
      <div className="button-group">
        <button className="control-button">Agregar Nodo</button>
        <button className="control-button">Conectar Nodos</button>
        <button className="control-button">Generar Aleatorio</button>
        <button className="control-button">Limpiar Grafo</button>
      </div>
    </div>
  );
};

export default GraphControls;