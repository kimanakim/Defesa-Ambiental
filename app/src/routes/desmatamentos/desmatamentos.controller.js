import { serverPool } from '../../server_init.js';
import sql from 'mssql';
import { GenerateMap  } from '../../service/generateMap.service.js';

export async function getDesmatamentos(req, res) {
    console.log('getDesmatamentos');
    try {
        const request = new sql.Request(serverPool.pool);
        const query = `
            SELECT
                o.ocorrencia_id,
                o.tipo,
                o.latitude,
                o.longitude,
                u.usuario_id,
                u.usuario,
                u.tipo as usuario_tipo
            FROM [dbo].ocorrencias o
            INNER JOIN [dbo].usuarios u
            ON o.usuario_id = u.usuario_id
            WHERE
            o.tipo = 'desmatamento'
        `;
        const ocorrencias = await request.query(query);

        const ocorreciasArray = ocorrencias.recordset;
        ocorreciasArray.sort((o1, o2) => {
            if (o1.usuario_tipo === o2.usuario_tipo)
                return 0;

            if (o1.usuario_tipo === 'defesa_civil')
                return -1;

            if (o2.usuario_tipo === 'defesa_civil')
                return 1;
        })

        return res.status(200).json(ocorreciasArray);
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export async function getDesmatamentosById(req, res) {
    console.log('getDesmatamentosById');
    try {
        const desmatamentoId = Number(req.params.id); // String
        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, desmatamentoId);

        const query = `
            SELECT
                o.ocorrencia_id,
                o.tipo,
                o.latitude,
                o.longitude,
                o.mapa,
                u.usuario_id,
                u.usuario
            FROM [dbo].ocorrencias o
            INNER JOIN [dbo].usuarios u
            ON o.usuario_id = u.usuario_id
            WHERE
            o.tipo = 'desmatamento' AND ocorrencia_id = @OcorrenciaId
        `;

        const ocorrencias = await request.query(query);
        const result = ocorrencias.recordset;
        if (result.length > 0) {
            return res.status(200).json(result[0]);
        } else {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export async function postDesmatamento(req, res) {
    console.log('postDesmatamento');
    try {
        const desmatamentoToSave = req.body;
        const usuario = req.user;

        if (!usuario || !usuario.usuario_id) {
            return res.status(400).json({ message: 'usuario não encontrado' });
        }

        if (!desmatamentoToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!desmatamentoToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        // GERA MAPA BASEADO NA LATITUDE.
        const base64ImageStr = await GenerateMap(desmatamentoToSave.latitude, desmatamentoToSave.longitude);

        const request = new sql.Request(serverPool.pool);
        request.input('UsuarioId', sql.Int, usuario.usuario_id);
        request.input('Tipo', sql.VarChar, 'desmatamento');
        request.input('Latitude', sql.Decimal(8, 6), desmatamentoToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), desmatamentoToSave.longitude);
        request.input('Mapa', sql.VarChar, base64ImageStr);
        const ocorrencias = await request.query('INSERT INTO ocorrencias(usuario_id, tipo, latitude, longitude, mapa) OUTPUT INSERTED.* VALUES (@UsuarioId, @Tipo, @Latitude, @Longitude, @Mapa)');

        const createdDesmatamento = {
            ...ocorrencias.recordset[0],
        }

        return res.status(200).json(createdDesmatamento);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function putDesmatamento(req, res) {
    console.log('putDesmatamento');
    try {
        const desmatamentoId = Number(req.params.id);
        const desmatamentoToSave = req.body;
        const usuario = req.user;

        if (!usuario || !usuario.usuario_id) {
            return res.status(400).json({ message: 'usuario não encontrado' });
        }

        if (!desmatamentoToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!desmatamentoToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, desmatamentoId);
        const desmatamentos = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'desmatamento\' AND ocorrencia_id = @OcorrenciaId');
        if (desmatamentos.recordset.length === 0) {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

        if (desmatamentos.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível atualizar um registo que não é dono'});
        }

        // Verifica se a mapa é ser regenerado.
        const latitude = desmatamentos.recordset[0].latitude;
        const longitude = desmatamentos.recordset[0].longitude;

        const changedPosition = latitude !== desmatamentoToSave.latitude || longitude !== desmatamentoToSave.longitude;
        let newMapa = '';
        if (changedPosition) {
            newMapa = await GenerateMap(desmatamentoToSave.latitude, desmatamentoToSave.longitude); 
        }


        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, desmatamentoId);
        request.input('Tipo', sql.VarChar, 'desmatamento');
        request.input('Latitude', sql.Decimal(8, 6), desmatamentoToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), desmatamentoToSave.longitude);
        
        if (changedPosition) {
            request.input('Mapa', sql.VarChar, newMapa);
        }

        const query =
            changedPosition
            ? 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude, mapa = @Mapa OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'
            : 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'

        const ocorrencias = await request.query(query); 

        const updatedDesmatamento = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(updatedDesmatamento);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function patchDesmatamento(req, res) {
    console.log('patchDesmatamento');
    try {
        const desmatamentoId = Number(req.params.id);
        const fieldsToSave = req.body;
        const usuario = req.user;

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, desmatamentoId);
        const desmatamentos = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'desmatamento\' AND ocorrencia_id = @OcorrenciaId');
        if (desmatamentos.recordset.length === 0) {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

        if (desmatamentos.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível atualizar um registo que não é dono'});
        }

        const desmatamentoToSave = {
            id: desmatamentoId,
            ...desmatamentos.recordset[0],
            ...fieldsToSave
        };

        const latitude = desmatamentos.recordset[0].latitude;
        const longitude = desmatamentos.recordset[0].longitude;

        const changedPosition = latitude !== desmatamentoToSave.latitude || longitude !== desmatamentoToSave.longitude;
        let newMapa = '';
        if (changedPosition) {
            newMapa = await GenerateMap(desmatamentoToSave.latitude, desmatamentoToSave.longitude); 
        }

        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, desmatamentoId);
        request.input('Tipo', sql.VarChar, 'desmatamento');
        request.input('Latitude', sql.Decimal(8, 6), desmatamentoToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), desmatamentoToSave.longitude);

        if (changedPosition) {
            request.input('Mapa', sql.VarChar, newMapa);
        }

        const query =
            changedPosition
            ? 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude, mapa = @Mapa OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'
            : 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'

        const ocorrencias = await request.query(query); 

        const updatedDesmatamento = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(updatedDesmatamento);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteDesmatamento(req, res) {
    console.log('deleteDesmatamento');
    try {
        const desmatamentoId = Number(req.params.id); 
        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, desmatamentoId);
        const desmatamentos = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'desmatamento\' AND ocorrencia_id = @OcorrenciaId');
        if (desmatamentos.recordset.length === 0) {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

        if (desmatamentos.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível remover um registo que não é dono'});
        }

        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, desmatamentoId);
        const ocorrencias = await request.query('DELETE FROM [dbo].ocorrencia OUTPUT DELETED.* where ocorrencia_id = @OcorrenciaId')

        const deletedDesmatamento = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(deletedDesmatamento);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
