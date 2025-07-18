import SearchableStockInput from '@/components/ui/searchbox';
import { useRouter } from 'expo-router'; // or your navigation library
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface StockMatch {
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
}

const SearchPage: React.FC = () => {
    const router = useRouter();
    const [recentSearches, setRecentSearches] = useState<StockMatch[]>([]);

    const navigateToStock = (stock: StockMatch) => {
        const stockSymbol = stock['1. symbol'];
        console.log('Navigating to stock:', stockSymbol);
        router.push(`/stocks/product/${stockSymbol}`);
    };

    const handleStockSelect = (stock: StockMatch) => {
        // Add to recent searches (avoid duplicates)
        setRecentSearches(prev => {
            const filtered = prev.filter(item => item['1. symbol'] !== stock['1. symbol']);
            return [stock, ...filtered].slice(0, 5); // Keep only last 5
        });

        // Navigate to stock details page
        navigateToStock(stock);
    };

    const handleRecentStockPress = (stock: StockMatch) => {
        navigateToStock(stock);
    };

    return (
        <SafeAreaView className="flex-1 mt-5 bg-gray-50">
            <View className="px-4 py-4 bg-white border-b border-gray-200">
                <Text className="text-3xl font-bold text-gray-800">Search Stocks</Text>
            </View>

            <View className="px-4 py-4 bg-white border-b border-gray-200">
                <SearchableStockInput
                    onStockSelect={handleStockSelect}
                    placeholder="Search for stocks, ETFs, mutual funds..."
                    maxResults={8}
                />
            </View>

            <ScrollView className="flex-1 px-4">
                {recentSearches.length > 0 && (
                    <View className="mt-6 mb-4">
                        <Text className="text-xl font-semibold text-gray-800 mb-3">Recent Searches</Text>
                        {recentSearches.map((stock, index) => (
                            <TouchableOpacity
                                key={`${stock['1. symbol']}-${index}`}
                                className="flex-row justify-between items-center bg-white p-3 rounded-lg mb-2 shadow-sm"
                                onPress={() => handleRecentStockPress(stock)}
                            >
                                <View>
                                    <Text className="text-base font-bold text-gray-800">
                                        {stock['1. symbol']}
                                    </Text>
                                    <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={1}>
                                        {stock['2. name']}
                                    </Text>
                                </View>
                                <Text className="text-xs text-gray-400 font-medium">
                                    {stock['3. type']}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default SearchPage;