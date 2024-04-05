const axios = require('axios');

class ApiCTe {
    constructor(cte) {
        this.cte = cte;

    }

    emitir() {
        console.log(`${this.cte} faz um som.`);
    }
  }
