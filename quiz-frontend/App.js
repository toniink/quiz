// App.js (Modificado)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { AuthStack, MainStack } from './src/navigation/AppNavigator';
// Importe o Provedor e o Hook do NOVO arquivo
import { AuthProvider, useAuth } from './src/context/AuthContext'; 

// Este componente decide qual Stack (pilha de telas) mostrar
function AppContent() {
  const { token, isLoading } = useAuth(); // Pega o token do contexto
  
  if (isLoading) {
    // Mostra um indicador de carregamento enquanto busca o token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // Se tiver token, mostra o MainStack, senão, o AuthStack
  return token ? <MainStack /> : <AuthStack />;
}

export default function App() {
  return (
    // 1. Envolve tudo com o AuthProvider
    <AuthProvider>
      <NavigationContainer>
        {/* 2. O AppContent agora gerencia a troca de telas */}
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}