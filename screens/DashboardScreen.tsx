import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../auth/AuthContext';

const screenWidth = Dimensions.get('window').width;

// Sample cryptocurrency data
const cryptoData = {
  portfolio: [
    { symbol: 'BTC', name: 'Bitcoin', value: 0.5, price: 43250, change: 2.3 },
    { symbol: 'ETH', name: 'Ethereum', value: 2.1, price: 2650, change: -1.2 },
    { symbol: 'ADA', name: 'Cardano', value: 1000, price: 0.45, change: 5.7 },
    { symbol: 'SOL', name: 'Solana', value: 15, price: 98, change: 3.1 },
  ],
  priceHistory: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [28000, 32000, 35000, 38000, 42000, 43250],
      color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
      strokeWidth: 2
    }]
  },
  volumeData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, 65]
    }]
  },
  portfolioDistribution: [
    { name: 'Bitcoin', population: 45, color: '#FF6B6B', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Ethereum', population: 30, color: '#4ECDC4', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Cardano', population: 15, color: '#45B7D1', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Solana', population: 10, color: '#96CEB4', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ]
};

export default function DashboardScreen() {
  const { signOut, user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  // Handle case where user becomes null (signed out)
  useEffect(() => {
    if (!user && !signingOut) {
      console.log('User is null, navigating to welcome screen');
      router.replace('/welcome');
    }
  }, [user, signingOut]);



  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await signOut();
              console.log('Sign out successful, navigating to welcome screen');
              // Force navigation to welcome screen
              router.replace('/welcome');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const calculateTotalPortfolioValue = () => {
    return cryptoData.portfolio.reduce((total, crypto) => {
      return total + (crypto.value * crypto.price);
    }, 0);
  };

  const totalValue = calculateTotalPortfolioValue();

  return (
    <ScrollView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerContent}>
          <View style={s.headerText}>
            <Text style={s.title}>Crypto Dashboard</Text>
            <Text style={s.subtitle}>Welcome back, {user?.name ?? user?.email}</Text>
          </View>
          <Pressable 
            style={s.signOutButton} 
            onPress={handleSignOut}
            disabled={signingOut}
          >
            <Image 
              source={require('../assets/images/logout.svg')} 
              style={s.signOutIcon} 
            />
          </Pressable>
        </View>
      </View>

      {/* Portfolio Summary */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Portfolio Value</Text>
        <Text style={s.totalValue}>${totalValue.toLocaleString()}</Text>
        <Text style={s.changeText}>+2.3% (24h)</Text>
      </View>

      {/* Portfolio Holdings */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Your Holdings</Text>
        {cryptoData.portfolio.map((crypto, index) => (
          <View key={index} style={s.holdingRow}>
            <View style={s.holdingInfo}>
              <Text style={s.cryptoSymbol}>{crypto.symbol}</Text>
              <Text style={s.cryptoName}>{crypto.name}</Text>
            </View>
            <View style={s.holdingValue}>
              <Text style={s.holdingAmount}>{crypto.value} {crypto.symbol}</Text>
              <Text style={s.holdingPrice}>${(crypto.value * crypto.price).toLocaleString()}</Text>
            </View>
            <View style={s.holdingChange}>
              <Text style={[s.changeText, crypto.change >= 0 ? s.positiveChange : s.negativeChange]}>
                {crypto.change >= 0 ? '+' : ''}{crypto.change}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bitcoin Price Chart */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Bitcoin Price Trend</Text>
        <LineChart
          data={cryptoData.priceHistory}
          width={screenWidth - 80}
          height={220}
          chartConfig={{
            backgroundColor: '#1e1e1e',
            backgroundGradientFrom: '#1e1e1e',
            backgroundGradientTo: '#1e1e1e',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ff6b6b'
            }
          }}
          bezier
          style={s.chart}
        />
      </View>

      {/* Trading Volume Chart */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Weekly Trading Volume</Text>
        <BarChart
          data={cryptoData.volumeData}
          width={screenWidth - 80}
          height={220}
          yAxisLabel="$"
          yAxisSuffix="M"
          chartConfig={{
            backgroundColor: '#1e1e1e',
            backgroundGradientFrom: '#1e1e1e',
            backgroundGradientTo: '#1e1e1e',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          style={s.chart}
        />
      </View>

      {/* Portfolio Distribution */}
      <View style={[s.card, s.lastCard]}>
        <Text style={s.cardTitle}>Portfolio Distribution</Text>
        <PieChart
          data={cryptoData.portfolioDistribution}
          width={screenWidth - 80}
          height={220}
          chartConfig={{
            backgroundColor: '#1e1e1e',
            backgroundGradientFrom: '#1e1e1e',
            backgroundGradientTo: '#1e1e1e',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={s.chart}
        />
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333333',
    marginTop: 4,
  },
  signOutIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  lastCard: {
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  changeText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  positiveChange: {
    color: '#4ECDC4',
  },
  negativeChange: {
    color: '#FF6B6B',
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  holdingInfo: {
    flex: 1,
  },
  cryptoSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cryptoName: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  holdingValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  holdingAmount: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  holdingPrice: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  holdingChange: {
    marginLeft: 16,
    alignItems: 'flex-end',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
});