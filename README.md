# ApiTmsCloud

## Este projeto consiste em uma API de integração entre o sistema web em PHP TMS.Cloud (legado) e a API de emissão de Documentos Fiscais da Nuvem Fiscal para emissão de CTes e MDFes.

# Tecnologias Usadas

## Backend


- <a href="https://nodejs.org/en/"> NodeJS</a><img align="center" alt="NodeJS" height="20" width="30" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg">
- <a href="https://expressjs.com/">Express</a><img align="center" alt="Express" height="20" width="30" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg">


## Database

- <a href="https://www.mysql.com/">MySQL</a><img align="center" alt="MySQL" height="20" width="30" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg">

<br>

# Como usar

### Primeiro, nós precisamos clocar ou baixar este repositório.

```bash
#Command to clone the repository

$ git clone https://github.com/nilton-medeiros/apiTmsCloud.git
```

### Após clonar o repositório, será necessário criar dois banco de dados MySQL/MariaDB juntamenteo com as conlunas necessárias.

```bash
#Command to create a database in the MySQL terminal:

$ CREATE DATABASE database_name1;
$ CREATE DATABASE database_name2;
```

### Em seguida, é necessário criar a tabela "ctes" em ambos os bancos que será usada pelo aplicativo.


```bash
#Command to create the table with its columns

$ CREATE TABLE ctes(
    cte_id INT PRIMARY KEY AUTO_INCREMENT,
    referencia_uuid CHAR(36) NOT NULL UNIQUE,
    ... <demais campos que compõem um CTe>,
    created_at VARCHAR(45) NOT NULL
);

#Commando para criar tabelas filhas de documentos anexos ao CTe
#ctes_obs_contr_fisco
$ CREATE TABLE ctes_obs_contr_fisco (
	cte_ocf_id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'De 0 a 10 observações por CT-e limitada pela aplicação ou por trigger',
	cte_id INT(10) UNSIGNED NOT NULL,
	cte_ocf_interessado ENUM('CONTRIBUINTE','FISCO') NOT NULL COMMENT 'Observação do interesse do Contribuinte ou Fisco' COLLATE 'utf8_general_ci',
	cte_ocf_titulo VARCHAR(20) NOT NULL COMMENT 'Identificação do campo' COLLATE 'utf8_general_ci',
	cte_ocf_texto VARCHAR(160) NOT NULL COMMENT 'Conteúdo do campo (qdo cte_ocf_interessado = \'CONTRIBUINTE\', limite 160, qdo \'FISCO\', limite de 60)' COLLATE 'utf8_general_ci',
	PRIMARY KEY (cte_ocf_id) USING BTREE,
	INDEX FK_ctes_obs_contr_fisco_ctes_cte_id (cte_id) USING BTREE,
	CONSTRAINT FK_ctes_obs_contr_fisco_ctes_cte_id FOREIGN KEY (cte_id) REFERENCES ctes (cte_id) ON UPDATE CASCADE ON DELETE CASCADE
)
COMMENT='Campo de uso livre do contribuinte (0 a 10 por CT-e)'
COLLATE='utf8_general_ci'
ENGINE=InnoDB;


#ctes_comp_calculo
CREATE TABLE ctes_comp_calculo (
	ccc_id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID do componente cte da composição do calculo',
	cte_id INT(10) UNSIGNED NOT NULL COMMENT 'ID do CT-e pai',
	cc_id INT(10) UNSIGNED NOT NULL COMMENT 'Componete do frete da tabela de composição de cálculo',
	ccc_valor DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT '0.00' COMMENT 'Valor calculado do componente como fretes, seguro, redespacho ou taxa',
	ccc_exibir_valor_dacte TINYINT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Exibir ou não na composição do frete na DACTE mesmo quando for zero.',
	ccc_tipo_tarifa VARCHAR(200) NOT NULL COMMENT 'Tipo de tarifa; Modal Aéreo: Geral, Específica ou Mínima; Modal Rodoviário: Normal ou Frete-Peso Mínimo' COLLATE 'utf8_general_ci',
	ccc_valor_tarifa_kg DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT '0.00' COMMENT 'Valor da tarifa por Kg.',
	ccc_tabela VARCHAR(20) NOT NULL COMMENT 'Informativo: Se foi usado a tabela do Tomador ou a de Todos e se foi aplicado desconto' COLLATE 'utf8_general_ci',
	ccc_tipo_advalorem ENUM('1 - Normal','2 - Valor dobrado','3 - 3% do valor da mercadoria') NULL DEFAULT NULL COMMENT 'Tipo do Ad Valorem: 1 - Normal, 2 - Valor dobrado, 3 - 3% do valor da mercadoria' COLLATE 'utf8_general_ci',
	ccc_percentual_desconto TINYINT(2) UNSIGNED NULL DEFAULT '0' COMMENT 'Percentual de desconto sobre o componente do cálculo da composição do frete',
	ccc_valor_desconto DECIMAL(8,2) UNSIGNED NOT NULL DEFAULT '0.00',
	ccc_exibir_desconto_dacte TINYINT(1) UNSIGNED NOT NULL DEFAULT '1' COMMENT 'Exibir ou não no campo observação da DACTE.',
	ccc_titulo VARCHAR(60) NOT NULL COMMENT 'Título do componente.' COLLATE 'utf8_general_ci',
	PRIMARY KEY (ccc_id) USING BTREE,
	INDEX FK_ctes_comp_calculo_cte_id (cte_id) USING BTREE,
	INDEX FK_ctes_comp_calculo_cc_id (cc_id) USING BTREE,
	CONSTRAINT FK_ctes_comp_calculo_cc_id FOREIGN KEY (cc_id) REFERENCES composicao_calculo (cc_id) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT FK_ctes_comp_calculo_cte_id FOREIGN KEY (cte_id) REFERENCES ctes (cte_id) ON UPDATE CASCADE ON DELETE CASCADE
)
COMMENT='Componentes do valor da prestação do CT-e.'
COLLATE='utf8_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=399635;

```

### Na raiz do projeto, haverá um arquivo chamado ".env.example", que contém 6 campos que deverão ser preenchidos em um arquivo chamado ".env", basta criar esse arquivo ou renomear o arquivo de exemplo. Depois disso, basta preencher os campos com os dados relacionados ao seu banco de dados.

```bash
ACCESS_TOKEN= [Token de acesso da credencial para consumir esta API]
PORT= [Porta em que o servidor será executado]
MYSQL_HOST= [O host de seu computador, por padrão, é 'localhost']
MYSQL_DB1= [Nome do primeiro banco de dados 'ctedb_1', criado anteriormente.]
MYSQL_DB2= [Nome do segundo, banco de dados 'ctedb_2', criado anteriormente.]
MYSQL_USER= [Não usado neste projeto, pois o nome do usuário é o mesmo nome do banco de dados 'MYSQL_DB?[1 ou 2]'
MYSQL_PASSWORD= [A senha que você escolheu ao instalar o MySQL]
```

### Antes de iniciar o aplicativo, precisamos instalar os "node_modules" e, para isso, basta abrir um terminal na pasta "apiTmsCloud" (é recomendável usar o terminal do editor/IDE).

```bash
#Command to download the 'node_modules'

$ npm install
```

### Finalmente, acho que é só isso, este projeto está em fase embrionária.

```bash
#Commando para iniciar o servidor.

$ npm start
```

<br>

# Credits to

### Nilton G. Medeiros

- <a href="https://github.com/nilton-medeiros"> GitHub

