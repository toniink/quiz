// src/screens/ResultsScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function ResultsScreen({ route, navigation }) {
  const { score, total } = route.params;
  const percentage = (score / total) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Finalizado!</Text>
      
      {/* Teste E2E: "Placar final está correto" */}
      <Text style={styles.resultsText}>
        Você acertou {score} de {total} perguntas!
      </Text>
      
      <Text style={styles.percentageText}>
        ({percentage.toFixed(0)}%)
      </Text>
      
      <Button
        title="Voltar ao Dashboard"
        onPress={() => navigation.popToTop()} // Volta para a primeira tela do Stack
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultsText: {
    fontSize: 22,
    marginBottom: 10,
  },
  percentageText: {
    fontSize: 20,
    color: '#555',
    marginBottom: 40,
  },
});