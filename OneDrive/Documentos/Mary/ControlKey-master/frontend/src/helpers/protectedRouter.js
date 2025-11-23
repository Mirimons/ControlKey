import { useEffect } from "react";
import { getUser } from "./auth";
import { useNavigate } from "react-router-dom";

function ProtectedRouter({children, roles}){
    const navigate = useNavigate();
    const user= getUser();
    
    //Validações, caso o usuario estiver tentando usar rota protegida sem as validações verdadeiras, ele redireciona o usuário para página que queremos que ele vá
    //Antes de carregar o layout da tela, ele verifica o usuário e aí vê se mostra a tela ou não
    useEffect(() => {
        if(!user) {
            navigate("/login")
            return
        }
        if(roles && !roles.includes(user.tipo)) {
            navigate("/home")
        }
    }, []);
    return children;
}

export default ProtectedRouter;