import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API Service
const fetchTopGainersLosers = async () => {
    const response = await api.get('/query?function=TOP_GAINERS_LOSERS&apikey=demo');
    return response.data;
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

const StocksHomePage = () => {
    const router = useRouter();

    const { data, isLoading, error } = useQuery<ApiResponse>({
        queryKey: ['topGainersLosers'],
        queryFn: fetchTopGainersLosers,
        staleTime: 5 * 60 * 1000,
    });

    const navigateToSearch = () => {
        console.log('Navigating to search page');
        router.push('/stocks/search');
    };

    const handleViewAll = (section: 'gainers' | 'losers') => {
        router.push(`/stocks/view-all/${section}`);
    };

    const renderLoadingContent = () => (
        <View className="flex-1 justify-center items-center pt-24">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-base text-gray-500 mt-3">Loading stocks data...</Text>
        </View>
    );

    const renderErrorContent = () => (
        <View className="flex-1 justify-center items-center px-4 pt-24">
            <Text className="text-base text-red-600 text-center">
                Failed to load stocks data. Please try again.
            </Text>
        </View>
    );

    const renderStocksContent = () => (
        <>
            {/* Top Gainers Section */}
            <View className="mt-6 px-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-semibold text-gray-900">Top Gainers</Text>
                    <TouchableOpacity onPress={() => handleViewAll('gainers')}>
                        <Text className="text-blue-600 font-medium">View All</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {data?.top_gainers?.slice(0, 4).map((stock, index) => (
                        <View key={index} className="w-[48%] mb-4">
                            <TouchableOpacity
                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                onPress={() => router.push(`/stocks/product/${stock.ticker}`)}
                            >
                                <View className="w-10 h-10 bg-gray-200 rounded-full mb-3" />
                                <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
                                    {stock.ticker}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    ${parseFloat(stock.price).toFixed(2)}
                                </Text>
                                <Text className="text-green-600 text-xs mt-1 font-medium">
                                    +{stock.change_percentage}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Top Losers Section */}
            <View className="mt-6 px-4">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-semibold text-gray-900">Top Losers</Text>
                    <TouchableOpacity onPress={() => handleViewAll('losers')}>
                        <Text className="text-blue-600 font-medium">View All</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {data?.top_losers?.slice(0, 4).map((stock, index) => (
                        <View key={index} className="w-[48%] mb-4">
                            <TouchableOpacity
                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                                onPress={() => router.push(`/stocks/product/${stock.ticker}`)}
                            >
                                <View className="w-10 h-10 bg-gray-200 rounded-full mb-3" />
                                <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
                                    {stock.ticker}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    ${parseFloat(stock.price).toFixed(2)}
                                </Text>
                                <Text className="text-red-600 text-xs mt-1 font-medium">
                                    {stock.change_percentage}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        </>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-4 bg-white shadow-sm flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Image
                        source={require('@/assets/images/icon.png')}
                        className="w-36 h-14 mr-3"
                        resizeMode="cover"
                    />
                </View>
                <TouchableOpacity
                    className="mt-2 bg-gray-100 rounded-lg px-4 py-3"
                    onPress={navigateToSearch}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center justify-between">
                        <Text className="text-base text-gray-400">Search here...</Text>
                        <Text className="text-base opacity-60">🔍</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {isLoading && renderLoadingContent()}
                {error && renderErrorContent()}
                {!isLoading && !error && data && renderStocksContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

export default StocksHomePage;