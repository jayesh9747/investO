// app/(tabs)/stocks/view-all/[section].tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// API Service (same as home page)
const fetchTopGainersLosers = async () => {
  const response = await fetch('https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Types (same as home page)
interface StockItem {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

interface ApiResponse {
  metadata: {
    information: string;
    last_refreshed: string;
  };
  top_gainers: StockItem[];
  top_losers: StockItem[];
  most_actively_traded: StockItem[];
}

const ViewAllPage = () => {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ['topGainersLosers'],
    queryFn: fetchTopGainersLosers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getTitle = () => {
    return section === 'gainers' ? 'Top Gainers' : 'Top Losers';
  };

  const getStockData = () => {
    if (!data) return [];
    return section === 'gainers' ? data.top_gainers : data.top_losers;
  };

  const renderStockItem = ({ item, index }: { item: StockItem; index: number }) => (
    <TouchableOpacity 
      style={styles.stockItem}
      onPress={() => router.push(`/stocks/product/${item.ticker}`)}
    >
      {/* Stock Icon Placeholder */}
      <View style={styles.stockIcon} />
      
      {/* Stock Info */}
      <View style={styles.stockInfo}>
        <Text style={styles.stockTicker}>{item.ticker}</Text>
        <Text style={styles.stockVolume}>
          Vol: {parseInt(item.volume).toLocaleString()}
        </Text>
      </View>

      {/* Price Info */}
      <View style={styles.priceInfo}>
        <Text style={styles.stockPrice}>
          ${parseFloat(item.price).toFixed(2)}
        </Text>
        <Text 
          style={[
            styles.changePercentage,
            section === 'gainers' ? styles.gainText : styles.lossText
          ]}
        >
          {section === 'gainers' ? '+' : ''}{item.change_percentage}
        </Text>
        <Text style={styles.changeAmount}>
          {section === 'gainers' ? '+' : ''}${parseFloat(item.change_amount).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading {getTitle().toLowerCase()}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.centerContent, styles.errorContainer]}>
          <Text style={styles.errorText}>
            Failed to load stocks data. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
      </View>

      {/* Stocks List */}
      <FlatList
        data={getStockData().slice(0, 20)} // Show top 20
        renderItem={renderStockItem}
        keyExtractor={(item, index) => `${item.ticker}-${index}`}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {getTitle().toLowerCase()} data available
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  errorContainer: {
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  stockItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 24,
    marginRight: 16,
  },
  stockInfo: {
    flex: 1,
  },
  stockTicker: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 16,
  },
  stockVolume: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 16,
  },
  changePercentage: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  gainText: {
    color: '#16a34a',
  },
  lossText: {
    color: '#dc2626',
  },
  changeAmount: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default ViewAllPage;