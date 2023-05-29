import express from 'express';
import sqlite3 from 'sqlite3';
import sql from 'mssql';

import { router as queimadasRouter } from './routes/queimadas/queimadas.router.js';
import { router as cacasRouter } from './routes/cacas/cacas.router.js';
import { router as desmatamentosRouter } from './routes/desmatamentos/desmatamentos.router.js';

// Configura DB
const connectionString = 'Server=tcp:a3-defesa-ambiental-db.database.windows.net,1433;Initial Catalog=a3_defesa_ambiental_db;Persist Security Info=False;User ID=a3-app;Password=pohsyf-butquk-6wIvvy;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

const app = express(); 

app.use(express.json());

app.use('/queimadas', queimadasRouter);
app.use('/cacas', cacasRouter);
app.use('/desmatamentos', desmatamentosRouter);

export const serverPool = {
    pool: null
}

const pool = new sql.ConnectionPool(connectionString);
pool.connect().then((connectionPool) => {
    console.log('SQL Server connection OK');
    serverPool.pool = connectionPool;
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});