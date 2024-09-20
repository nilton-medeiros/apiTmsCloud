function padLeft(number, length, caracter = '0') {
  let numberString = number.toString();
  return numberString.padStart(length, caracter);
}

module.exports = padLeft;
