// Settings screen
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const router = useRouter();
    const { profile, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.replace('/(auth)/login');
    };

    const menuItems = [
        { icon: 'person-outline', label: 'Edit Profile', color: '#6366F1' },
        { icon: 'notifications-outline', label: 'Notifications', color: '#10B981' },
        { icon: 'shield-checkmark-outline', label: 'Privacy', color: '#F59E0B' },
        { icon: 'help-circle-outline', label: 'Help & Support', color: '#9CA3AF' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {profile?.avatarUrl ? (
                            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.avatarInitial}>
                                    {(profile?.fullName || 'U').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{profile?.fullName || 'User'}</Text>
                    <Text style={styles.username}>@{profile?.username || 'username'}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{profile?.label || 'New Member'}</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}>
                            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon as any} size={22} color={item.color} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#374151" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Danger Zone */}
                <View style={styles.menuSection}>
                    <TouchableOpacity onPress={handleSignOut} style={styles.menuItem}>
                        <View style={[styles.iconContainer, { backgroundColor: '#EF444420' }]}>
                            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                        </View>
                        <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>ProjectLocked v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1F2937',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        padding: 24,
    },
    profileCard: {
        alignItems: 'center',
        backgroundColor: '#1F2937',
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#374151',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderAvatar: {
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    username: {
        color: '#9CA3AF',
        fontSize: 16,
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#6366F120',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#6366F140',
    },
    badgeText: {
        color: '#818CF8',
        fontSize: 12,
        fontWeight: '600',
    },
    menuSection: {
        backgroundColor: '#1F2937',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#374151',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    version: {
        textAlign: 'center',
        color: '#4B5563',
        fontSize: 14,
        marginTop: 12,
        marginBottom: 24,
    },
});
