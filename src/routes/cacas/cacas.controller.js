let cacaNextId = 2;
let cacas = [
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


export async function getCacas(req, res) {
    console.log('getCacas');
    try {
        return res.status(200).json(cacas);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getCacasById(req, res) {
    console.log('getCacasById');
    try {
        const cacaId = Number(req.params.id); // String
        const caca = cacas.find(q => q.id === cacaId);

        if (caca) {
            return res.status(200).json(caca);
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

        const idToAssign = cacaNextId + 1;
        const caca = {
            id: idToAssign,
            ...cacaToSave
        };
        
        cacas.push(caca);
        cacaNextId++;

        return res.status(200).json(caca);

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

        const cacaIndex = cacas.findIndex(q => q.id === cacaId);
        if (cacaIndex < 0) {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

        const caca = {
            id: cacaId,
            ...cacaToSave
        };

        cacas[cacaIndex] = caca;

        return res.status(200).json(caca);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function patchCaca(req, res) {
    console.log('patchCaca');
    try {
        const cacaId = Number(req.params.id);
        const fieldsToSave = req.body;

        const cacaIndex = cacas.findIndex(q => q.id === cacaId);
        if (cacaIndex < 0) {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

        const caca = {
            id: cacaId,
            ...cacas[cacaIndex],
            ...fieldsToSave
        };

        cacas[cacaIndex] = caca;

        return res.status(200).json(caca);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteCaca(req, res) {
    console.log('deleteCaca');
    try {
        const cacaId = Number(req.params.id); 
        const caca = cacas.find(q => q.id === cacaId);

        if (caca) {
            cacas = cacas.filter(q => q.id !== cacaId);
            return res.status(200).json(caca);
        } else {
            return res.status(404).json({ message: 'Caça não encontrada' });
        }

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}