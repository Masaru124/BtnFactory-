import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, userRoles } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      await signIn({ username, password });

      // ✅ You can check roles and redirect based on it
      if (userRoles?.includes('admin')) {
        router.replace('/admin');
      } else {
        router.replace('/user');
      }
    } catch (e) {
      console.error('Login error:', e);
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Welcome Back</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 12 }} />
      ) : (
        <>
          <Button title="Login" onPress={handleLogin} />
          <TouchableOpacity onPress={() => router.replace('/register')}>
            <Text style={styles.registerLink}>Don't have an account? Register here</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 18,
    color: 'blue',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
