import jwt from 'jsonwebtoken';

const secret = "";

function generateToken(payload) {
    return jwt.sign(payload, secret, { expiresIn: 60 * 60 * 5 });
}

function authenticate(request, response, next) {
    const { authorization } = request.headers;

    if (!authorization) {
        return response.status(401).send({ "message": "Token não informado." });
    }
    
    const bearer = authorization.split(' ')[0];
    const token = authorization.split(' ')[1];

    if (bearer != "Bearer") {
        return response.status(401).send({ "message": "Token não possui 'Bearer'" });
    }

    jwt.verify(token, secret, (erro, user) => {
        if (erro) return response.status(401).send({ "message": "Acesso não autorizado. Token inválido" });
        request.user = user;
        next();
    });
}

export { generateToken, authenticate };