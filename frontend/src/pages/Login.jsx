// import React, { useState } from 'react';
// import './Login.css';
// // import api from '../services/api';
// // import logo from '../assets/LOGOCERTO.png';

// function Login() {
//     // const [username, setUsername] = useState('');
//     // const [password, setPassword] = useState('');

//     const handleLogin = async () => {
//         try {
//             // const res = await api.post('/login', {
//             //     username,
//             //     password
//             // });
//             // console.log('Resposta do backend:', res.data);
//             // Aqui você pode redirecionar ou salvar token, etc.
//         } catch (err) {
//             console.error('Erro no login:', err);
//         }
//     };

//     return (
//         <div className="login-container">
//             <header className="login-header">
//                 {/* <img src={ } alt="Logo ETEC" className="logo-login" /> */}
//             </header>

//             <div className="login-box">
//                 {/* <img src={logo} alt="Logo ControlKey" className="logo-central" /> */}
//                 <h2>CONTROLKEY</h2>

//                 <div className='input-group'>
//                     <input
//                         type='text'
//                         placeholder='Username'
//                         value={username}
//                         onChange={e => setUsername(e.target.value)}
//                     />
//                 </div>
//                 <div className='input-group'>
//                     <input
//                         type='password'
//                         placeholder='Password'
//                         value={password}
//                         onChange={e => setPassword(e.target.value)}
//                     />
//                 </div>
//                 <button className='btn-login' onClick={handleLogin}>Entrar</button>
//                 <a href="/" className='esqueceu-senha'>Esqueceu a senha?</a>
//             </div>
//         </div>
//     );
// }

// export default Login;

import React from 'react';
import './Login.css';

function Login() {
    const handleLogin = () => {
        console.log('Login clicado');
    };

    return (
        <div className="login-container">
            <header className="login-header">
                {/* Logo se quiser */}
            </header>

            <div className="login-box">
                <h2>CONTROLKEY</h2>

                <div className='input-group'>
                    <input type='text' placeholder='Username' />
                </div>
                <div className='input-group'>
                    <input type='password' placeholder='Password' />
                </div>
                <button className='btn-login' onClick={handleLogin}>Entrar</button>
                <a href="/" className='esqueceu-senha'>Esqueceu a senha?</a>
            </div>
        </div>
    );
}

export default Login;
