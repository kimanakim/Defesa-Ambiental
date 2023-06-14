import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).json({message: 'token não encontrado'});
    }

    try {
        const decoded = jwt.decode(token, process.env.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({message: 'Token inválido'});
    }

    return next();
}
