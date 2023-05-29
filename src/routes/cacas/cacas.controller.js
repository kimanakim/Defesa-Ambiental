import { serverPool } from '../../server_init.js';
import sql from 'mssql';

export async function getCacas(req, res) {
    console.log('getCacas');
    try {
        const request = new sql.Request(serverPool.pool);
        const ocorrencias = await request.query('SELECT * FROM [dbo].ocorrencia where tipo = \'cacas\'');
        return res.status(200).json(ocorrencias.recordset);
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export async function getCacasById(req, res) {
    console.log('getCacasById');
    try {
        const cacaId = Number(req.params.id); // String
        const caca = cacas.find(q => q.id === cacaId);
        const request = new sql.Request(serverPool.pool);
        request.input('UsuarioId', sql.Int, cacaId);
        const ocorrencias = await request.query('SELECT * FROM [dbo].ocorrencia where tipo = \'cacas\' AND usuario_id = @UsuarioId');
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

        if (!cacaToSave.usuario) {
            return res.status(400).json({ message: 'Usuario nao encontrado' });
        }

        if (!cacaToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!cacaToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Usuario', sql.VarChar, cacaToSave.usuario);
        request.input('Tipo', sql.VarChar, 'cacas');
        request.input('Latitude', sql.Decimal(8, 6), cacaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), cacaToSave.longitude);
        const ocorrencias = await request.query('INSERT INTO ocorrencia(usuario, tipo, latitude, longitude) OUTPUT INSERTED.* VALUES (@Usuario, @Tipo, @Latitude, @Longitude)');

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

        if (!cacaToSave.usuario) {
            return res.status(400).json({ message: 'Usuario nao encontrado' });
        }

        if (!cacaToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!cacaToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('UsuarioId', sql.Int, cacaId);
        const cacas = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'cacas\' AND usuario_id = @UsuarioId');
        if (cacas.recordset.length === 0) {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, cacaId);
        request.input('Usuario', sql.VarChar, cacaToSave.usuario);
        request.input('Tipo', sql.VarChar, 'cacas');
        request.input('Latitude', sql.Decimal(8, 6), cacaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), cacaToSave.longitude);
        const ocorrencias = await request.query('UPDATE ocorrencia SET usuario = @Usuario, tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE usuario_id = @Id'); 

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

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('UsuarioId', sql.Int, cacaId);
        const cacas = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'cacas\' AND usuario_id = @UsuarioId');
        if (cacas.recordset.length === 0) {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

        const cacaToSave = {
            id: cacaId,
            ...cacas.recordset[0],
            ...fieldsToSave
        };

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, cacaId);
        request.input('Usuario', sql.VarChar, cacaToSave.usuario);
        request.input('Tipo', sql.VarChar, 'cacas');
        request.input('Latitude', sql.Decimal(8, 6), cacaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), cacaToSave.longitude);
        const ocorrencias = await request.query('UPDATE ocorrencia SET usuario = @Usuario, tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE usuario_id = @Id'); 

        const updatedCaca = {
            ...ocorrencias.recordset[0]
        };

        console.log('updatedCaca', updatedCaca);

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
        requestId.input('UsuarioId', sql.Int, cacaId);
        const cacas = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'cacas\' AND usuario_id = @UsuarioId');
        if (cacas.recordset.length === 0) {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, cacaId);
        const ocorrencias = await request.query('DELETE FROM [dbo].ocorrencia OUTPUT DELETED.* where usuario_id = @Id')

        const deletedCaca = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(deletedCaca);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}