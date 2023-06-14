import { serverPool } from '../../server_init.js';
import sql from 'mssql';
import { GenerateMap  } from '../../service/generateMap.service.js';

export async function getQueimadas(req, res) {
    console.log('getQueimadas');
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
            o.tipo = 'queimadas'
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

export async function getQueimadasById(req, res) {
    console.log('getQueimadasById');
    try {
        const queimadaId = Number(req.params.id); // String
        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, queimadaId);

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
            o.tipo = 'queimadas' AND ocorrencia_id = @OcorrenciaId
        `;

        const ocorrencias = await request.query(query);
        const result = ocorrencias.recordset;
        if (result.length > 0) {
            return res.status(200).json(result[0]);
        } else {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export async function postQueimada(req, res) {
    console.log('postQueimada');
    try {
        const queimadaToSave = req.body;
        const usuario = req.user;

        if (!usuario || !usuario.usuario_id) {
            return res.status(400).json({ message: 'usuario não encontrado' });
        }

        if (!queimadaToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!queimadaToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        // GERA MAPA BASEADO NA LATITUDE.
        const base64ImageStr = await GenerateMap(queimadaToSave.latitude, queimadaToSave.longitude);

        const request = new sql.Request(serverPool.pool);
        request.input('UsuarioId', sql.Int, usuario.usuario_id);
        request.input('Tipo', sql.VarChar, 'queimadas');
        request.input('Latitude', sql.Decimal(8, 6), queimadaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), queimadaToSave.longitude);
        request.input('Mapa', sql.VarChar, base64ImageStr);
        const ocorrencias = await request.query('INSERT INTO ocorrencias(usuario_id, tipo, latitude, longitude, mapa) OUTPUT INSERTED.* VALUES (@UsuarioId, @Tipo, @Latitude, @Longitude, @Mapa)');

        const createdQueimada = {
            ...ocorrencias.recordset[0],
        }

        return res.status(200).json(createdQueimada);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function putQueimada(req, res) {
    console.log('putQueimada');
    try {
        const queimadaId = Number(req.params.id);
        const queimadaToSave = req.body;
        const usuario = req.user;

        if (!usuario || !usuario.usuario_id) {
            return res.status(400).json({ message: 'usuario não encontrado' });
        }

        if (!queimadaToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!queimadaToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, queimadaId);
        const queimadas = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'queimada\' AND ocorrencia_id = @OcorrenciaId');
        if (queimadas.recordset.length === 0) {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

        if (queimadas.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível atualizar um registo que não é dono'});
        }

        // Verifica se a mapa é ser regenerado.
        const latitude = queimadas.recordset[0].latitude;
        const longitude = queimadas.recordset[0].longitude;

        const changedPosition = latitude !== queimadaToSave.latitude || longitude !== queimadaToSave.longitude;
        let newMapa = '';
        if (changedPosition) {
            newMapa = await GenerateMap(queimadaToSave.latitude, queimadaToSave.longitude); 
        }


        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, queimadaId);
        request.input('Tipo', sql.VarChar, 'queimadas');
        request.input('Latitude', sql.Decimal(8, 6), queimadaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), queimadaToSave.longitude);
        
        if (changedPosition) {
            request.input('Mapa', sql.VarChar, newMapa);
        }

        const query =
            changedPosition
            ? 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude, mapa = @Mapa OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'
            : 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'

        const ocorrencias = await request.query(query); 

        const updatedQueimada = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(updatedQueimada);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function patchQueimada(req, res) {
    console.log('patchQueimada');
    try {
        const queimadaId = Number(req.params.id);
        const fieldsToSave = req.body;
        const usuario = req.user;

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, queimadaId);
        const queimadas = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'queimada\' AND ocorrencia_id = @OcorrenciaId');
        if (queimadas.recordset.length === 0) {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

        if (queimadas.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível atualizar um registo que não é dono'});
        }

        const queimadaToSave = {
            id: queimadaId,
            ...queimadas.recordset[0],
            ...fieldsToSave
        };

        const latitude = queimadas.recordset[0].latitude;
        const longitude = queimadas.recordset[0].longitude;

        const changedPosition = latitude !== queimadaToSave.latitude || longitude !== queimadaToSave.longitude;
        let newMapa = '';
        if (changedPosition) {
            newMapa = await GenerateMap(queimadaToSave.latitude, queimadaToSave.longitude); 
        }

        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, queimadaId);
        request.input('Tipo', sql.VarChar, 'queimadas');
        request.input('Latitude', sql.Decimal(8, 6), queimadaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), queimadaToSave.longitude);

        if (changedPosition) {
            request.input('Mapa', sql.VarChar, newMapa);
        }

        const query =
            changedPosition
            ? 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude, mapa = @Mapa OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'
            : 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'

        const ocorrencias = await request.query(query); 

        const updatedQueimada = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(updatedQueimada);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteQueimada(req, res) {
    console.log('deleteQueimada');
    try {
        const queimadaId = Number(req.params.id); 
        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, queimadaId);
        const queimadas = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'queimada\' AND ocorrencia_id = @OcorrenciaId');
        if (queimadas.recordset.length === 0) {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

        if (queimadas.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível remover um registo que não é dono'});
        }

        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, queimadaId);
        const ocorrencias = await request.query('DELETE FROM [dbo].ocorrencia OUTPUT DELETED.* where ocorrencia_id = @OcorrenciaId')

        const deletedQueimada = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(deletedQueimada);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
