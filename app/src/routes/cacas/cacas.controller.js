import { serverPool } from '../../server_init.js';
import sql from 'mssql';
import { GenerateMap  } from '../../service/generateMap.service.js';

export async function getCacas(req, res) {
    console.log('getCacas');
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
            o.tipo = 'caca'
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

export async function getCacasById(req, res) {
    console.log('getCacasById');
    try {
        const cacaId = Number(req.params.id); // String
        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, cacaId);

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
            o.tipo = 'caca' AND ocorrencia_id = @OcorrenciaId
        `;

        const ocorrencias = await request.query(query);
        const result = ocorrencias.recordset;
        if (result.length > 0) {
            return res.status(200).json(result[0]);
        } else {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export async function postCaca(req, res) {
    console.log('postCaca');
    try {
        const cacaToSave = req.body;
        const usuario = req.user;

        if (!usuario || !usuario.usuario_id) {
            return res.status(400).json({ message: 'usuario não encontrado' });
        }

        if (!cacaToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!cacaToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        // GERA MAPA BASEADO NA LATITUDE.
        const base64ImageStr = await GenerateMap(cacaToSave.latitude, cacaToSave.longitude);

        const request = new sql.Request(serverPool.pool);
        request.input('UsuarioId', sql.Int, usuario.usuario_id);
        request.input('Tipo', sql.VarChar, 'caca');
        request.input('Latitude', sql.Decimal(8, 6), cacaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), cacaToSave.longitude);
        request.input('Mapa', sql.VarChar, base64ImageStr);
        const ocorrencias = await request.query('INSERT INTO ocorrencias(usuario_id, tipo, latitude, longitude, mapa) OUTPUT INSERTED.* VALUES (@UsuarioId, @Tipo, @Latitude, @Longitude, @Mapa)');

        const createdCaca = {
            ...ocorrencias.recordset[0],
        }

        return res.status(200).json(createdCaca);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function putCaca(req, res) {
    console.log('putCaca');
    try {
        const cacaId = Number(req.params.id);
        const cacaToSave = req.body;
        const usuario = req.user;

        if (!usuario || !usuario.usuario_id) {
            return res.status(400).json({ message: 'usuario não encontrado' });
        }

        if (!cacaToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!cacaToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, cacaId);
        const cacas = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'caca\' AND ocorrencia_id = @OcorrenciaId');
        if (cacas.recordset.length === 0) {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

        if (cacas.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível atualizar um registo que não é dono'});
        }

        // Verifica se a mapa é ser regenerado.
        const latitude = cacas.recordset[0].latitude;
        const longitude = cacas.recordset[0].longitude;

        const changedPosition = latitude !== cacaToSave.latitude || longitude !== cacaToSave.longitude;
        let newMapa = '';
        if (changedPosition) {
            newMapa = await GenerateMap(cacaToSave.latitude, cacaToSave.longitude); 
        }


        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, cacaId);
        request.input('Tipo', sql.VarChar, 'caca');
        request.input('Latitude', sql.Decimal(8, 6), cacaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), cacaToSave.longitude);
        
        if (changedPosition) {
            request.input('Mapa', sql.VarChar, newMapa);
        }

        const query =
            changedPosition
            ? 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude, mapa = @Mapa OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'
            : 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'

        const ocorrencias = await request.query(query); 

        const updatedCaca = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(updatedCaca);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function patchCaca(req, res) {
    console.log('patchCaca');
    try {
        const cacaId = Number(req.params.id);
        const fieldsToSave = req.body;
        const usuario = req.user;

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, cacaId);
        const cacas = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'caca\' AND ocorrencia_id = @OcorrenciaId');
        if (cacas.recordset.length === 0) {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

        if (cacas.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível atualizar um registo que não é dono'});
        }

        const cacaToSave = {
            id: cacaId,
            ...cacas.recordset[0],
            ...fieldsToSave
        };

        const latitude = cacas.recordset[0].latitude;
        const longitude = cacas.recordset[0].longitude;

        const changedPosition = latitude !== cacaToSave.latitude || longitude !== cacaToSave.longitude;
        let newMapa = '';
        if (changedPosition) {
            newMapa = await GenerateMap(cacaToSave.latitude, cacaToSave.longitude); 
        }

        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, cacaId);
        request.input('Tipo', sql.VarChar, 'caca');
        request.input('Latitude', sql.Decimal(8, 6), cacaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), cacaToSave.longitude);

        if (changedPosition) {
            request.input('Mapa', sql.VarChar, newMapa);
        }

        const query =
            changedPosition
            ? 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude, mapa = @Mapa OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'
            : 'UPDATE ocorrencias SET tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE ocorrencia_id = @OcorrenciaId'

        const ocorrencias = await request.query(query); 

        const updatedCaca = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(updatedCaca);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteCaca(req, res) {
    console.log('deleteCaca');
    try {
        const cacaId = Number(req.params.id); 
        const requestId = new sql.Request(serverPool.pool);
        requestId.input('OcorrenciaId', sql.Int, cacaId);
        const cacas = await requestId.query('SELECT * FROM [dbo].ocorrencias where tipo = \'caca\' AND ocorrencia_id = @OcorrenciaId');
        if (cacas.recordset.length === 0) {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

        if (cacas.recordset[0].usuario_id !== usuario.usuario_id) {
            return res.status(401).json({message: 'Não é possível remover um registo que não é dono'});
        }

        const request = new sql.Request(serverPool.pool);
        request.input('OcorrenciaId', sql.Int, cacaId);
        const ocorrencias = await request.query('DELETE FROM [dbo].ocorrencia OUTPUT DELETED.* where ocorrencia_id = @OcorrenciaId')

        const deletedCaca = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(deletedCaca);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}
