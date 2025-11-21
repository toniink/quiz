import React, { useState, createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { loginUser } from '../services/api'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userData')
        ]);

        if (savedToken) {
          setToken(savedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Erro ao carregar sessão", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const { token: newToken, user: userData } = response.data;
    
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await AsyncStorage.setItem('userToken', newToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    return response.data;
  };

  // NOVA FUNÇÃO: Atualizar dados locais do utilizador
  const updateUserLocal = async (newUsername) => {
      const newUser = { ...user, username: newUsername };
      setUser(newUser);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    delete api.defaults.headers.common['Authorization'];
  };

  const authContextValue = {
    token,
    user,
    isLoading,
    login,
    logout,
    updateUserLocal // Exportando a nova função
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);