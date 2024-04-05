async function getEmailsCTe(connection, idsCTe) {
    const result = [
        {name: 'tomador', id: idsCTe.tomId, email: ''},
        {name: 'remetente', id: idsCTe.remId, email: ''},
        {name: 'destinatario', id: idsCTe.desId, email: ''},
        {name: 'expedidor', id: idsCTe.expId, email: ''},
        {name: 'recebedor', id: idsCTe.recId, email: ''}
    ];

    let sql;

    for (const clie of result) {
        if (clie.id) {
            sql = 'SELECT con_email_cte as email FROM clientes_contatos ';
            sql += `WHERE clie_id = ${clie.id} AND `;
            sql += 'NOT ISNULL(con_email_cte) AND con_email_cte != \'\' AND ';
            sql += 'LOCATE(\'.\', con_email_cte, LOCATE(\'@\', con_email_cte)) > 0 ';
            sql += 'LIMIT 1';
            const [contato] = await connection.execute(sql);
            if (contato.length > 0) {
                clie.email = contato[0].email;
            }
        }
    }

    return result;
}

module.exports = getEmailsCTe;