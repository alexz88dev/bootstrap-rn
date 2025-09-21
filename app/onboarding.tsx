import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MyCarConfig } from '@/config/mycar-config';
import { 
  Dimensions, 
  Image, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  View 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: 'car.fill',
      title: 'Your Car, Your Widget',
      description: 'Transform your car into a stunning portrait that lives on your iPhone and CarPlay dashboard.',
      gradient: ['#007AFF', '#0051D5'],
    },
    {
      icon: 'eye.slash.fill',
      title: 'Privacy Protected',
      description: 'We automatically blur license plates and faces to keep your privacy safe.',
      gradient: ['#34C759', '#30A14E'],
    },
    {
      icon: 'wand.and.stars',
      title: 'AI-Powered Magic',
      description: 'Advanced AI removes backgrounds perfectly, creating professional car portraits in seconds.',
      gradient: ['#FF3B30', '#FF6961'],
    },
    {
      icon: 'paintbrush.fill',
      title: '12+ Premium Styles',
      description: 'Choose from stunning backgrounds - from minimalist to cinematic. Your car, your style.',
      gradient: ['#FF9500', '#FF7F00'],
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    // Navigate to main app
    router.replace('/(tabs)');
  };

  const currentSlideData = slides[currentSlide];

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={currentSlideData.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Skip button */}
          {currentSlide < slides.length - 1 && (
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <ThemedText style={styles.skipText}>Skip</ThemedText>
            </Pressable>
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <IconSymbol 
              name={currentSlideData.icon} 
              size={120} 
              color="#FFF" 
            />
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <ThemedText type="title" style={styles.title}>
              {currentSlideData.title}
            </ThemedText>
            <ThemedText style={styles.description}>
              {currentSlideData.description}
            </ThemedText>
          </View>

          {/* Pagination dots */}
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* Action button */}
          <Pressable style={styles.button} onPress={handleNext}>
            <ThemedText style={styles.buttonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </ThemedText>
            <IconSymbol 
              name="arrow.right" 
              size={20} 
              color="#FFF" 
            />
          </Pressable>

          {/* Privacy notice on last slide */}
          {currentSlide === slides.length - 1 && (
            <ThemedText style={styles.privacyText}>
              By continuing, you agree to our Terms of Service{'\n'}
              and Privacy Policy
            </ThemedText>
          )}
        </View>
      </LinearGradient>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FFF',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  privacyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: -20,
  },
});