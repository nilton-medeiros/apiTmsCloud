const axios = require('axios');

require('dotenv').config();

const { sistema, sefaz } = require('../shared/estadoGlobal');
const saveLog = require('../shared/saveLog');
const desacentuar = require('../shared/desacentuar');
const dbGetIcms = require('../models/icms/icmsModel');
const padLeft = require('../shared/padLeft');

// Manipulação de datas e horas
const { dateISOFormatUTC, dateISO } = require('../shared/dateTools');

class ApiCTe {
  constructor(cte) {
    this._cte = cte;
    this._authToken = cte.authToken;
    this._pool = cte.pool;
    this.indGlobalizado = this._infoIndGlobalizado();

    /*
     Todos os métodos devem preecher estas propriedades para retorno do webhook
     - protocolo_evento
     - data_hora_evento
     - codigo_evento
     - detalhe_evento
    */
    this._protocolo_evento;
    this._data_hora_evento;
    this._codigo_evento;
    this._detalhe_evento;

    this._nuvemfiscal_uid = cte.nuvemfiscal_uid;
    this._tpAmb = cte.emi_tpAmb;

    if (this._tpAmb === 1) {
      this._ambiente = 'producao';
      this._baseUrl = 'https://api.nuvemfiscal.com.br/cte';
    } else {
      this._ambiente = 'homologacao';
      this._baseUrl = 'https://api.sandbox.nuvemfiscal.com.br/cte';
    }

    this._baseURLWithUID = null;

    if (this._nuvemfiscal_uid) {
      this._baseURLWithUID = this._baseUrl + '/' + this._nuvemfiscal_uid;
    }

    this._apiConnect = null;

    try {
      this._apiConnect = new URLSearchParams();
    } catch (error) {
      saveLog({
        level: 'ApiCTe - LOG1',
        messsage: 'Erro ao instanciar URLSearchParams',
        meta: error,
      });
    }
    this._body = null;
  }

  _connected() {
    return this._apiConnect !== null;
  }

  emitir() {
    if (!this._connected()) {
      return false;
    }

    // Request body
    this._body = this._bodyDefinition();

    // Headers
    const headers = {
      Authorization: `Bearer ${this._authToken}`,
      'Content-Type': 'application/json',
    };

    // Emitir CTe
    axios
      .post(this._baseURLWithUID + '/enviar', this._body, { headers })
      .then((response) => {
        this._protocolo_evento = response.data.protocolo;
        this._data_hora_evento = response.data.dataHora;
        this._codigo_evento = response.data.codigo;
        this._detalhe_evento = response.data.detalhe;
        console.log('CTe emitido com sucesso!');
      })
      .catch((error) => {
        saveLog({
          level: 'ApiCTe - LOG2',
          messsage: 'Erro ao enviar (post) para api da NuvemFiscal',
          meta: {
            urlApi: this._baseURLWithUID + '/enviar',
            error: error,
          },
        });
      });
  }

