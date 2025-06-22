import React, { useState, useContext , useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from "../../constants/api"

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const authContext = useContext(AuthContext);

   useEffect(() => {
    fetch(`${API_URL}/api/register`)
      .then(res => console.log("✅ Connection test succeeded:", res.status))
      .catch(err => console.error("❌ Connection test failed:", err.message));
  }, []);

  const handleRegister = async () => {
    setError('');
    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setUsername('');
        setPassword('');
        router.replace('/'); // Redirect to login
      } else {
        setError(data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Create an Account</Text>

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
          <Button title="Register" onPress={handleRegister} />
          <View style={styles.spacer} />
          <Button title="Back to Login" onPress={() => router.replace('/')} />
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
  spacer: {
    height: 12,
  },
});

export default RegisterScreen;
