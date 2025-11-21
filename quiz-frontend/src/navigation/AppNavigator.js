import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext'; // Importa o hook do tema

// Telas de Autenticação
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';


// Telas Principais
import DashboardScreen from '../screens/DashboardScreen';
import CreateEditQuizScreen from '../screens/CreateEditQuizScreen';
import PlayQuizScreen from '../screens/PlayQuizScreen';
import ResultsScreen from '../screens/ResultsScreen';
import FolderScreen from '../screens/FolderScreen';
import FoldersListScreen from '../screens/FoldersListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpScreen from '../screens/HelpScreen';

const Stack = createStackNavigator();

// Stack para utilizadores não logados
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Stack para utilizadores logados (Aplicação Principal)
function MainStack() {
  // Usamos o hook para pegar as cores atuais (Dark/Light)
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        // Estilo do Header Dinâmico
        headerStyle: {
          backgroundColor: colors.card,
          elevation: 0, // Remove sombra no Android (opcional, fica mais limpo)
          shadowOpacity: 0, // Remove sombra no iOS
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        },
        headerTintColor: colors.text, // Cor do texto do título e botões de voltar
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Define a cor de fundo das telas por defeito
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ headerShown: false }} // O Dashboard tem seu próprio header customizado
      />
      
      <Stack.Screen 
        name="FoldersList" 
        component={FoldersListScreen} 
        options={{ title: 'Minhas Pastas' }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Meu Perfil' }} 
      />
      <Stack.Screen 
        name="Folder" 
        component={FolderScreen} 
        options={{ title: 'Pasta' }}
      />
      
      <Stack.Screen 
        name="CreateEditQuiz" 
        component={CreateEditQuizScreen} 
        options={{ title: 'Editor de Quiz' }} 
      />
      
      <Stack.Screen 
        name="PlayQuiz" 
        component={PlayQuizScreen} 
        options={{ title: 'Jogar' }} 
      />
      
      <Stack.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ title: 'Resultados', headerShown: false }} 
      />
    <Stack.Screen 
        name="Help" 
        component={HelpScreen} 
        options={{ title: 'Ajuda & Suporte' }} 
      />

    </Stack.Navigator>
    
  );
}

export { AuthStack, MainStack };