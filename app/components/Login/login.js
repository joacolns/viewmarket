import React, { useState } from 'react';
import { FaEthereum } from 'react-icons/fa';
import {LOGIN_USER0, LOGIN_PASSWORD0} from './credentials';
 
function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const USER = LOGIN_USER0;
  const PSWD = LOGIN_PASSWORD0;

  const handleLogin = () => {
    if (username === USER && password === PSWD) {
      setIsLoggedIn(true);
    } else {
      setError('Invalid credentials, please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="username">
            User
          </label>
          <input
            id="username"
            type="text"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center"
          onClick={handleLogin}
        >
          <FaEthereum />
        </button>
      </div>
    </div>
  );
}

export default Login;
