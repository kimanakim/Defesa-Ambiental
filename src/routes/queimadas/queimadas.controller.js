let queimadaNextId = 2;
let queimadas = [
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


export async function getQueimadas(req, res) {
    console.log('getQueimadas');
    try {
        return res.status(200).json(queimadas);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getQueimadasById(req, res) {
    console.log('getQueimadasById');
    try {
        const queimadaId = Number(req.params.id); // String
        const queimada = queimadas.find(q => q.id === queimadaId);

        if (queimada) {
            return res.status(200).json(queimada);
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

        const idToAssign = queimadaNextId + 1;
        const queimada = {
            id: idToAssign,
            ...queimadaToSave
        };
        
        queimadas.push(queimada);
        queimadaNextId++;

        return res.status(200).json(queimada);

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

        const queimadaIndex = queimadas.findIndex(q => q.id === queimadaId);
        if (queimadaIndex < 0) {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

        const queimada = {
            id: queimadaId,
            ...queimadaToSave
        };

        queimadas[queimadaIndex] = queimada;

        return res.status(200).json(queimada);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function patchQueimada(req, res) {
    console.log('patchQueimada');
    try {
        const queimadaId = Number(req.params.id);
        const fieldsToSave = req.body;

        const queimadaIndex = queimadas.findIndex(q => q.id === queimadaId);
        if (queimadaIndex < 0) {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

        const queimada = {
            id: queimadaId,
            ...queimadas[queimadaIndex],
            ...fieldsToSave
        };

        queimadas[queimadaIndex] = queimada;

        return res.status(200).json(queimada);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteQueimada(req, res) {
    console.log('deleteQueimada');
    try {
        const queimadaId = Number(req.params.id); 
        const queimada = queimadas.find(q => q.id === queimadaId);

        if (queimada) {
            queimadas = queimadas.filter(q => q.id !== queimadaId);
            return res.status(200).json(queimada);
        } else {
            return res.status(404).json({ message: 'Queimada não encontrada' });
        }

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}