  _bodyDefinition() {
    // Exemplos: Doc: https://dev.nuvemfiscal.com.br/docs/api#tag/Cte/operation/EmitirCte

    // Tag ide - Identificação do CT-e
    const ide = {};
    ide.cUF = this._cte.emi_uf;
    ide.cCT = this._cte.cCT;
    ide.CFOP = this._cte.cte_cfop;
    ide.natOp = this._cte.natOp;
    ide.mod = this._cte.modelo;
    ide.serie = this._cte.serie;
    ide.nCT = this._cte.nCT;
    ide.dhEmi = dateISOFormatUTC(this._cte.dhEmi);
    ide.tpImp = this._cte.emi_tpImp;
    ide.tpEmis = this._cte.tpEmis;
    ide.tpAmb = this._tpAmb;
    ide.tpCTe = this._cte.tpCTe;
    ide.procEmi = 0; // 0 - Emissão de CT-e com aplicativo do contribuinte
    ide.verProc = sistema.version;

    // IndGlobalizado informado se exisitir

    ide.indGlobalizado = this.indGlobalizado ? 1 : undefined;

    ide.cMunEnv = this._cte.emi_cMunEnv;
    ide.xMunEnv = this._cte.emi_xMunEnv;
    ide.UFEnv = this._cte.emi_uf;
    ide.modal = this._cte.modal;
    ide.tpServ = this._cte.tpServ;
    ide.cMunIni = this._cte.cMunIni;
    ide.xMunIni = this._cte.xMunIni;
    ide.UFIni = this._cte.UFIni;
    ide.cMunFim = this._cte.cMunFim;
    ide.xMunFim = this._cte.xMunFim;
    ide.UFFim = this._cte.UFFim;
    ide.retira = this._cte.retira;
    ide.xDetRetira = this._cte.xDetRetira || undefined;
    ide.indIEToma = this._cte.indIEToma;

    // Verifica se vai entrar a Tag toma3 ou toma4
    if (this._cte.cte_tomador === 3) {
      ide.toma3 = { toma: this._cte.cte_tomador };
    } else {
      const toma = {};
      toma.toma = 4;
      toma.CNPJ = this._cte.tom_tipoDoc === 'CNPJ' ? this._cte.tom_doc : undefined;
      toma.CPF = this._cte.tom_tipoDoc === 'CPF' ? this._cte.tom_doc : undefined;
      toma.IE = this._cte.tom_ie || undefined;
      toma.xNome = this._cte.tom_xNome;
      toma.xFant = this._cte.tom_xFant || undefined;
      toma.fone = this._cte.tom_fone || undefined;
      toma.enderToma = {};
      toma.enderToma.xLgr = this._cte.tom_xLgr;
      toma.enderToma.nro = this._cte.tom_nro;
      toma.enderToma.xCpl = this._cte.tom_xCpl || undefined;
      toma.enderToma.xBairro = this._cte.tom_xBairro;
      toma.enderToma.cMun = this._cte.tom_cMun;
      toma.enderToma.xMun = this._cte.tom_xMun;
      toma.enderToma.CEP = this._cte.tom_cep;
      toma.enderToma.UF = this._cte.tom_uf;
      toma.enderToma.cPais = '1058';
      toma.enderToma.xPais = 'BRASIL';
      toma.email = this._cte.tom_email || undefined;

      ide.toma4 = toma;
    }

    // tpEmis: 1-Normal; 5-contigência FSDA; 7-Autorização pela SVC-RS; 8-Autorização pela SVC-SP
    if (sefaz.contingencia) {
      // 7 - Autorização pela SVC-RS
      ide.tpEmis = 7;
      ide.dhCont = dateISOFormatUTC();
      ide.xJust = 'SEFAZ SP: ' + this._codigoStatus + ' - ' + this._motivoStatus;
    }

    // Tag compl
    const compl = {};
    compl.xCaracAd = this._cte.xCaracAd || undefined;
    compl.xCaracSer = this._cte.xCaracSer || undefined;
    compl.xEmi = this._cte.xEmi || undefined;

    if (this._cte.modal === 2) {
      // Tag fluxo para modal 2 - Aéreo
      compl.fluxo = {
        xOrig: this._cte.xOrig,
        pass: [{ xPass: this._cte.xPass }],
        xDest: this._cte.xDest,
      };
    }

    // Tag entrega
    /*
     * Tipo de data/período programado para a entrega:
     *     0 - Sem data definida;
     *     1 - Na data;
     *     2 - Até a data;
     *     3 - A partir da data;
     *     4 – No período
     */
    const entrega = {};
    switch (this._cte.tpPer) {
      case 0:
        entrega.semData = { tpPer: 0 };
        break;
      case 1:
      case 2:
      case 3:
        entrega.comData = {
          tpPer: this._cte.tpPer,
          dProg: dateISO(this._cte.dProg),
        };
        break;
      case 4:
        entrega.noPeriodo = {
          tpPer: this._cte.tpPer,
          dIni: dateISO(this._cte.dIni),
          dFim: dateISO(this._cte.dFim),
        };
        break;
    }

    /*
     * Tipo de hora/período programado para a entrega:
     *     0 - Sem hora definida;
     *     1 - Na hora;
     *     2 - Até a hora;
     *     3 - A partir da hora;
     *     4 – No intervalo de tempo
     */
    switch (this._cte.tpHor) {
      case 0:
        entrega.semHora = { tpHor: 0 };
        break;
      case 1:
      case 2:
      case 3:
        entrega.comHora = { tpHor: this._cte.tpHor, hProg: this._cte.hProg };
        break;
      case 4:
        entrega.noInter = { tpHor: this._cte.tpHor, hIni: this._cte.hIni, hFim: this._cte.hFim };
        break;
    }

    compl.Entrega = entrega || undefined;
    compl.origCalc = this._cte.xMunIni;
    compl.destCalc = this._cte.xMunFim;
    this._cte.xObs = this._cte.xObs.replace(/(\r\n|\n|\r)/gm, '; ') || '';
    compl.xObs = this._cte.xObs || undefined;

    let obsContribuinte = [{ xCampo: 'Emissor', xTexto: this._cte.xEmi }];

    if (sefaz.contingencia) {
      obsContribuinte.push({ xCampo: 'SVC-RS', xTexto: 'EMISSAO EM CONTINGENCIA' });
    }

    if (this._cte.anexos.obs_contr.length > 0) {
      obsContribuinte = obsContribuinte.concat(this._cte.anexos.obs_contr);
    }

    compl.ObsCont = obsContribuinte;
    compl.ObsFisco = this._cte.anexos.obs_fisco.length > 0 ? this._cte.anexos.obs_fisco : undefined;

    // Tag emit - Emitente
    const emitente = {};
    emitente.CNPJ = this._cte.emi_cnpj;
    emitente.IE = this._cte.emi_IE || undefined;
    emitente.xNome = this._cte.emi_xNome;
    emitente.xFant = this._cte.emi_xFant || undefined;
    emitente.enderEmit = {};
    emitente.enderEmit.xLgr = this._cte.emi_xLgr;
    emitente.enderEmit.nro = this._cte.emi_nro;
    emitente.enderEmit.xCpl = this._cte.emi_xCpl || undefined;
    emitente.enderEmit.xBairro = this._cte.emi_xBairro;
    emitente.enderEmit.cMun = this._cte.emi_cMunEnv;
    emitente.enderEmit.xMun = this._cte.emi_xMunEnv;
    emitente.enderEmit.CEP = this._cte.emi_cep;
    emitente.enderEmit.UF = this._cte.emi_uf;
    emitente.enderEmit.fone = this._cte.emi_fone;
    emitente.CRT = this._cte.emi_CRT;

    // Tag rem - Remetente
    let remetente = null;

    if (rem_doc) {
      remetente = {};
      if (this._cte.rem_tipoDoc === 'CNPJ') {
        remetente.CNPJ = this._cte.rem_doc;
        remetente.IE = this._cte.rem_ie || undefined;
      } else {
        remetente.CPF = this._cte.rem_doc;
      }
      remetente.xNome = this._cte.rem_xNome;
      remetente.xFant = this._cte.rem_xFant || undefined;
      remetente.fone = this._cte.rem_fone || undefined;
      remetente.enderReme = {};
      remetente.enderReme.xLgr = this._cte.rem_xLgr;
      remetente.enderReme.nro = this._cte.rem_nro;
      remetente.enderReme.xCpl = this._cte.rem_xCpl || undefined;
      remetente.enderReme.xBairro = this._cte.rem_xBairro;
      remetente.enderReme.cMun = this._cte.rem_cMunEnv;
      remetente.enderReme.xMun = this._cte.rem_xMunEnv;
      remetente.enderReme.CEP = this._cte.rem_cep;
      remetente.enderReme.UF = this._cte.rem_uf;
      remetente.email = this._cte.rem_email || undefined;
    }

    // Tag exped - Expedidor
    let expedidor = null;

    if (exp_doc) {
      expedidor = {};
      if (this._cte.exp_tipoDoc === 'CNPJ') {
        expedidor.CNPJ = this._cte.exp_doc;
        expedidor.IE = this._cte.exp_ie || undefined;
      } else {
        expedidor.CPF = this._cte.exp_doc;
      }
      expedidor.xNome = this._cte.exp_xNome;
      expedidor.fone = this._cte.exp_fone || undefined;
      expedidor.enderExped = {};
      expedidor.enderExped.xLgr = this._cte.exp_xLgr;
      expedidor.enderExped.nro = this._cte.exp_nro;
      expedidor.enderExped.xCpl = this._cte.exp_xCpl || undefined;
      expedidor.enderExped.xBairro = this._cte.exp_xBairro;
      expedidor.enderExped.cMun = this._cte.exp_cMunEnv;
      expedidor.enderExped.xMun = this._cte.exp_xMunEnv;
      expedidor.enderExped.CEP = this._cte.exp_cep;
      expedidor.enderExped.UF = this._cte.exp_uf;
      expedidor.email = this._cte.exp_email || undefined;
    }

    // Tag receb - Recebedor
    let recebedor = null;

    if (rec_doc) {
      recebedor = {};
      if (this._cte.rec_tipoDoc === 'CNPJ') {
        recebedor.CNPJ = this._cte.rec_doc;
        recebedor.IE = this._cte.rec_ie || undefined;
      } else {
        recebedor.CPF = this._cte.rec_doc;
      }
      recebedor.xNome = this._cte.rec_xNome;
      recebedor.fone = this._cte.rec_fone || undefined;
      recebedor.enderReceb = {};
      recebedor.enderReceb.xLgr = this._cte.rec_xLgr;
      recebedor.enderReceb.nro = this._cte.rec_nro;
      recebedor.enderReceb.xCpl = this._cte.rec_xCpl || undefined;
      recebedor.enderReceb.xBairro = this._cte.rec_xBairro;
      recebedor.enderReceb.cMun = this._cte.rec_cMunEnv;
      recebedor.enderReceb.xMun = this._cte.rec_xMunEnv;
      recebedor.enderReceb.CEP = this._cte.rec_cep;
      recebedor.enderReceb.UF = this._cte.rec_uf;
      recebedor.email = this._cte.rec_email || undefined;
    }

    // Tag dest - Destinatário
    let destinatario = null;

    if (des_doc) {
      destinatario = {};
      if (this._cte.des_tipoDoc === 'CNPJ') {
        destinatario.CNPJ = this._cte.des_doc;
        destinatario.IE = this._cte.des_ie || undefined;
      } else {
        destinatario.CPF = this._cte.des_doc;
      }
      destinatario.xNome = this._cte.des_xNome;
      destinatario.fone = this._cte.des_fone || undefined;
      destinatario.enderDest = {};
      destinatario.enderDest.xLgr = this._cte.des_xLgr;
      destinatario.enderDest.nro = this._cte.des_nro;
      destinatario.enderDest.xCpl = this._cte.des_xCpl || undefined;
      destinatario.enderDest.xBairro = this._cte.des_xBairro;
      destinatario.enderDest.cMun = this._cte.des_cMunEnv;
      destinatario.enderDest.xMun = this._cte.des_xMunEnv;
      destinatario.enderDest.CEP = this._cte.des_cep;
      destinatario.enderDest.UF = this._cte.des_uf;
      destinatario.email = this._cte.des_email || undefined;
    }

    // Tag vPrest - Informações do Valor da Prestação de Serviço
    const vPrest = {};
    vPrest.vTPrest = this._cte.vTPrest;
    vPrest.vRec = this._cte.vTPrest;

    const compCalc = this._cte.anexos.comp_calc;

    if (compCalc.length > 0) {
      vPrest.Comp = compCalc.map((obj) => ({
        xNome: obj.xNome,
        vComp: obj.vComp,
      }));
    }
    // Parei aqui tag imp - impostos

    // Tag infCte - Informações do CT-e
    const infCte = {
      versao: this._cte.emi_versao_xml.toFixed(2),
      ide: ide,
      compl: compl,
      emit: emitente,
    };
    infCte.rem = remetente || undefined;
    infCte.exp = expedidor || undefined;
    infCte.receb = recebedor || undefined;
    infCte.dest = destinatario || undefined;
    infCte.vPrest = vPrest;

    // Tag imp - impostos
    const icms = {};
    const codSitTrib = desacentuar(this._cte.cod_sit_trib).toLowerCase();

    switch (codSitTrib) {
      case '00 - tributacao normal do icms':
        icms.ICMS00 = {
          CST: '00',
          vBC: this._cte.vBC,
          pICMS: this._cte.pICMS,
          vICMS: this._cte.vICMS,
        };
        break;
      case '20 - tributacao com reducao de bc do icms':
        icms.ICMS20 = {
          CST: '20',
          pRedBC: this._cte.pRedBC,
          vBC: this._cte.vBC,
          pICMS: this._cte.pICMS,
          vICMS: this._cte.vICMS,
        };
        break;
      case '60 - icms cobrado anteriormente por substituicao tributaria':
        icms.ICMS60 = {
          CST: '60',
          vBCSTRet: this._cte.vBC,
          vICMSSTRet: this._cte.vICMS,
          pICMSSTRet: this._cte.pICMS,
          vCred: this._cte.vCred,
        };
        break;
      case '90 - icms outros':
        icms.ICMS90 = {
          CST: '90',
          pRedBC: this._cte.pRedBC,
          vBC: this._cte.vBC,
          pICMS: this._cte.pICMS,
          vICMS: this._cte.vICMS,
          vCred: this._cte.vCred,
        };
        break;
      case '90 - icms devido a uf de origem da prestacao, quando diferente da uf emitente':
        icms.ICMSOutraUF = {
          CST: '90',
          pRedBCOutraUF: this._cte.pRedBC,
          vBCOutraUF: this._cte.vBC,
          pICMSOutraUF: this._cte.pICMS,
          vICMSOutraUF: this._cte.vICMS,
        };
        break;

      case 'simples nacional':
        icms.ICMSSN = { CST: '90', indSN: 1 };
        break;
      default:
        const codigo = codSitTrib.slice(0, 2);
        if (['40', '41', '51'].includes(codigo)) {
          icms.ICMS45 = { CST: codSitTrib };
        }
        break;
    }

    const vTotTrib = this._cte.vICMS + this._cte.vPIS + this._cte.vCOFINS;

    const imp = { ICMS: icms, vTotTrib: vTotTrib };

    imp.infAdFisco = this._cte.infAdFisco || undefined;

    // Calculo do DIFAL se houver
    if (
      [0, 1, 3].includes(this._cte.tpCTe) &&
      !(this._cte.UFIni === this._cte.UFFim) &&
      ide.tpServ === 0 &&
      this._cte.des_icms === 0 &&
      this._cte.cte_tomador === 3 &&
      codSitTrib === 'simples nacional'
    ) {
      // Tipo de CTe (tpCTe) = 0-Normal, 1-Complemento de Valores, 3-Substituto AND
      // UF de término do serviço de transporte na operação interestadual AND
      // Tipo de Serviço = 0-Normal AND
      // consumidor (destinatário) não contribuinte do ICMS AND
      // Tomador (pagador dos serviços) tem que ser o DESTINATÁRIO AND
      // O STF decidiu que essa cobrança do ICMS do Diferencial de Alíquota – DIFAL, para empresas Optantes pelo Simples é inconstitucional,
      // pois seu recolhimento foi previsto pela Lei Complementar n° 123, de 14 de dezembro de 2006, e seu recolhimento é feito pela guia
      // unificada do Simples Nacional – DAS

      const estados = [
        'AC',
        'AL',
        'AM',
        'BA',
        'CE',
        'DF',
        'ES',
        'GO',
        'MA',
        'MG',
        'MS',
        'MT',
        'PB',
        'PE',
        'PI',
        'PR',
        'RJ',
        'RN',
        'RO',
        'RR',
        'RS',
        'SE',
        'SP',
        'TO',
      ];

      if (estados.includes(this._cte.UFFim)) {
        // DIFAL - Diferença de Alíquota | FCP - Fundo de Combate a Pobreza | Arquivo SeFaz: CTe_Nota_Tecnica_2015_004.pdf (Pagina 4)

        const dbIcms = dbGetIcms(this._pool, this._cte.UFIni, this._cte.UFFim);

        if (dbIcms.aliqIni > 0 && dbIcms.aliqFim > 0) {
          const nValFCP = this._cte.vTPrest * 0.02;
          const pDifal = dbIcms.aliqFim - dbIcms.aliqIni;
          const vDifal = this._cte.vTPrest * (pDifal / 100);

          // Tag ICMSUFFim - Diferença de Alíquota | FCP
          imp.ICMSUFFim = {
            vBCUFFim: this._cte.vTPrest,
            pFCPUFFim: 2.0,
            pICMSUFFim: dbIcms.aliqFim,
            pICMSInter: dbIcms.aliqIni,
            vFCPUFFim: nValFCP,
            vICMSUFFim: vDifal + nValFCP,
            vICMSUFIni: 0.0,
          };

          saveLog({
            level: 'ApiCTe - LOG3',
            messsage: 'DIFAL CALCULADO',
            meta: { referencia_uid: this._cte.referencia_uid },
          });
        }
      }
    }

    infCte.imp = imp;

    if (ide.tpCTe === 0) {
      // Tag infCteNorm - Grupo de informações do CTe Normal - 0 e (Substituto - 3 NÃO IMPLENTADO)

      // Informações do objeto infCarga
      const infCarga = {
        vCarga: this._cte.vCarga,
        proPred: this._cte.proPred,
      };

      infCarga.xOutCat = this._cte.xOutCat || undefined;
      infCarga.infQ = [
        { cUnid: '01', tpMed: 'PESO BRUTO', qCarga: '##' + this._cte.peso_bruto.toFixed(4) + '##' },
        { cUnid: '01', tpMed: 'PESO BC', qCarga: '##' + this._cte.peso_bc.toFixed(4) + '##' },
        {
          cUnid: '01',
          tpMed: 'PESO CUBADO',
          qCarga: '##' + this._cte.peso_cubado.toFixed(4) + '##',
        },
        {
          cUnid: '00',
          tpMed: 'PESO CUBAGEM',
          qCarga: '##' + this._cte.cubagem_m3.toFixed(4) + '##',
        },
        { cUnid: '03', tpMed: 'VOLS.', qCarga: '##' + this._cte.qtde_volumes.toFixed(4) + '##' },
      ];

      // Tag infCteNorm - Grupo de informações do CTe Normal e Substituto
      const infCteNorm = { infCarga: infCarga };
      infCteNorm.infDoc = {};

      const notas = this._cte.anexos.docs;

      switch (this._cte.tipo_doc_anexo) {
        case 1: // 1 - infNF Nota Fiscal (papel-antiga)
          infCteNorm.infDoc.infNF = notas.map((nota) => ({
            mod: padLeft(nota.modelo, 2),
            serie: padLeft(nota.serie, 3),
            nDoc: nota.nDoc,
            dEmi: dateISO(nota.dEmi),
            vBC: nota.vBC,
            vICMS: nota.vICMS,
            vBCST: nota.vBCST,
            vST: nota.vST,
            vProd: nota.vProd,
            vNF: nota.vNF,
            nCFOP: nota.nCFOP,
            nPeso: nota.nPeso,
            PIN: nota.PIN,
            dPrev: dateISO(),
          }));

          break;
        case 2: // 2 - NFe
          infCteNorm.infDoc.infNFe = notas.map((nota) => ({
            chave: nota.chave,
            PIN: nota.PIN || undefined,
          }));

          break;
        case 3: // 3 - infOutros
          infCteNorm.infDoc.infOutros = notas.map((nota) => ({
            tpDoc: padLeft(nota.tpDoc, 2),
            descOutros: nota.descOutros,
            nDoc: nota.nDoc,
            dEmi: dateISO(nota.dEmi),
            vDocFisc: nota.vDocFisc,
          }));

          break;
      }

      // Tag - infModal
      const infModal = { versaoModal: infCte.versao };

      if (ide.tpServ === 0 && ide.modal === 1) {
        // tpServ: 0 - Normal e modal 1 - Rodoviário

        infModal.rodo = { RNTRC: this._cte.emi_RNTRC };

        if (this._cte.modal.length > 0) {
          // Ordens de Coletas
          const occs = [];

          for (const occ of this._cte.modal) {
            occs.push({
              serie: occ.serie || undefined,
              nOcc: occ.nOcc,
              dEmi: dateISO(occ.dEmi),
              emiOcc: {
                CNPJ: occ.CNPJ,
                IE: occ.IE,
                UF: occ.UF,
              },
            });
          }

          infModal.rodo.occ = occs;
        }
      } else if (ide.tpServ === 0 && ide.modal === 2) {
        // tpServ: 0 - Normal e modal 2 - Aéreo
        infModal.aereo = {};
        infModal.aereo.nOCA = this._cte.nOCA || undefined;
        infModal.aereo.dPrevAereo = dateISO(this._cte.dPrevAereo);
        infModal.aereo.natCarga = this._cte.modal;

        const tarifa = compCalc[0];
        const vTar = tarifa.vTar;
        let cl = tarifa.CL;

        const tpTar = desacentuar(cl.toUpperCase());
        cl = padLeft(tpTar, 1);

        if (!['M', 'G', 'E'].includes(cl)) {
          if (tpTar.includes('MINIM')) {
            cl = 'M';
          } else if (tpTar.includes('ESPECIFIC')) {
            cl = 'E';
          } else {
            cl = 'G';
          }
        }

        infModal.aereo.tarifa = {
          CL: cl,
          cTar: this._cte.cTar.toString(),
          vTar: '##' + vTar.toFixed(2) + '##',
        };

        infCteNorm.infModal = infModal;

        if (this.indGlobalizado) {
          infCteNorm.infGlobalizado = {xObs: 'Procedimento efetuado conforme Resolução/SEFAZ n. 2.833/2017'}
        }
      }

      infCte.infCTeNorm = infCteNorm;
    }

    // tpCTe = 1 - Tag infCteComp: CT-e de complento de valores não implementado
    // tpCTe = 2 - Tag infCteAnu: Detalhamento do CT-e do tipo Anulação não implementado

    // parei aki

    saveLog({
      level: 'ApiCTe - LOG4',
      messsage: 'Informações do objeto infCte (parcial) - ApiCTe finalizado!',
      meta: infCte,
    });

    return infCte;

    saveLog({
      level: 'ApiCTe - LOG4',
      messsage: 'Informações do objeto infCte (parcial) - ApiCTe não finalizado!',
      meta: infCte,
    });
  }

