import { serverPool } from '../../server_init.js';
import sql from 'mssql';

export async function getQueimadas(req, res) {
    console.log('getQueimadas');
    try {
        const request = new sql.Request(serverPool.pool);
        const ocorrencias = await request.query('SELECT * FROM [dbo].ocorrencia where tipo = \'queimadas\'');
        return res.status(200).json(ocorrencias.recordset);
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export async function getQueimadasById(req, res) {
    console.log('getQueimadasById');
    try {
        const queimadaId = Number(req.params.id); // String
        const queimada = queimadas.find(q => q.id === queimadaId);
        const request = new sql.Request(serverPool.pool);
        request.input('UsuarioId', sql.Int, queimadaId);
        const ocorrencias = await request.query('SELECT * FROM [dbo].ocorrencia where tipo = \'queimadas\' AND usuario_id = @UsuarioId');
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

        if (!queimadaToSave.usuario) {
            return res.status(400).json({ message: 'Usuario nao encontrado' });
        }

        if (!queimadaToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!queimadaToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Usuario', sql.VarChar, queimadaToSave.usuario);
        request.input('Tipo', sql.VarChar, 'queimadas');
        request.input('Latitude', sql.Decimal(8, 6), queimadaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), queimadaToSave.longitude);
        const ocorrencias = await request.query('INSERT INTO ocorrencia(usuario, tipo, latitude, longitude) OUTPUT INSERTED.* VALUES (@Usuario, @Tipo, @Latitude, @Longitude)');

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

        if (!queimadaToSave.usuario) {
            return res.status(400).json({ message: 'Usuario nao encontrado' });
        }

        if (!queimadaToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!queimadaToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('UsuarioId', sql.Int, queimadaId);
        const queimadas = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'queimadas\' AND usuario_id = @UsuarioId');
        if (queimadas.recordset.length === 0) {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, queimadaId);
        request.input('Usuario', sql.VarChar, queimadaToSave.usuario);
        request.input('Tipo', sql.VarChar, 'queimadas');
        request.input('Latitude', sql.Decimal(8, 6), queimadaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), queimadaToSave.longitude);
        const ocorrencias = await request.query('UPDATE ocorrencia SET usuario = @Usuario, tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE usuario_id = @Id'); 

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

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('UsuarioId', sql.Int, queimadaId);
        const queimadas = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'queimadas\' AND usuario_id = @UsuarioId');
        if (queimadas.recordset.length === 0) {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

        const queimadaToSave = {
            id: queimadaId,
            ...queimadas.recordset[0],
            ...fieldsToSave
        };

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, queimadaId);
        request.input('Usuario', sql.VarChar, queimadaToSave.usuario);
        request.input('Tipo', sql.VarChar, 'queimadas');
        request.input('Latitude', sql.Decimal(8, 6), queimadaToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), queimadaToSave.longitude);
        const ocorrencias = await request.query('UPDATE ocorrencia SET usuario = @Usuario, tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE usuario_id = @Id'); 

        const updatedQueimada = {
            ...ocorrencias.recordset[0]
        };

        console.log('updatedQueimada', updatedQueimada);

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
        requestId.input('UsuarioId', sql.Int, queimadaId);
        const queimadas = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'queimadas\' AND usuario_id = @UsuarioId');
        if (queimadas.recordset.length === 0) {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, queimadaId);
        const ocorrencias = await request.query('DELETE FROM [dbo].ocorrencia OUTPUT DELETED.* where usuario_id = @Id')

        const deletedQueimada = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(deletedQueimada);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}