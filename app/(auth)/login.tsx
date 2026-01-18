// Login screen
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { DEMO_MODE } from '../../src/utils/constants';

export default function LoginScreen() {
  const { signIn, signUp, user, profile } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (user && !profile) {
      // If we land here but are authenticated without a profile, 
      // it means we need to continue setup.
      // We could show a button, but auto-redirect is common UX here.
      router.replace('/(auth)/username-setup');
    }
  }, [user, profile, router]);

  const [identifier, setIdentifier] = useState(''); // Either email or username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUp(identifier, password);
      } else {
        await signIn(identifier, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Logo/Brand */}
            <View style={styles.brand}>
              <Text style={styles.logo}>🔒</Text>
              <Text style={styles.title}>ProjectLocked</Text>
              <Text style={styles.subtitle}>Lock in. Prove it. Level up.</Text>
              {DEMO_MODE && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoText}>DEMO MODE</Text>
                </View>
              )}
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{isSignUp ? 'Email' : 'Username'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={isSignUp ? 'Enter your email' : 'Enter your username'}
                  placeholderTextColor="#6B7280"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={isSignUp ? 'email-address' : 'default'}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleText}>
                  {isSignUp
                    ? "Already have an account? Login"
                    : "Not have an account yet? Get started"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              By continuing, you agree to our Terms of Service
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  subtitle: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  demoBadge: {
    backgroundColor: '#CA8A04',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 16,
  },
  demoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#D1D5DB',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1F2937',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '500',
  },
  error: {
    color: '#F87171',
    marginBottom: 16,
    textAlign: 'center',
  },
  footer: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 40,
    textAlign: 'center',
  },
});
