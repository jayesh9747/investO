import { useWatchlistStore } from '@/store/watchlistStore';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import React, { JSX, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Type definitions
interface StockOverview {
    Symbol: string;
    AssetType: string;
    Name: string;
    Description: string;
    CIK: string;
    Exchange: string;
    Currency: string;
    Country: string;
    Sector: string;
    Industry: string;
    Address: string;
    OfficialSite: string;
    FiscalYearEnd: string;
    LatestQuarter: string;
    MarketCapitalization: string;
    EBITDA: string;
    PERatio: string;
    PEGRatio: string;
    BookValue: string;
    DividendPerShare: string;
    DividendYield: string;
    EPS: string;
    RevenuePerShareTTM: string;
    ProfitMargin: string;
    OperatingMarginTTM: string;
    ReturnOnAssetsTTM: string;
    ReturnOnEquityTTM: string;
    RevenueTTM: string;
    GrossProfitTTM: string;
    DilutedEPSTTM: string;
    QuarterlyEarningsGrowthYOY: string;
    QuarterlyRevenueGrowthYOY: string;
    AnalystTargetPrice: string;
    AnalystRatingStrongBuy: string;
    AnalystRatingBuy: string;
    AnalystRatingHold: string;
    AnalystRatingSell: string;
    AnalystRatingStrongSell: string;
    TrailingPE: string;
    ForwardPE: string;
    PriceToSalesRatioTTM: string;
    PriceToBookRatio: string;
    EVToRevenue: string;
    EVToEBITDA: string;
    Beta: string;
    '52WeekHigh': string;
    '52WeekLow': string;
    '50DayMovingAverage': string;
    '200DayMovingAverage': string;
    SharesOutstanding: string;
    SharesFloat: string;
    PercentInsiders: string;
    PercentInstitutions: string;
    DividendDate: string;
    ExDividendDate: string;
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

const apiKey = Constants.expoConfig?.extra?.apiKey;

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

    return (
        <View style={styles.earningsChartContainer}>
            <View style={styles.earningsChart}>
                {earnings.map((item, index) => {
                    const eps = parseFloat(item.reportedEPS);
                    const isPositive = eps >= 0;
                    const barHeight = Math.abs(eps) / maxEPS * 120;
                    const year = type === 'annual'
                        ? item.fiscalDateEnding.split('-')[0]
                        : item.fiscalDateEnding.split('-')[0] + 'Q' + Math.ceil(parseInt(item.fiscalDateEnding.split('-')[1]) / 3);

                    return (
                        <View key={index} style={styles.earningsBarContainer}>
                            <View style={styles.earningsBarWrapper}>
                                <View
                                    style={[
                                        styles.earningsBar,
                                        {
                                            height: barHeight,
                                            backgroundColor: isPositive ? '#34C759' : '#FF3B30',
                                            alignSelf: isPositive ? 'flex-end' : 'flex-start',
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.earningsLabel}>{year}</Text>
                            <Text style={styles.earningsValue}>{eps.toFixed(2)}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const fetchStockData = async (symbol: string): Promise<StockOverview> => {
    const response = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
    );
    if (!response.ok) {
        throw new Error('Failed to fetch stock data');
    }
    return response.json();
};

const fetchEarningsData = async (symbol: string): Promise<EarningsData> => {
    const response = await fetch(
        `https://www.alphavantage.co/query?function=EARNINGS&symbol=${symbol}&apikey=${apiKey}`
    );
    if (!response.ok) {
        throw new Error('Failed to fetch earnings data');
    }
    return response.json();
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

    console.log("%%%%%%%%%%%%%%%%%", stockData)

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

    // const handleSaveWatchlists = () => {
    //     console.log("$%$%$%$%$%$")
    //     // if (!stockData?.Symbol || !stockData?.Name || !id) return;

    //     console.log("Enter into this ")

    //     const currentWatchlists = getWatchlistsForStock(stockData.Symbol || id);
    //     const currentWatchlistIds = new Set(currentWatchlists.map(w => w.id));

    //     // Add to new watchlists
    //     selectedWatchlists.forEach(watchlistId => {
    //         if (!currentWatchlistIds.has(watchlistId)) {
    //             addToWatchlist(watchlistId, {
    //                 symbol: stockData.Symbol || id,
    //                 name: stockData.Name,
    //             });
    //         }
    //     });

    //     // Remove from unselected watchlists
    //     currentWatchlists.forEach(watchlist => {
    //         if (!selectedWatchlists.has(watchlist.id)) {
    //             const stockItem = watchlist.items.find(item => item.symbol === stockData.Symbol);
    //             if (stockItem) {
    //                 removeFromWatchlist(watchlist.id, stockItem.id);
    //             }
    //         }
    //     });

    //     setShowWatchlistModal(false);

    //     // Show success message
    //     const addedCount = selectedWatchlists.size;
    //     if (addedCount > 0) {
    //         Alert.alert(
    //             'Success',
    //             `${stockData.Symbol} has been ${addedCount === 1 ? 'added to 1 watchlist' : `added to ${addedCount} watchlists`}.`
    //         );
    //     }
    // };

    const handleSaveWatchlists = () => {
        console.log("$%$%$%$%$%$" , id)

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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading stock data...</Text>
            </View>
        );
    }

    if (stockError || earningsError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading stock data</Text>
            </View>
        );
    }

    if (!stockData) {
        return <> </>;
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
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>{stockData.Symbol?.charAt(0) || 'S'}</Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.companyName}>{stockData.Name}</Text>
                            <Text style={styles.stockSymbol}>{stockData.Symbol}</Text>
                        </View>
                    </View>
                    <Text style={styles.stockPrice}>{formatCurrency(stockData.BookValue)}</Text>
                </View>

                {/* Add to Watchlist Button */}
                <View style={styles.watchlistButtonContainer}>
                    <TouchableOpacity
                        style={styles.watchlistButton}
                        onPress={() => setShowWatchlistModal(true)}
                    >
                        <Text style={styles.watchlistButtonText}>
                            {stockWatchlists.length > 0
                                ? `In ${stockWatchlists.length} watchlist${stockWatchlists.length === 1 ? '' : 's'}`
                                : 'Add to Watchlist'
                            }
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Earnings Section */}
                {earningsData && (
                    <View style={styles.section}>
                        <View style={styles.earningsSectionHeader}>
                            <Text style={styles.sectionTitle}>Earnings</Text>
                            <View style={styles.earningsToggle}>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleButton,
                                        earningsType === 'annual' && styles.activeToggleButton
                                    ]}
                                    onPress={() => handleEarningsTypeChange('annual')}
                                >
                                    <Text style={[
                                        styles.toggleButtonText,
                                        earningsType === 'annual' && styles.activeToggleButtonText
                                    ]}>Annual</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleButton,
                                        earningsType === 'quarterly' && styles.activeToggleButton
                                    ]}
                                    onPress={() => handleEarningsTypeChange('quarterly')}
                                >
                                    <Text style={[
                                        styles.toggleButtonText,
                                        earningsType === 'quarterly' && styles.activeToggleButtonText
                                    ]}>Quarterly</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <EarningsChart
                            data={earningsType === 'annual' ? earningsData.annualEarnings : earningsData.quarterlyEarnings}
                            type={earningsType}
                        />

                        <Text style={styles.earningsNote}>
                            EPS (Earnings Per Share) - Green bars indicate positive earnings, red bars indicate losses
                        </Text>
                    </View>
                )}

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About {stockData.Symbol}</Text>
                    <Text style={styles.description}>{stockData.Description}</Text>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>CEO</Text>
                            <Text style={styles.infoValue}>N/A</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Founded</Text>
                            <Text style={styles.infoValue}>N/A</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Employees</Text>
                            <Text style={styles.infoValue}>N/A</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Headquarters</Text>
                            <Text style={styles.infoValue}>{stockData.Address?.split(',')[0] || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Key Statistics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Statistics</Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Market Cap</Text>
                            <Text style={styles.statValue}>{formatCurrency(stockData.MarketCapitalization)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>P/E Ratio</Text>
                            <Text style={styles.statValue}>{formatValue(stockData.PERatio)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>EPS</Text>
                            <Text style={styles.statValue}>{formatValue(stockData.EPS)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Revenue TTM</Text>
                            <Text style={styles.statValue}>{formatCurrency(stockData.RevenueTTM)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Profit Margin</Text>
                            <Text style={styles.statValue}>{formatPercentage(stockData.ProfitMargin)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Beta</Text>
                            <Text style={styles.statValue}>{formatValue(stockData.Beta)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>52W High</Text>
                            <Text style={styles.statValue}>{formatCurrency(stockData['52WeekHigh'])}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>52W Low</Text>
                            <Text style={styles.statValue}>{formatCurrency(stockData['52WeekLow'])}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Dividend Yield</Text>
                            <Text style={styles.statValue}>{formatValue(stockData.DividendYield)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Shares Outstanding</Text>
                            <Text style={styles.statValue}>{formatValue(stockData.SharesOutstanding)}</Text>
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
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowWatchlistModal(false)}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add to Watchlist</Text>
                        <TouchableOpacity onPress={handleSaveWatchlists}>
                            <Text style={styles.modalSave}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Create New Watchlist */}
                        <View style={styles.createWatchlistSection}>
                            <Text style={styles.inputLabel}>New Watchlist Name</Text>
                            <View style={styles.createWatchlistRow}>
                                <TextInput
                                    style={styles.createWatchlistInput}
                                    placeholder="Enter watchlist name"
                                    value={newWatchlistName}
                                    onChangeText={setNewWatchlistName}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.addButton,
                                        !newWatchlistName.trim() && styles.addButtonDisabled
                                    ]}
                                    onPress={handleCreateNewWatchlist}
                                    disabled={!newWatchlistName.trim()}
                                >
                                    <Text style={[
                                        styles.addButtonText,
                                        !newWatchlistName.trim() && styles.addButtonTextDisabled
                                    ]}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Existing Watchlists */}
                        <View style={styles.watchlistsSection}>
                            {watchlists.length === 0 ? (
                                <View style={styles.emptyWatchlists}>
                                    <Text style={styles.emptyWatchlistsText}>
                                        No watchlists yet. Create your first one above.
                                    </Text>
                                </View>
                            ) : (
                                watchlists.map((watchlist) => (
                                    <TouchableOpacity
                                        key={watchlist.id}
                                        style={styles.watchlistItem}
                                        onPress={() => handleWatchlistToggle(watchlist.id)}
                                    >
                                        <View style={styles.watchlistItemLeft}>
                                            <View style={[
                                                styles.checkbox,
                                                selectedWatchlists.has(watchlist.id) && styles.checkboxSelected
                                            ]}>
                                                {selectedWatchlists.has(watchlist.id) && (
                                                    <Text style={styles.checkmark}>✓</Text>
                                                )}
                                            </View>
                                            <View style={styles.watchlistItemInfo}>
                                                <Text style={styles.watchlistItemName}>{watchlist.name}</Text>
                                                <Text style={styles.watchlistItemCount}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    errorText: {
        fontSize: 16,
        color: '#ff3b30',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 2,
    },
    stockSymbol: {
        fontSize: 14,
        color: '#666666',
    },
    stockPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    watchlistButtonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    watchlistButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    watchlistButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    chartSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    chartContainer: {
        height: 200,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
    },
    chartArea: {
        flex: 1,
        position: 'relative',
        margin: 16,
    },
    chartBar: {
        position: 'absolute',
        bottom: 0,
        width: 2,
        backgroundColor: '#007AFF',
    },
    chartControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
    },
    chartButton: {
        fontSize: 14,
        color: '#666666',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    activeChartButton: {
        color: '#007AFF',
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 16,
    },
    infoGrid: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666666',
    },
    infoValue: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    statItem: {
        width: '50%',
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    statLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '600',
    },
    earningsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    earningsToggle: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 2,
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    activeToggleButton: {
        backgroundColor: '#007AFF',
    },
    toggleButtonText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    activeToggleButtonText: {
        color: '#ffffff',
    },
    earningsChartContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    earningsChart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 160,
    },
    earningsBarContainer: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 2,
    },
    earningsBarWrapper: {
        height: 120,
        width: 20,
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'relative',
    },
    earningsBar: {
        width: 18,
        borderRadius: 2,
        minHeight: 4,
    },
    earningsLabel: {
        fontSize: 10,
        color: '#666666',
        marginTop: 4,
        textAlign: 'center',
    },
    earningsValue: {
        fontSize: 10,
        color: '#000000',
        fontWeight: '600',
        marginTop: 2,
        textAlign: 'center',
    },
    earningsNote: {
        fontSize: 12,
        color: '#666666',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalCancel: {
        fontSize: 16,
        color: '#007AFF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
    },
    modalSave: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    createWatchlistSection: {
        marginBottom: 32,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 12,
    },
    createWatchlistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    createWatchlistInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    addButtonTextDisabled: {
        color: '#9ca3af',
    },
    watchlistsSection: {
        flex: 1,
    },
    emptyWatchlists: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyWatchlistsText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    watchlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    watchlistItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    checkboxSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    checkmark: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    watchlistItemInfo: {
        flex: 1,
    },
    watchlistItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 2,
    },
    watchlistItemCount: {
        fontSize: 14,
        color: '#666666',
    },
});