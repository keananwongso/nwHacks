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
          headerShown: false, // Custom header in the screen itself
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
