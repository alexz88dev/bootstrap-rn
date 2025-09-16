import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';

// For VisionKit (iOS native scanner)
import * as VisionKitScanner from '../modules/vision-kit-scanner/src/VisionKitScanner';

export function OCRScanner() {
  const [scannedText, setScannedText] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScanWithVisionKit = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'VisionKit scanner is only available on iOS');
      return;
    }

    try {
      setIsScanning(true);
      const result = await VisionKitScanner.scanText();
      setScannedText(result.text);
      Alert.alert('Success', `Scanned ${result.pageCount} page(s)`);
    } catch (error: any) {
      if (error.code !== 'CANCELLED') {
        Alert.alert('Error', error.message || 'Failed to scan');
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        📷 OCR Scanner
      </ThemedText>
      
      <ThemedText style={styles.description}>
        Scan documents and extract text using native iOS OCR
      </ThemedText>

      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={handleScanWithVisionKit}
        disabled={isScanning}
      >
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning...' : '📸 Scan Document'}
        </Text>
      </TouchableOpacity>

      {scannedText ? (
        <View style={styles.resultContainer}>
          <ThemedText style={styles.resultTitle}>Scanned Text:</ThemedText>
          <ThemedText style={styles.resultText}>
            {scannedText}
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    maxHeight: 300,
  },
  resultTitle: {
    fontWeight: '600',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
