// const axios = require('axios');

class ApiCTe {
    constructor(cte) {
        this.cte = cte;

    }

    emitir() {
        console.log(`Em construção... ${this.cte}`);
    }
}

module.exports = { ApiCTe };
