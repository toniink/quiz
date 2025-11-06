// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Telas de Autenticação
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Telas Principais (Novas)
import DashboardScreen from '../screens/DashboardScreen'; // Tela principal pós-login
import CreateEditQuizScreen from '../screens/CreateEditQuizScreen'; // Formulário
import PlayQuizScreen from '../screens/PlayQuizScreen'; // O jogo
import ResultsScreen from '../screens/ResultsScreen'; // Placar final

const Stack = createStackNavigator();

// Contexto ou Zustand/Redux seria usado aqui para gerenciar o 'isLoggedIn'
// Por simplicidade, vamos fingir que o usuário NUNCA está logado
// Em um app real, você teria uma lógica de estado para trocar entre os Stacks

// Stack de Autenticação
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Criar Conta' }} 
      />
    </Stack.Navigator>
  );
}

// Stack Principal (dentro do App)
function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Meus Quizzes' }} 
      />
      <Stack.Screen 
        name="CreateEditQuiz" 
        component={CreateEditQuizScreen} 
        options={{ title: 'Criar Quiz' }} 
      />
      <Stack.Screen 
        name="PlayQuiz" 
        component={PlayQuizScreen} 
        options={{ title: 'Jogar' }} 
      />
      <Stack.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ title: 'Resultados' }} 
      />
    </Stack.Navigator>
  );
}

// No App.js, você decidiria qual Stack mostrar.
// Por enquanto, vamos apenas exportar os dois
export { AuthStack, MainStack };