let desmatamentoNextId = 2;
let desmatamentos = [
    {
        id: 1,
        usuario: 'jose@email.com',
        latitude: '29.999',
        longitude: '15.354'
    },
    {
        id: 2,
        usuario: 'rose@email.com',
        latitude: '22.999',
        longitude: '45.354'
    }
];


export async function getDesmatamentos(req, res) {
    console.log('getDesmatamentos');
    try {
        return res.status(200).json(desmatamentos);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getDesmatamentosById(req, res) {
    console.log('getDesmatamentosById');
    try {
        const desmatamentoId = Number(req.params.id); // String
        const desmatamento = desmatamentos.find(q => q.id === desmatamentoId);

        if (desmatamento) {
            return res.status(200).json(desmatamento);
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

        const idToAssign = desmatamentoNextId + 1;
        const desmatamento = {
            id: idToAssign,
            ...desmatamentoToSave
        };
        
        desmatamentos.push(desmatamento);
        desmatamentoNextId++;

        return res.status(200).json(desmatamento);

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

        const desmatamentoIndex = desmatamento.findIndex(q => q.id === desmatamentoId);
        if (desmatamentoIndex < 0) {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

        const desmatamento = {
            id: desmatamentoId,
            ...desmatamentoToSave
        };

        desmatamentos[desmatamentoIndex] = desmatamento;

        return res.status(200).json(desmatamento);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function patchDesmatamento(req, res) {
    console.log('patchDesmatamento');
    try {
        const desmatamentoId = Number(req.params.id);
        const fieldsToSave = req.body;

        const desmatamentoIndex = desmatamentos.findIndex(q => q.id === desmatamentoId);
        if (desmatamentoIndex < 0) {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

        const desmatamento = {
            id: desmatamentoId,
            ...desmatamentos[desmatamentoIndex],
            ...fieldsToSave
        };

        desmatamentos[desmatamentoIndex] = desmatamento;

        return res.status(200).json(desmatamento);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteDesmatamento(req, res) {
    console.log('deleteDesmatamento');
    try {
        const desmatamentoId = Number(req.params.id); 
        const desmatamento = desmatamentos.find(q => q.id === desmatamentoId);

        if (desmatamento) {
            desmatamentos = desmatamentos.filter(q => q.id !== desmatamentoId);
            return res.status(200).json(desmatamento);
        } else {
            return res.status(404).json({ message: 'Desmatamento não encontrado' });
        }

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}