import express from 'express';

import {
    getCacas,
    getCacasById,
    postCaca,
    putCaca,
    patchCaca,
    deleteCaca
} from './cacas.controller.js'

export const router = express.Router();

router.get('/', getCacas);
router.get('/:id', getCacasById);
router.post('/', postCaca);
router.put('/:id', putCaca);
router.patch('/:id', patchCaca);
router.delete('/:id', deleteCaca);