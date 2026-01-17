// Main app tabs layout
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: true,
        tabBarItemStyle: {
          paddingVertical: 10,
        },
        tabBarStyle: {
          backgroundColor: '#1F2937', // Slightly lighter than bg
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 35,
          borderWidth: 1,
          borderColor: '#374151', // Border for definition
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          paddingBottom: 0,
        },
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Lock In',
          tabBarLabel: () => null,
          tabBarIcon: ({ size }) => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 12, // Push down to center in the 70px bar
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
              }}
            >
              <Ionicons name="camera" size={28} color="#000000" />
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          href: null,
        }}
      />
    </Tabs >
  );
}
