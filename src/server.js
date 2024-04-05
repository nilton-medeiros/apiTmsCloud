const app = require('./app');
const keyValueModel = require('./models/key_value/keyValueModel');

require('dotenv').config();

const PORT = process.env.PORT || 3333;
const NVFS_UID = process.env.NUVEMFISCAL_UID;

const connection = require('./connections/connectionSY');
const keyValue = await keyValueModel.obterToken(connection, NVFS_UID);
  // keyValue é undefined se await for retirado acima.
  // Se deixar o await, dá erro: Parsing error: Unexpected token keyValueModel
console.log(keyValue);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));