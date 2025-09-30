import { jwtDecode } from "jwt-decode";


function getUser() {
    const token = sessionStorage.getItem("tokenJwt");

    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}

function isAutenticated() {
    return !!getUser();
}

export { isAutenticated, getUser };
