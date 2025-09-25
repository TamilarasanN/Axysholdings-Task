import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Fullscreen Background Image */}
      <ImageBackground 
        source={require('../assets/images/welbg.png')} 
        style={styles.background}
        resizeMode="cover"
      />
      
      {/* Overlay Content */}
      <View style={styles.overlay}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Status Bar Area */}

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/welLogo.svg')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          {/* Bottom Content */}
          <LinearGradient
            colors={['transparent', '#000000']}
            locations={[0, 1]}
            style={styles.bottomContent}
          >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Axys to</Text>
            <Text style={styles.subtitle}>Neo Thinkers</Text>
            
            <View style={styles.buttonContainer}>
              <Link href="/sign-up" asChild>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Get started</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/sign-in" asChild>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Log in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </LinearGradient>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 50, // Account for status bar
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  time: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalBars: {
    width: 18,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  wifiIcon: {
    width: 16,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  batteryIcon: {
    width: 24,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  logoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logo: {
    width: 80,
    height: 40,
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 50,
    zIndex: 100,
  },
  contentContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
