// Session flow as modal stack
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SessionLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerStyle: { backgroundColor: '#111827' },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#111827' },
      }}
    >
      <Stack.Screen
        name="setup"
        options={{
          title: 'Start a Lock-In',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{
              marginRight: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#1F2937',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#374151'
            }}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="active"
        options={{
          title: 'Locked In',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="proof"
        options={{
          title: 'Capture Proof',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
