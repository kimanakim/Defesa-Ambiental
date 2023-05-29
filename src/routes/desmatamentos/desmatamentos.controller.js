import { serverPool } from '../../server_init.js';
import sql from 'mssql';

export async function getDesmatamentos(req, res) {
    console.log('getDesmatamentos');
    try {
        const request = new sql.Request(serverPool.pool);
        const ocorrencias = await request.query('SELECT * FROM [dbo].ocorrencia where tipo = \'desmatamentos\'');
        return res.status(200).json(ocorrencias.recordset);
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export async function getDesmatamentosById(req, res) {
    console.log('getDesmatamentosById');
    try {
        const desmatamentoId = Number(req.params.id); // String
        const desmatamento = desmatamentos.find(q => q.id === desmatamentoId);
        const request = new sql.Request(serverPool.pool);
        request.input('UsuarioId', sql.Int, desmatamentoId);
        const ocorrencias = await request.query('SELECT * FROM [dbo].ocorrencia where tipo = \'desmatamentos\' AND usuario_id = @UsuarioId');
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

        if (!desmatamentoToSave.usuario) {
            return res.status(400).json({ message: 'Usuario nao encontrado' });
        }

        if (!desmatamentoToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!desmatamentoToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Usuario', sql.VarChar, desmatamentoToSave.usuario);
        request.input('Tipo', sql.VarChar, 'desmatamentos');
        request.input('Latitude', sql.Decimal(8, 6), desmatamentoToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), desmatamentoToSave.longitude);
        const ocorrencias = await request.query('INSERT INTO ocorrencia(usuario, tipo, latitude, longitude) OUTPUT INSERTED.* VALUES (@Usuario, @Tipo, @Latitude, @Longitude)');

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

        if (!desmatamentoToSave.usuario) {
            return res.status(400).json({ message: 'Usuario nao encontrado' });
        }

        if (!desmatamentoToSave.latitude) {
            return res.status(400).json({ message: 'latitude incorreta' });
        }

        if (!desmatamentoToSave.longitude) {
            return res.status(400).json({ message: 'longitude incorreta' });
        }

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('UsuarioId', sql.Int, desmatamentoId);
        const desmatamentos = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'desmatamentos\' AND usuario_id = @UsuarioId');
        if (desmatamentos.recordset.length === 0) {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, desmatamentoId);
        request.input('Usuario', sql.VarChar, desmatamentoToSave.usuario);
        request.input('Tipo', sql.VarChar, 'desmatamentos');
        request.input('Latitude', sql.Decimal(8, 6), desmatamentoToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), desmatamentoToSave.longitude);
        const ocorrencias = await request.query('UPDATE ocorrencia SET usuario = @Usuario, tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE usuario_id = @Id'); 

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

        const requestId = new sql.Request(serverPool.pool);
        requestId.input('UsuarioId', sql.Int, desmatamentoId);
        const desmatamentos = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'desmatamentos\' AND usuario_id = @UsuarioId');
        if (desmatamentos.recordset.length === 0) {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

        const desmatamentoToSave = {
            id: desmatamentoId,
            ...desmatamentos.recordset[0],
            ...fieldsToSave
        };

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, desmatamentoId);
        request.input('Usuario', sql.VarChar, desmatamentoToSave.usuario);
        request.input('Tipo', sql.VarChar, 'desmatamentos');
        request.input('Latitude', sql.Decimal(8, 6), desmatamentoToSave.latitude);
        request.input('Longitude', sql.Decimal(9, 6), desmatamentoToSave.longitude);
        const ocorrencias = await request.query('UPDATE ocorrencia SET usuario = @Usuario, tipo = @Tipo, latitude = @Latitude, longitude = @Longitude OUTPUT INSERTED.* WHERE usuario_id = @Id'); 

        const updatedDesmatamento = {
            ...ocorrencias.recordset[0]
        };

        console.log('updatedDesmatamento', updatedDesmatamento);

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
        requestId.input('UsuarioId', sql.Int, desmatamentoId);
        const desmatamentos = await requestId.query('SELECT * FROM [dbo].ocorrencia where tipo = \'desmatamentos\' AND usuario_id = @UsuarioId');
        if (desmatamentos.recordset.length === 0) {
            return res.status(404).json({ message: 'desmatamento não encontrado' });
        }

        const request = new sql.Request(serverPool.pool);
        request.input('Id', sql.Int, desmatamentoId);
        const ocorrencias = await request.query('DELETE FROM [dbo].ocorrencia OUTPUT DELETED.* where usuario_id = @Id')

        const deletedDesmatamento = {
            ...ocorrencias.recordset[0]
        };

        return res.status(200).json(deletedDesmatamento);

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}