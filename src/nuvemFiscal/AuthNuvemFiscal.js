const axios = require('axios');
const saveLog = require('../utils/saveLog');

require('dotenv').config();

class AuthNuvemFiscal {
    constructor() {
        this.token = '';
        this.expires_in = new Date();
        this.authorized = false;
        this.status = 500;
        this.error = {};
    }

    async newToken() {
        try {
            const apiUrl = 'https://auth.nuvemfiscal.com.br/oauth/token';
            const clientId = process.env.CLIENT_ID;
            const clientSecret = process.env.CLIENT_SECRET;
            const scope = 'cte mdfe cnpj empresa cep conta';

            const data = new URLSearchParams();
            data.append('grant_type', 'client_credentials');
            data.append('client_id', clientId);
            data.append('client_secret', clientSecret);
            data.append('scope', scope);

            const response = await axios.post(apiUrl, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log('AuthNuvemFiscal: status', response.status);

            if (response.status === 200) {
                console.log(response.data);

                const accessToken = response.data.access_token;
                const expiresIn = response.data.expires_in;
                const currDate = new Date();
                // Converte os segundos em dia (até segunda ordem da nuvem fiscal, é sempre 2592000's, que dá 30 dias)
                // Menos 2 dias para garantir a renovação antes de expirar efetivamente
                currDate.setDate(currDate.getDate() + expiresIn / 60 / 60 / 24 - 2);
                this.token = accessToken;
                this.expires_in = currDate;
                this.authorized = true;
                this.status = response.status;
            } else {
                this.status = response.status;
                this.error = response.data;
                saveLog({ status: response.status, data: response.data });
            }

            return this.token;
        } catch (error) {
            saveLog(`Erro ao obter token da Nuvemfiscal: ${error.message}`);
            console.error('Erro ao obter o token:', error.message);
            this.error = { error: error.message, status: 400 };
        }
    }
}

module.exports = { AuthNuvemFiscal };
