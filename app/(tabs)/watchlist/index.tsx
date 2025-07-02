import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWatchlistStore, Watchlist, WatchlistItem } from '@/store/watchlistStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const WatchlistScreen: React.FC = () => {
    const router = useRouter();
    const { watchlists, deleteWatchlist, removeFromWatchlist, createWatchlist, renameWatchlist } = useWatchlistStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState('');
    const [editingWatchlist, setEditingWatchlist] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleCreateWatchlist = () => {
        if (newWatchlistName.trim()) {
            createWatchlist(newWatchlistName.trim());
            setNewWatchlistName('');
            setShowCreateModal(false);
        }
    };

    const handleDeleteWatchlist = (watchlist: Watchlist) => {
        Alert.alert(
            'Delete Watchlist',
            `Are you sure you want to delete "${watchlist.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteWatchlist(watchlist.id),
                },
            ]
        );
    };

    const handleRemoveFromWatchlist = (watchlistId: string, item: WatchlistItem) => {
        Alert.alert(
            'Remove Stock',
            `Remove ${item.symbol} from this watchlist?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeFromWatchlist(watchlistId, item.id),
                },
            ]
        );
    };

    const handleRenameWatchlist = (watchlistId: string) => {
        if (editName.trim()) {
            renameWatchlist(watchlistId, editName.trim());
            setEditingWatchlist(null);
            setEditName('');
        }
    };

    const startEditing = (watchlist: Watchlist) => {
        setEditingWatchlist(watchlist.id);
        setEditName(watchlist.name);
    };

    const cancelEditing = () => {
        setEditingWatchlist(null);
        setEditName('');
    };

    const navigateToStock = (symbol: string) => {
        console.log("this is stock of this ", symbol);
        router.push(`/(tabs)/stocks/product/${symbol}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Watchlists Yet</Text>
            <Text style={styles.emptySubtitle}>
                Create your first watchlist to start tracking your favorite stocks
            </Text>
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
            >
                <Text style={styles.createButtonText}>Create First Watchlist</Text>
            </TouchableOpacity>
        </View>
    );

    const renderWatchlistHeader = (watchlist: Watchlist) => (
        <View style={styles.watchlistHeader}>
            <View style={styles.watchlistHeaderLeft}>
                {editingWatchlist === watchlist.id ? (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.editInput}
                            value={editName}
                            onChangeText={setEditName}
                            onSubmitEditing={() => handleRenameWatchlist(watchlist.id)}
                            autoFocus
                        />
                        <View style={styles.editActions}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={cancelEditing}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => handleRenameWatchlist(watchlist.id)}
                            >
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <Text style={styles.watchlistName}>{watchlist.name}</Text>
                        <Text style={styles.watchlistMeta}>
                            {watchlist.items.length} stocks • Created {formatDate(watchlist.createdAt)}
                        </Text>
                    </>
                )}
            </View>

            {editingWatchlist !== watchlist.id && (
                <View style={styles.watchlistActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => startEditing(watchlist)}
                    >
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteWatchlist(watchlist)}
                    >
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderWatchlistItem = (watchlist: Watchlist, item: WatchlistItem) => (
        <TouchableOpacity
            key={item.id}
            style={styles.stockItem}
            onPress={() => navigateToStock(item.symbol)}
        >
            <View style={styles.stockInfo}>
                <View style={styles.stockIcon}>
                    <Text style={styles.stockIconText}>{item.symbol.charAt(0)}</Text>
                </View>
                <View style={styles.stockDetails}>
                    <Text style={styles.stockSymbol}>{item.symbol}</Text>
                    <Text style={styles.stockName} numberOfLines={1}>
                        {item.name}
                    </Text>
                </View>
            </View>
            <View style={styles.stockActions}>
                <Text style={styles.addedDate}>
                    Added {formatDate(item.addedAt)}
                </Text>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFromWatchlist(watchlist.id, item)}
                >
                    <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Watchlists</Text>
                    {watchlists.length > 0 && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <Text style={styles.addButtonText}>+ New</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {watchlists.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {watchlists.map((watchlist) => (
                            <View key={watchlist.id} style={styles.watchlistContainer}>
                                {renderWatchlistHeader(watchlist)}

                                {watchlist.items.length === 0 ? (
                                    <View style={styles.emptyWatchlist}>
                                        <Text style={styles.emptyWatchlistText}>
                                            No stocks in this watchlist yet
                                        </Text>
                                        <Text style={styles.emptyWatchlistSubtext}>
                                            Add stocks from the stock details page
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.stocksList}>
                                        {watchlist.items.map((item) =>
                                            renderWatchlistItem(watchlist, item)
                                        )}
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                )}


                {/* Create Watchlist Modal */}
                <Modal
                    visible={showCreateModal}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Text style={styles.modalCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>New Watchlist</Text>
                            <TouchableOpacity
                                onPress={handleCreateWatchlist}
                                disabled={!newWatchlistName.trim()}
                            >
                                <Text style={[
                                    styles.modalCreate,
                                    !newWatchlistName.trim() && styles.modalCreateDisabled
                                ]}>
                                    Create
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <Text style={styles.inputLabel}>Watchlist Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter watchlist name"
                                value={newWatchlistName}
                                onChangeText={setNewWatchlistName}
                                autoFocus
                            />
                        </View>
                    </View>
                </Modal>
            </View >
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    content: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    createButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    watchlistContainer: {
        marginBottom: 24,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    watchlistHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    watchlistHeaderLeft: {
        flex: 1,
        marginRight: 16,
    },
    watchlistName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    watchlistMeta: {
        fontSize: 14,
        color: '#666666',
    },
    watchlistActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#f8f9fa',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#fff5f5',
    },
    deleteButtonText: {
        color: '#dc3545',
    },
    editContainer: {
        gap: 12,
    },
    editInput: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#007AFF',
        paddingBottom: 4,
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    cancelText: {
        fontSize: 14,
        color: '#666666',
    },
    saveText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    emptyWatchlist: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyWatchlistText: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 4,
    },
    emptyWatchlistSubtext: {
        fontSize: 14,
        color: '#999999',
    },
    stocksList: {
        gap: 12,
    },
    stockItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    stockIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stockIconText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    stockDetails: {
        flex: 1,
    },
    stockSymbol: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 2,
    },
    stockName: {
        fontSize: 14,
        color: '#666666',
    },
    stockActions: {
        alignItems: 'flex-end',
    },
    addedDate: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 4,
    },
    removeButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    removeButtonText: {
        fontSize: 12,
        color: '#dc3545',
        fontWeight: '500',
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
    modalCreate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    modalCreateDisabled: {
        color: '#cccccc',
    },
    modalContent: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
        marginBottom: 8,
    },
    modalInput: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
    },
});

export default WatchlistScreen;