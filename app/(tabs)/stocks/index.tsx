import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// API Service
const fetchTopGainersLosers = async () => {
    const response = await api.get('/query?function=TOP_GAINERS_LOSERS');
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
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading stocks data...</Text>
        </View>
    );

    const renderErrorContent = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
                Failed to load stocks data. Please try again.
            </Text>
        </View>
    );

    const renderStocksContent = () => (
        <>
            {/* Top Gainers Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Gainers</Text>
                    <TouchableOpacity onPress={() => handleViewAll('gainers')}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stocksGrid}>
                    {data?.top_gainers?.slice(0, 4).map((stock, index) => (
                        <View key={index} style={styles.stockCardContainer}>
                            <TouchableOpacity
                                style={styles.stockCard}
                                onPress={() => router.push(`/stocks/product/${stock.ticker}`)}
                            >
                                <View style={styles.stockIcon} />
                                <Text style={styles.stockTicker} numberOfLines={1}>
                                    {stock.ticker}
                                </Text>
                                <Text style={styles.stockPrice}>
                                    ${parseFloat(stock.price).toFixed(2)}
                                </Text>
                                <Text style={styles.stockGainPercentage}>
                                    +{stock.change_percentage}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>

            {/* Top Losers Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Losers</Text>
                    <TouchableOpacity onPress={() => handleViewAll('losers')}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.stocksGrid}>
                    {data?.top_losers?.slice(0, 4).map((stock, index) => (
                        <View key={index} style={styles.stockCardContainer}>
                            <TouchableOpacity
                                style={styles.stockCard}
                                onPress={() => router.push(`/stocks/product/${stock.ticker}`)}
                            >
                                <View style={styles.stockIcon} />
                                <Text style={styles.stockTicker} numberOfLines={1}>
                                    {stock.ticker}
                                </Text>
                                <Text style={styles.stockPrice}>
                                    ${parseFloat(stock.price).toFixed(2)}
                                </Text>
                                <Text style={styles.stockLossPercentage}>
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Stocks App</Text>
                <TouchableOpacity
                    style={styles.searchContainer}
                    onPress={navigateToSearch}
                    activeOpacity={0.7}
                >
                    <View style={styles.searchPlaceholderContainer}>
                        <Text style={styles.searchPlaceholder}>Search here...</Text>
                        <Text style={styles.searchIcon}>🔍</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {isLoading && renderLoadingContent()}
                {error && renderErrorContent()}
                {!isLoading && !error && data && renderStocksContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
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
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    searchContainer: {
        marginTop: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchPlaceholderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    searchIcon: {
        fontSize: 16,
        opacity: 0.6,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 100,
    },
    errorText: {
        fontSize: 16,
        color: '#dc2626',
        textAlign: 'center',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    viewAllText: {
        color: '#2563eb',
        fontWeight: '500',
    },
    stocksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    stockCardContainer: {
        width: '48%',
        marginBottom: 16,
    },
    stockCard: {
        backgroundColor: 'white',
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
    },
    stockIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#e5e7eb',
        borderRadius: 20,
        marginBottom: 12,
    },
    stockTicker: {
        fontWeight: '600',
        color: '#111827',
        fontSize: 14,
    },
    stockPrice: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 4,
    },
    stockGainPercentage: {
        color: '#16a34a',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    stockLossPercentage: {
        color: '#dc2626',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
});

export default StocksHomePage;