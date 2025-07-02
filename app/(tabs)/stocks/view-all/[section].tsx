import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fetchTopGainersLosers = async () => {
  try {
    const response = await api.get('/query', {
      params: {
        function: 'TOP_GAINERS_LOSERS',
      }
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch data');
  }
};

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
      className="bg-white mx-4 mb-3 rounded-lg p-4 shadow-sm border border-gray-200 flex-row items-center"
      onPress={() => router.push(`/stocks/product/${item.ticker}`)}
    >
      {/* Stock Icon Placeholder */}
      <View className="w-12 h-12 bg-gray-200 rounded-full mr-4" />

      {/* Stock Info */}
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 text-base">{item.ticker}</Text>
        <Text className="text-gray-500 text-sm mt-1">
          Vol: {parseInt(item.volume).toLocaleString()}
        </Text>
      </View>

      {/* Price Info */}
      <View className="items-end">
        <Text className="font-semibold text-gray-900 text-base">
          ${parseFloat(item.price).toFixed(2)}
        </Text>
        <Text
          className={`text-sm mt-1 font-medium ${section === 'gainers' ? 'text-green-600' : 'text-red-600'
            }`}
        >
          {section === 'gainers' ? '+' : ''}{item.change_percentage}
        </Text>
        <Text className="text-gray-500 text-xs mt-1">
          {section === 'gainers' ? '+' : ''}${parseFloat(item.change_amount).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-500">Loading {getTitle().toLowerCase()}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-lg text-red-600 text-center">
            Failed to load stocks data. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white shadow-sm flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 -ml-2"
        >
          <Text className="text-blue-600 text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">{getTitle()}</Text>
      </View>

      {/* Stocks List */}
      <FlatList
        data={getStockData().slice(0, 20)} // Show top 20
        renderItem={renderStockItem}
        keyExtractor={(item, index) => `${item.ticker}-${index}`}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-center">
              No {getTitle().toLowerCase()} data available
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ViewAllPage;