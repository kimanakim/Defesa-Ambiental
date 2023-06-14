import express from 'express';
import sql from 'mssql';
import dotenv from 'dotenv';

import { router as queimadasRouter } from './routes/queimadas/queimadas.router.js';
import { router as cacasRouter } from './routes/cacas/cacas.router.js';
import { router as desmatamentosRouter } from './routes/desmatamentos/desmatamentos.router.js';
import { router as loginRouter } from './login/login.js';
import { verifyToken } from './middleware/auth.js'

// Configura DB
const connectionString = 'Server=tcp:a3-defesa-ambiental-db.database.windows.net,1433;Initial Catalog=a3_defesa_ambiental_db;Persist Security Info=False;User ID=a3-app;Password=pohsyf-butquk-6wIvvy;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

dotenv.config()

const app = express(); 

app.use(express.json());

app.use('/login', loginRouter);
app.use('/queimadas',verifyToken, queimadasRouter);
app.use('/cacas', verifyToken, cacasRouter);
app.use('/desmatamentos', verifyToken, desmatamentosRouter);

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
