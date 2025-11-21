import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'; // Importe DefaultTheme e DarkTheme
import { AuthStack, MainStack } from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { View, ActivityIndicator, StatusBar } from 'react-native';

// Componente Wrapper para aplicar o tema na StatusBar e Background geral
function AppContainer() {
  const { token, isLoading } = useAuth();
  const { colors, isDarkMode } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // CORREÇÃO CRÍTICA:
  // Selecionamos o tema base do React Navigation (Default ou Dark)
  const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;

  // Criamos um "Tema Combinado" que mantém as fontes originais do React Navigation
  // mas sobrescreve as cores com as nossas cores personalizadas
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors, // Mantém cores padrão que não sobrescrevemos
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      <NavigationContainer theme={navigationTheme}>
        {token ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContainer />
      </ThemeProvider>
    </AuthProvider>
  );
}