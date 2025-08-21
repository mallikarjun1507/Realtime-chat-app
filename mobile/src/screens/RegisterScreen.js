"// Register screen" 
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('New User');
  const [email, setEmail] = useState('new@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
    } catch (e) {
      Alert.alert('Register failed', e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 24 }}>Create account</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Password (min 6)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}
      />

      <TouchableOpacity onPress={onRegister} disabled={loading}
        style={{ backgroundColor: '#111', padding: 14, borderRadius: 8, opacity: loading ? 0.6 : 1 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{loading ? 'Creating…' : 'Register'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
        <Text style={{ textAlign: 'center' }}>Already have an account? <Text style={{ fontWeight: '700' }}>Login</Text></Text>
      </TouchableOpacity>
    </View>
  );
}