  _infoIndGlobalizado() {
    let qtdeDocs = 0;

    if (this._cte.tipo_doc_anexo === 2) {
      // Tipo de Documento anexo ao CTe é NFe
      qtdeDocs = this._cte.anexos.docs.length();
    }

    if (
      this._cte.tpCTe === 0 &&
      this._cte.tpServ === 0 &&
      qtdeDocs > 4 &&
      this._cte.UFIni === this._cte.UFFim
    ) {
      // tpCTe Normal e tpServ Normal e qtde NFes anexos > 4 e transporte dentro do mesmo estado

      const nfes = this._cte.anexos.docs;
      const remetentes = [];
      const destinatarios = [];

      for (const nfe of nfes) {
        const cnpj = nfe.chave.slice(6, 20);
        if (cnpj === this._cte.rem_doc && !remetentes.includes(cnpj)) {
          remetentes.push(cnpj);
        } else if (cnpj === this._cte.des_doc && !destinatarios.includes(cnpj)) {
          destinatarios.push(cnpj);
        }

        if (
          (this._cte.cte_tomador === 3 && remetentes.length > 4) ||
          (this._cte.cte_tomador === 0 &&
            remetentes.length === 1 &&
            this._cte.des_xNome.trim() === 'DIVERSOS' &&
            this._cte.des_doc === this._cte.emi_cnpj)
        ) {
          // Tomador: 3 - Destinatário, o número de CNPJ diferentes nas chaves emitidas pelos Remententes são maior que 4 ou
          // Tomador: 0 - Remetente, todas as NFes são do mesmo emitente (remetente) e tem vários destinatários

          return true;
        }
      }
    }

    return false;
  }
}

module.exports = { ApiCTe };
