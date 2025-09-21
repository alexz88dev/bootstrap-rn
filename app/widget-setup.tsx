import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { widgetManager } from '@/services/widget-manager';
import { 
  Alert,
  Dimensions, 
  Image,
  Platform,
  Pressable, 
  ScrollView, 
  StyleSheet, 
  View 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: () => void;
}

export default function WidgetSetupScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isWidgetAdded, setIsWidgetAdded] = useState(false);
  const [platform, setPlatform] = useState<'iphone' | 'carplay'>('iphone');

  useEffect(() => {
    checkWidgetStatus();
  }, []);

  const checkWidgetStatus = async () => {
    const added = await widgetManager.isWidgetAdded();
    setIsWidgetAdded(added);
    if (added) {
      setCurrentStep(iPhoneSteps.length - 1);
    }
  };

  const iPhoneSteps: SetupStep[] = [
    {
      id: 'long-press',
      title: 'Long Press Home Screen',
      description: 'Press and hold on an empty area of your home screen until the apps start wiggling',
      icon: 'hand.tap.fill',
    },
    {
      id: 'add-button',
      title: 'Tap the + Button',
      description: 'Look for the + button in the top left corner and tap it',
      icon: 'plus.circle.fill',
    },
    {
      id: 'search',
      title: 'Search for MyCar',
      description: 'Type "MyCar" in the search bar to find our widget',
      icon: 'magnifyingglass',
    },
    {
      id: 'select-size',
      title: 'Choose Widget Size',
      description: 'Swipe to select Small or Medium size, then tap "Add Widget"',
      icon: 'square.grid.2x2.fill',
    },
    {
      id: 'position',
      title: 'Position Your Widget',
      description: 'Drag the widget to your desired location and tap "Done"',
      icon: 'arrow.up.and.down.and.arrow.left.and.right',
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'Your car is now on your home screen. It will update automatically with your chosen style.',
      icon: 'checkmark.circle.fill',
      action: () => handleComplete(),
    },
  ];

  const carPlaySteps: SetupStep[] = [
    {
      id: 'connect',
      title: 'Connect to CarPlay',
      description: 'Connect your iPhone to your car via USB or wireless CarPlay',
      icon: 'car.fill',
    },
    {
      id: 'dashboard',
      title: 'Open CarPlay Dashboard',
      description: 'The widget will appear automatically on your CarPlay home screen',
      icon: 'apps.iphone',
    },
    {
      id: 'customize',
      title: 'Customize Layout',
      description: 'Press and hold the widget to rearrange its position on the dashboard',
      icon: 'square.grid.3x3.fill',
    },
    {
      id: 'complete',
      title: 'Ready to Drive!',
      description: 'Your car portrait is now visible on your CarPlay display',
      icon: 'checkmark.circle.fill',
      action: () => handleComplete(),
    },
  ];

  const steps = platform === 'iphone' ? iPhoneSteps : carPlaySteps;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStepData.action) {
      currentStepData.action();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Check if widget was actually added
    const added = await widgetManager.isWidgetAdded();
    
    if (added) {
      Alert.alert(
        'Widget Added! 🎉',
        'Your car is now on your home screen.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      Alert.alert(
        'Widget Not Detected',
        'Please make sure you\'ve added the widget to your home screen.',
        [
          {
            text: 'I\'ll add it now',
            style: 'cancel',
          },
          {
            text: 'Skip for now',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    }
  };

  const handleOpenSettings = async () => {
    await widgetManager.openWidgetSettings();
  };

  const renderStepVisual = () => {
    // In a real app, these would be actual screenshots or animations
    return (
      <View style={styles.visualContainer}>
        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          style={styles.visualGradient}
        >
          <IconSymbol 
            name={currentStepData.icon} 
            size={80} 
            color="#FFF" 
          />
        </LinearGradient>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Add Your Widget
          </ThemedText>
          
          {/* Platform Selector */}
          <View style={styles.platformSelector}>
            <Pressable
              style={[
                styles.platformButton,
                platform === 'iphone' && styles.platformButtonActive,
              ]}
              onPress={() => {
                setPlatform('iphone');
                setCurrentStep(0);
              }}
            >
              <IconSymbol 
                name="iphone" 
                size={20} 
                color={platform === 'iphone' ? '#FFF' : '#007AFF'} 
              />
              <ThemedText 
                style={[
                  styles.platformText,
                  platform === 'iphone' && styles.platformTextActive,
                ]}
              >
                iPhone
              </ThemedText>
            </Pressable>
            
            <Pressable
              style={[
                styles.platformButton,
                platform === 'carplay' && styles.platformButtonActive,
              ]}
              onPress={() => {
                setPlatform('carplay');
                setCurrentStep(0);
              }}
            >
              <IconSymbol 
                name="car.fill" 
                size={20} 
                color={platform === 'carplay' ? '#FFF' : '#007AFF'} 
              />
              <ThemedText 
                style={[
                  styles.platformText,
                  platform === 'carplay' && styles.platformTextActive,
                ]}
              >
                CarPlay
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Step Visual */}
        {renderStepVisual()}

        {/* Step Content */}
        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <ThemedText style={styles.stepNumber}>
              Step {currentStep + 1} of {steps.length}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.stepTitle}>
              {currentStepData.title}
            </ThemedText>
          </View>
          
          <ThemedText style={styles.stepDescription}>
            {currentStepData.description}
          </ThemedText>

          {/* Progress Dots */}
          <View style={styles.progressDots}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot,
                  index < currentStep && styles.completedDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <Pressable style={styles.backButton} onPress={handlePrevious}>
              <IconSymbol name="arrow.left" size={20} color="#007AFF" />
              <ThemedText style={styles.backText}>Back</ThemedText>
            </Pressable>
          )}
          
          <Pressable 
            style={[
              styles.nextButton,
              currentStep === steps.length - 1 && styles.completeButton,
            ]} 
            onPress={handleNext}
          >
            <ThemedText style={styles.nextText}>
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            </ThemedText>
            {currentStep < steps.length - 1 && (
              <IconSymbol name="arrow.right" size={20} color="#FFF" />
            )}
          </Pressable>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Pressable style={styles.helpButton} onPress={handleOpenSettings}>
            <IconSymbol name="questionmark.circle" size={20} color="#007AFF" />
            <ThemedText style={styles.helpText}>
              Open Widget Settings
            </ThemedText>
          </Pressable>
          
          {isWidgetAdded && (
            <View style={styles.statusBadge}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#34C759" />
              <ThemedText style={styles.statusText}>Widget Detected</ThemedText>
            </View>
          )}
        </View>

        {/* Skip Option */}
        <Pressable 
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <ThemedText style={styles.skipText}>Skip for now</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 20,
  },
  platformSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#FFF',
  },
  platformButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  platformText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  platformTextActive: {
    color: '#FFF',
  },
  visualContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  visualGradient: {
    width: 200,
    height: 200,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 24,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#007AFF',
  },
  completedDot: {
    backgroundColor: '#34C759',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
    marginLeft: 60,
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  nextText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  helpSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#007AFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#999',
  },
});