import { getUser } from "./auth";
import { useNavigate } from "react-router-dom";

function ProtectedRouter({children, roles}){
    const navigate = useNavigate();
    const user= getUser();
}

export default ProtectedRouter;