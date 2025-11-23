export const isAdmin = (req, res, next) => {
    const user = req.user
    if(user && user.tipo === "Administrador") {
        next()
    }else {
        return res.status(403).json({
            response: "Acesso permitido apenas para administradores"
        });
    }
}

export const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return res.status(401).json({response: "Token não fornecido"})
    }

    try{
        const decoded = JsonWebTokenError.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }catch(error) {
        return res.status(403).json({ response: "Token inválido"})
    }
};