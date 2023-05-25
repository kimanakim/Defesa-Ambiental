import express from 'express';

import {
    getQueimadas,
    getQueimadasById,
    postQueimada,
    putQueimada,
    patchQueimada,
    deleteQueimada
} from './queimadas.controller.js'

export const router = express.Router();

router.get('/', getQueimadas);
router.get('/:id', getQueimadasById);
router.post('/', postQueimada);
router.put('/:id', putQueimada);
router.patch('/:id', patchQueimada);
router.delete('/:id', deleteQueimada);