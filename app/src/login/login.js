import express from "express";
import sql from "mssql";
import jwt from "jsonwebtoken";
import { serverPool } from "../server_init.js"

export const router = express.Router();

router.post("/", async (req, res) => {
  console.log("login");
  try {
    const loginParams = req.body;
    if (!loginParams.username) {
      return res.status(400).json({ message: "username é obrigatório" });
    }

    if (!loginParams.password) {
      return res.status(400).json({ message: "password é obrigatório" });
    }

    const request = new sql.Request(serverPool.pool);
    request.input("Usuario", sql.VarChar, loginParams.username);
    request.input("Senha", sql.VarChar, loginParams.password);
    const users = await request.query(
      "SELECT * FROM [dbo].usuarios where usuario = @Usuario and senha = @Senha",
    );

    if (!users.recordset.length) {
      // Usuario nao encontracdo
      return res.status(401).json({ message: "Não autorizado" });
    } else {
      const user = users.recordset[0];
      const token = jwt.sign(
        {
          usuario_id: user.usuario_id,
          usuario: user.usuario,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        },
      );
      return res.status(200).json({
        token: token,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
