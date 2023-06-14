import express from 'express';

import {
    getDesmatamentos,
    getDesmatamentosById,
    postDesmatamento,
    putDesmatamento,
    patchDesmatamento,
    deleteDesmatamento
} from './desmatamentos.controller.js'

export const router = express.Router();

router.get('/', getDesmatamentos);
router.get('/:id', getDesmatamentosById);
router.post('/', postDesmatamento);
router.put('/:id', putDesmatamento);
router.patch('/:id', patchDesmatamento);
router.delete('/:id', deleteDesmatamento);