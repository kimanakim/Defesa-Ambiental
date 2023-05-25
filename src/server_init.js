import express from 'express';
import sqlite3 from 'sqlite3';

import { router as queimadasRouter } from './routes/queimadas/queimadas.router.js';

const app = express(); 

app.use(express.json());

app.use('/queimadas', queimadasRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});