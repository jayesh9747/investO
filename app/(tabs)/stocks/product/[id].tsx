import { api } from '@/lib/api';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { JSX, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


// Type definitions - Only fields that are actually used in the UI
interface StockOverview {
    Symbol: string;
    Name: string;
    Description: string;
    Address: string;
    MarketCapitalization: string;
    PERatio: string;
    EPS: string;
    RevenueTTM: string;
    ProfitMargin: string;
    Beta: string;
    '52WeekHigh': string;
    '52WeekLow': string;
    DividendYield: string;
    SharesOutstanding: string;
    BookValue: string;
}

interface AnnualEarning {
    fiscalDateEnding: string;
    reportedEPS: string;
}

interface QuarterlyEarning {
    fiscalDateEnding: string;
    reportedDate: string;
    reportedEPS: string;
    estimatedEPS: string;
    surprise: string;
    surprisePercentage: string;
    reportTime: string;
}

interface EarningsData {
    symbol: string;
    annualEarnings: AnnualEarning[];
    quarterlyEarnings: QuarterlyEarning[];
}

interface EarningsChartProps {
    data: AnnualEarning[] | QuarterlyEarning[];
    type: 'annual' | 'quarterly';
}

type EarningsType = 'annual' | 'quarterly';

// Mock chart data for demonstration
const generateChartData = (): number[] => {
    const data: number[] = [];
    for (let i = 0; i < 50; i++) {
        data.push(Math.random() * 20 + 10);
    }
    return data;
};

// Earnings Bar Chart component
const EarningsChart: React.FC<EarningsChartProps> = ({ data, type }) => {
    if (!data || data.length === 0) return null;

    const earnings = data.slice(0, 8);
    const maxEPS = Math.max(...earnings.map(item => Math.abs(parseFloat(item.reportedEPS))));
    const chartHeight = 120; // Fixed chart height

    return (
        <View className="bg-gray-50 rounded-lg p-4 mb-3">
            <View className="flex-row justify-around items-end" style={{ height: chartHeight + 40 }}>
                {earnings.map((item, index) => {
                    const eps = parseFloat(item.reportedEPS);
                    const isPositive = eps >= 0;
                    // Ensure bar height doesn't exceed chart height and has minimum visibility
                    const barHeight = Math.max(
                        Math.min((Math.abs(eps) / maxEPS) * chartHeight, chartHeight),
                        2 // Minimum height for visibility
                    );

                    // Fixed year calculation
                    let year: string;
                    if (type === 'annual') {
                        year = item.fiscalDateEnding.split('-')[0];
                    } else {
                        const dateParts = item.fiscalDateEnding.split('-');
                        const month = parseInt(dateParts[1]);
                        const quarter = Math.ceil(month / 3);
                        year = `${dateParts[0]}Q${quarter}`;
                    }

                    return (
                        <View key={index} className="items-center flex-1 mx-0.5">
                            {/* Bar container with proper height */}
                            <View
                                className="justify-end items-center"
                                style={{ height: chartHeight, width: 18 }}
                            >
                                <View
                                    style={{
                                        height: barHeight,
                                        width: 16,
                                        backgroundColor: isPositive ? '#10b981' : '#ef4444', // green-500 : red-500
                                        borderRadius: 2,
                                    }}
                                />
                            </View>

                            {/* Labels */}
                            <Text className="text-xs text-gray-600 mt-1 text-center" style={{ fontSize: 10 }}>
                                {year}
                            </Text>
                            <Text className="text-xs text-black font-semibold mt-0.5 text-center" style={{ fontSize: 10 }}>
                                {eps.toFixed(2)}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const fetchStockData = async (symbol: string): Promise<StockOverview> => {
    const response = await api.get('/query', {
        params: {
            function: 'OVERVIEW',
            symbol: symbol,
        }
    });
    console.log("this is response overvirw of stock", response.data)
    return response.data;
};

const fetchEarningsData = async (symbol: string): Promise<EarningsData> => {
    const response = await api.get('query', {
        params: {
            function: 'EARNINGS',
            symbol: symbol,
        }
    });
    console.log("this is data of the earnings", response.data)
    return response.data;
};

export default function StockDetailsScreen(): JSX.Element {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [earningsType, setEarningsType] = useState<EarningsType>('annual');
    const [showWatchlistModal, setShowWatchlistModal] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState('');
    const [selectedWatchlists, setSelectedWatchlists] = useState<Set<string>>(new Set());

    const chartData = generateChartData();

    const {
        watchlists,
        createWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        isStockInWatchlist,
        getWatchlistsForStock
    } = useWatchlistStore();

    const { data: stockData, isLoading: stockLoading, error: stockError } = useQuery<StockOverview>({
        queryKey: ['stock', id],
        queryFn: () => fetchStockData(id as string),
        enabled: !!id,
    });

    const { data: earningsData, isLoading: earningsLoading, error: earningsError } = useQuery<EarningsData>({
        queryKey: ['earnings', id],
        queryFn: () => fetchEarningsData(id as string),
        enabled: !!id,
    });

    // Get watchlists that contain this stock
    const stockWatchlists = React.useMemo(() => {
        if (!stockData?.Symbol) return [];
        return getWatchlistsForStock(stockData.Symbol);
    }, [stockData?.Symbol, getWatchlistsForStock, watchlists]);

    // Initialize selected watchlists when modal opens
    React.useEffect(() => {
        if (showWatchlistModal && stockData?.Symbol) {
            const currentWatchlists = getWatchlistsForStock(stockData.Symbol);
            setSelectedWatchlists(new Set(currentWatchlists.map(w => w.id)));
        }
    }, [showWatchlistModal, stockData?.Symbol, getWatchlistsForStock]);

    const handleCreateNewWatchlist = () => {
        if (newWatchlistName.trim()) {
            const newWatchlistId = createWatchlist(newWatchlistName.trim());
            setSelectedWatchlists(prev => new Set([...prev, newWatchlistId]));
            setNewWatchlistName('');
        }
    };

    const handleWatchlistToggle = (watchlistId: string) => {
        setSelectedWatchlists(prev => {
            const newSet = new Set(prev);
            if (newSet.has(watchlistId)) {
                newSet.delete(watchlistId);
            } else {
                newSet.add(watchlistId);
            }
            return newSet;
        });
    };

    const handleSaveWatchlists = () => {
        console.log("$%$%$%$%$%$", id)

        // Early return if id is not available
        if (!id) {
            console.log("No ID available");
            return;
        }

        console.log("Enter into this ")

        const currentWatchlists = getWatchlistsForStock(id);
        const currentWatchlistIds = new Set(currentWatchlists.map(w => w.id));

        // Add to new watchlists
        selectedWatchlists.forEach(watchlistId => {
            if (!currentWatchlistIds.has(watchlistId)) {
                addToWatchlist(watchlistId, {
                    symbol: id,
                    name: stockData?.Name || id, // Use stockData.Name if available, otherwise fallback to id
                });
            }
        });

        // Remove from unselected watchlists
        currentWatchlists.forEach(watchlist => {
            if (!selectedWatchlists.has(watchlist.id)) {
                const stockItem = watchlist.items.find(item => item.symbol === id);
                if (stockItem) {
                    removeFromWatchlist(watchlist.id, stockItem.id);
                }
            }
        });

        setShowWatchlistModal(false);

        // Show success message
        const addedCount = selectedWatchlists.size;
        if (addedCount > 0) {
            Alert.alert(
                'Success',
                `${id} has been ${addedCount === 1 ? 'added to 1 watchlist' : `added to ${addedCount} watchlists`}.`
            );
        }
    };

    if (stockLoading || earningsLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#007AFF" />
                <Text className="mt-4 text-base text-gray-600">Loading stock data...</Text>
            </View>
        );
    }

    if (stockError || earningsError) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-base text-red-500">Error loading stock data</Text>
            </View>
        );
    }

    if (!stockData) {
        return <></>;
    }

    const formatValue = (value: string | undefined): string => {
        if (value === 'None' || value === '-' || !value) return 'N/A';
        return value;
    };

    const formatCurrency = (value: string | undefined): string => {
        if (value === 'None' || value === '-' || !value) return 'N/A';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'N/A';
        return `$${numValue.toLocaleString()}`;
    };

    const formatPercentage = (value: string | undefined): string => {
        if (value === 'None' || value === '-' || !value) return 'N/A';
        const numValue = parseFloat(value) * 100;
        if (isNaN(numValue)) return 'N/A';
        return `${numValue.toFixed(2)}%`;
    };

    const handleEarningsTypeChange = (type: EarningsType): void => {
        setEarningsType(type);
    };

    return (
        <>
            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-5 pt-5 pb-4">
                    <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-lg bg-black justify-center items-center mr-3">
                            <Text className="text-white text-base font-bold">
                                {stockData.Symbol?.charAt(0) || 'S'}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-black mb-0.5">
                                {stockData.Name}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                {stockData.Symbol}
                            </Text>
                        </View>
                    </View>
                    <Text className="text-lg font-bold text-black">
                        {formatCurrency(stockData.BookValue)}
                    </Text>
                </View>

                {/* Add to Watchlist Button */}
                <View className="px-5 py-4">
                    <TouchableOpacity
                        className="bg-blue-500 rounded-lg py-3 px-5 items-center"
                        onPress={() => setShowWatchlistModal(true)}
                    >
                        <Text className="text-white text-base font-semibold">
                            {stockWatchlists.length > 0
                                ? `In ${stockWatchlists.length} watchlist${stockWatchlists.length === 1 ? '' : 's'}`
                                : 'Add to Watchlist'
                            }
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Earnings Section */}
                {earningsData && (
                    <View className="px-5 py-4 border-t border-gray-200">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-black">Earnings</Text>
                            <View className="flex-row bg-gray-200 rounded-lg p-0.5">
                                <TouchableOpacity
                                    className={`px-4 py-2 rounded-md ${earningsType === 'annual' ? 'bg-blue-500' : ''}`}
                                    onPress={() => handleEarningsTypeChange('annual')}
                                >
                                    <Text className={`text-sm font-medium ${earningsType === 'annual' ? 'text-white' : 'text-gray-600'}`}>
                                        Annual
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`px-4 py-2 rounded-md ${earningsType === 'quarterly' ? 'bg-blue-500' : ''}`}
                                    onPress={() => handleEarningsTypeChange('quarterly')}
                                >
                                    <Text className={`text-sm font-medium ${earningsType === 'quarterly' ? 'text-white' : 'text-gray-600'}`}>
                                        Quarterly
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <EarningsChart
                            data={earningsType === 'annual' ? earningsData.annualEarnings : earningsData.quarterlyEarnings}
                            type={earningsType}
                        />

                        <Text className="text-xs text-gray-600 italic text-center">
                            EPS (Earnings Per Share) - Green bars indicate positive earnings, red bars indicate losses
                        </Text>
                    </View>
                )}

                {/* About Section */}
                <View className="px-5 py-4 border-t border-gray-200">
                    <Text className="text-lg font-bold text-black mb-3">About {stockData.Symbol}</Text>
                    <Text className="text-sm text-gray-600 leading-5 mb-4">{stockData.Description}</Text>

                    <View className="bg-gray-50 rounded-lg p-4">
                        <View className="flex-row justify-between items-center py-2">
                            <Text className="text-sm text-gray-600">CEO</Text>
                            <Text className="text-sm text-black font-medium">N/A</Text>
                        </View>
                        <View className="flex-row justify-between items-center py-2">
                            <Text className="text-sm text-gray-600">Founded</Text>
                            <Text className="text-sm text-black font-medium">N/A</Text>
                        </View>
                        <View className="flex-row justify-between items-center py-2">
                            <Text className="text-sm text-gray-600">Employees</Text>
                            <Text className="text-sm text-black font-medium">N/A</Text>
                        </View>
                        <View className="flex-row justify-between items-center py-2">
                            <Text className="text-sm text-gray-600">Headquarters</Text>
                            <Text className="text-sm text-black font-medium">
                                {stockData.Address?.split(',')[0] || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Key Statistics */}
                <View className="px-5 py-4 border-t border-gray-200">
                    <Text className="text-lg font-bold text-black mb-3">Key Statistics</Text>

                    <View className="flex-row flex-wrap -mx-2">
                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">Market Cap</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatCurrency(stockData.MarketCapitalization)}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">P/E Ratio</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatValue(stockData.PERatio)}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">EPS</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatValue(stockData.EPS)}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">Revenue TTM</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatCurrency(stockData.RevenueTTM)}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">Profit Margin</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatPercentage(stockData.ProfitMargin)}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">Beta</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatValue(stockData.Beta)}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">52W High</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatCurrency(stockData['52WeekHigh'])}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">52W Low</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatCurrency(stockData['52WeekLow'])}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">Dividend Yield</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatValue(stockData.DividendYield)}
                            </Text>
                        </View>

                        <View className="w-1/2 px-2 py-3">
                            <Text className="text-sm text-gray-600 mb-1">Shares Outstanding</Text>
                            <Text className="text-base text-black font-semibold">
                                {formatValue(stockData.SharesOutstanding)}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Watchlist Modal */}
            <Modal
                visible={showWatchlistModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View className="flex-1 bg-white">
                    <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
                        <TouchableOpacity onPress={() => setShowWatchlistModal(false)}>
                            <Text className="text-base text-blue-500">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-semibold text-black">Add to Watchlist</Text>
                        <TouchableOpacity onPress={handleSaveWatchlists}>
                            <Text className="text-base font-semibold text-blue-500">Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-5 pt-5">
                        {/* Create New Watchlist */}
                        <View className="mb-8 pb-5 border-b border-gray-200">
                            <Text className="text-base font-semibold text-black mb-3">New Watchlist Name</Text>
                            <View className="flex-row items-center gap-3">
                                <TextInput
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white"
                                    placeholder="Enter watchlist name"
                                    value={newWatchlistName}
                                    onChangeText={setNewWatchlistName}
                                />
                                <TouchableOpacity
                                    className={`px-5 py-2.5 rounded-lg min-w-15 items-center ${newWatchlistName.trim() ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}
                                    onPress={handleCreateNewWatchlist}
                                    disabled={!newWatchlistName.trim()}
                                >
                                    <Text className={`text-base font-semibold ${newWatchlistName.trim() ? 'text-white' : 'text-gray-500'
                                        }`}>
                                        Add
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Existing Watchlists */}
                        <View className="flex-1">
                            {watchlists.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Text className="text-base text-gray-600 text-center">
                                        No watchlists yet. Create your first one above.
                                    </Text>
                                </View>
                            ) : (
                                watchlists.map((watchlist) => (
                                    <TouchableOpacity
                                        key={watchlist.id}
                                        className="flex-row items-center py-4 border-b border-gray-200"
                                        onPress={() => handleWatchlistToggle(watchlist.id)}
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <View className={`w-6 h-6 rounded border-2 mr-4 items-center justify-center ${selectedWatchlists.has(watchlist.id)
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                                }`}>
                                                {selectedWatchlists.has(watchlist.id) && (
                                                    <Text className="text-white text-sm font-bold">✓</Text>
                                                )}
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-base font-semibold text-black mb-0.5">
                                                    {watchlist.name}
                                                </Text>
                                                <Text className="text-sm text-gray-600">
                                                    {watchlist.items.length} stock{watchlist.items.length === 1 ? '' : 's'}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
}