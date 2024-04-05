const axios = require('axios');

class AuthNuvemFiscal {

    constructor() {
        this.token = '';
        this.expires_in = new Date();
        this.authorized = false;


    }

    newToken() {

    }
}

module.exports = {AuthNuvemFiscal};