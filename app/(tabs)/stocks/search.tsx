import SearchableStockInput from '@/components/ui/searchbox';
import { useRouter } from 'expo-router'; // or your navigation library
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
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
    const [selectedStock, setSelectedStock] = useState<StockMatch | null>(null);
    const [recentSearches, setRecentSearches] = useState<StockMatch[]>([]);

    const navigateToStock = (stock: StockMatch) => {
        const stockSymbol = stock['1. symbol'];
        console.log('Navigating to stock:', stockSymbol);
        router.push(`/stocks/product/${stockSymbol}`);
    };

    const handleStockSelect = (stock: StockMatch) => {
        setSelectedStock(stock);

        // Add to recent searches (avoid duplicates)
        setRecentSearches(prev => {
            const filtered = prev.filter(item => item['1. symbol'] !== stock['1. symbol']);
            return [stock, ...filtered].slice(0, 5); // Keep only last 5
        });

        // Navigate to stock details page
        navigateToStock(stock);
    };

    const handleRecentStockPress = (stock: StockMatch) => {
        setSelectedStock(stock);
        navigateToStock(stock);
    };

    return (
        <SafeAreaView style={searchPageStyles.container}>
            <View style={searchPageStyles.header}>
                <Text style={searchPageStyles.title}>Search Stocks</Text>
            </View>

            <View style={searchPageStyles.searchSection}>
                <SearchableStockInput
                    onStockSelect={handleStockSelect}
                    placeholder="Search for stocks, ETFs, mutual funds..."
                    maxResults={8}
                />
            </View>

            <ScrollView style={searchPageStyles.content}>
                {selectedStock && (
                    <View style={searchPageStyles.selectedStockCard}>
                        <Text style={searchPageStyles.cardTitle}>Selected Stock</Text>
                        <View style={searchPageStyles.stockDetails}>
                            <Text style={searchPageStyles.stockSymbol}>
                                {selectedStock['1. symbol']}
                            </Text>
                            <Text style={searchPageStyles.stockName}>
                                {selectedStock['2. name']}
                            </Text>
                            <Text style={searchPageStyles.stockInfo}>
                                {selectedStock['3. type']} • {selectedStock['4. region']}
                            </Text>
                            <Text style={searchPageStyles.stockInfo}>
                                Currency: {selectedStock['8. currency']}
                            </Text>
                            <Text style={searchPageStyles.stockInfo}>
                                Market Hours: {selectedStock['5. marketOpen']} - {selectedStock['6. marketClose']}
                            </Text>
                            <Text style={searchPageStyles.stockInfo}>
                                Timezone: {selectedStock['7. timezone']}
                            </Text>
                        </View>
                    </View>
                )}

                {recentSearches.length > 0 && (
                    <View style={searchPageStyles.recentSection}>
                        <Text style={searchPageStyles.sectionTitle}>Recent Searches</Text>
                        {recentSearches.map((stock, index) => (
                            <TouchableOpacity
                                key={`${stock['1. symbol']}-${index}`}
                                style={searchPageStyles.recentItem}
                                onPress={() => handleRecentStockPress(stock)}
                            >
                                <View>
                                    <Text style={searchPageStyles.recentSymbol}>
                                        {stock['1. symbol']}
                                    </Text>
                                    <Text style={searchPageStyles.recentName} numberOfLines={1}>
                                        {stock['2. name']}
                                    </Text>
                                </View>
                                <Text style={searchPageStyles.recentType}>
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

const searchPageStyles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    selectedStockCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    stockDetails: {
        gap: 8,
    },
    stockSymbol: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    stockName: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    stockInfo: {
        fontSize: 14,
        color: '#666',
    },
    recentSection: {
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    recentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    recentSymbol: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    recentName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    recentType: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
});

export default SearchPage;