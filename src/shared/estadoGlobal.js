const sistema = {
  name: 'ApiTmsCloud',
  version: '1.0.0',
};

const sefaz = {
  online: true,
  contingencia: false,
  setOnline(status) {
    this.online = typeof status === 'boolean' ? status : true;
  },
  setContingencia(status) {
    this.contingencia = typeof status === 'boolean' ? status : true;
  },
};

module.exports = { sistema, sefaz };
