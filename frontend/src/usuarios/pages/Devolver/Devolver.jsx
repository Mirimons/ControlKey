import React from "react";
import { useState, useEffect } from "react";
import "./Devolver.css";
// import logoetec from '../../assets/logoetec.png';

function Devolver() {
    return (
        <div className="pagina">
            <div>
                {/* <img src={logoetec} alt="" className="logoetec" /> */}
            </div>
            <div className="botoes">
                <button>Devolver Chave</button>
                <button>Devolver Equipamento</button>
            </div>
        </div>
    )
}

export default Devolver;