import express from 'express';
import sqlite3 from 'sqlite3';

import { router as queimadasRouter } from './routes/queimadas/queimadas.router.js';
import { router as cacasRouter } from './routes/cacas/cacas.router.js';
import { router as desmatamentosRouter } from './routes/desmatamentos/desmatamentos.router.js';

const app = express(); 

app.use(express.json());

app.use('/queimadas', queimadasRouter);
app.use('/cacas', cacasRouter);
app.use('/desmatamentos', desmatamentosRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});