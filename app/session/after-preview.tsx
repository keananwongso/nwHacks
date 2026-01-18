// After proof preview screen - Review and submit after photo
import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../../src/stores/sessionStore';

export default function AfterPreviewScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { submitAfterProof, witnessId } = useSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRetake = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!photoUri || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitAfterProof(photoUri);
      // Navigate based on witness status
      if (witnessId) {
        // Go back to active session screen which now shows "Waiting..."
        router.replace('/session/active');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Failed to submit after proof:', error);
      Alert.alert('Error', 'Failed to submit proof. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No photo found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleRetake} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Photo</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Photo Preview */}
      <View style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleRetake}
          style={[styles.actionButton, styles.retakeButton]}
          disabled={isSubmitting}
        >
          <Ionicons name="camera-reverse" size={24} color="white" />
          <Text style={styles.actionButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.actionButton, styles.submitButton]}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.actionButtonText}>Submit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retakeButton: {
    backgroundColor: '#374151',
  },
  submitButton: {
    backgroundColor: '#6366F1',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
