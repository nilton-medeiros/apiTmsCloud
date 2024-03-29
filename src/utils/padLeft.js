function padLeft(number, length) {
    let numberString = number.toString();
    return numberString.padStart(length, '0');
}

module.exports = padLeft;
