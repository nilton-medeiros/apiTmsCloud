const app = require('./app');
const obterToken = require('./models/key_value/keyValueModel');

const PORT = process.env.PORT || 3333;
const keyValue = await obterToken();
// Se omitir wait, keyValue é uma Promise <pending>.
// Se deixar o await, dá erro: SyntaxError: await is only valid in async functions and the top level bodies of modules
console.log('sever: ',keyValue);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));