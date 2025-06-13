import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Admin: undefined;
  Staff: undefined;
  User: undefined;
};

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext is null');
  }

  const { signIn } = authContext;

  const handleLogin = async () => {
    try {
      await signIn({ username, password });
    } catch (e: unknown) {
      if (e instanceof Error) {
        Alert.alert('Login failed', e.message);
      } else {
        Alert.alert('Login failed', 'Unknown error');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Don't have an account? Register here</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  registerLink: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
  },
});

export default LoginScreen;
