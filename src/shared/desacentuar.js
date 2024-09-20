function desacentuar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

module.exports = desacentuar;
