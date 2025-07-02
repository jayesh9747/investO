import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useWatchlistStore, Watchlist } from '@/store/watchlistStore';

interface AddToWatchlistModalProps {
  visible: boolean;
  onClose: () => void;
  stock: {
    symbol: string;
    name: string;
  };
}

export const AddToWatchlistModal: React.FC<AddToWatchlistModalProps> = ({
  visible,
  onClose,
  stock,
}) => {
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [selectedWatchlistIds, setSelectedWatchlistIds] = useState<string[]>([]);

  const { watchlists, createWatchlist, addToWatchlist, getWatchlistsForStock } = useWatchlistStore();

  const stockWatchlists = getWatchlistsForStock(stock.symbol);
  const stockWatchlistIds = stockWatchlists.map(w => w.id);

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      const watchlistId = createWatchlist(newWatchlistName.trim());
      addToWatchlist(watchlistId, {
        symbol: stock.symbol,
        name: stock.name,
      });
      setNewWatchlistName('');
      setShowCreateNew(false);
      Alert.alert('Success', `Added ${stock.symbol} to "${newWatchlistName}"`);
      onClose();
    }
  };

  const handleToggleWatchlist = (watchlistId: string) => {
    if (selectedWatchlistIds.includes(watchlistId)) {
      setSelectedWatchlistIds(prev => prev.filter(id => id !== watchlistId));
    } else {
      setSelectedWatchlistIds(prev => [...prev, watchlistId]);
    }
  };

  const handleAddToSelected = () => {
    if (selectedWatchlistIds.length === 0) {
      Alert.alert('Error', 'Please select at least one watchlist');
      return;
    }

    selectedWatchlistIds.forEach(watchlistId => {
      addToWatchlist(watchlistId, {
        symbol: stock.symbol,
        name: stock.name,
      });
    });

    const selectedNames = watchlists
      .filter(w => selectedWatchlistIds.includes(w.id))
      .map(w => w.name)
      .join(', ');

    Alert.alert('Success', `Added ${stock.symbol} to: ${selectedNames}`);
    setSelectedWatchlistIds([]);
    onClose();
  };

  const handleClose = () => {
    setShowCreateNew(false);
    setNewWatchlistName('');
    setSelectedWatchlistIds([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add to Watchlist</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>{stock.symbol}</Text>
          <Text style={styles.stockName}>{stock.name}</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Create New Watchlist Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateNew(!showCreateNew)}
            >
              <Text style={styles.createButtonText}>+ Create New Watchlist</Text>
            </TouchableOpacity>

            {showCreateNew && (
              <View style={styles.createForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter watchlist name"
                  value={newWatchlistName}
                  onChangeText={setNewWatchlistName}
                  autoFocus
                />
                <View style={styles.createActions}>
                  <TouchableOpacity
                    style={styles.cancelCreateButton}
                    onPress={() => {
                      setShowCreateNew(false);
                      setNewWatchlistName('');
                    }}
                  >
                    <Text style={styles.cancelCreateText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmCreateButton,
                      !newWatchlistName.trim() && styles.disabledButton,
                    ]}
                    onPress={handleCreateWatchlist}
                    disabled={!newWatchlistName.trim()}
                  >
                    <Text style={styles.confirmCreateText}>Create & Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Existing Watchlists */}
          {watchlists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Existing Watchlists</Text>
              {watchlists.map((watchlist) => {
                const isAlreadyInWatchlist = stockWatchlistIds.includes(watchlist.id);
                const isSelected = selectedWatchlistIds.includes(watchlist.id);

                return (
                  <TouchableOpacity
                    key={watchlist.id}
                    style={[
                      styles.watchlistItem,
                      isSelected && styles.selectedWatchlistItem,
                      isAlreadyInWatchlist && styles.disabledWatchlistItem,
                    ]}
                    onPress={() => !isAlreadyInWatchlist && handleToggleWatchlist(watchlist.id)}
                    disabled={isAlreadyInWatchlist}
                  >
                    <View style={styles.watchlistInfo}>
                      <Text style={[
                        styles.watchlistName,
                        isAlreadyInWatchlist && styles.disabledText,
                      ]}>
                        {watchlist.name}
                      </Text>
                      <Text style={[
                        styles.watchlistCount,
                        isAlreadyInWatchlist && styles.disabledText,
                      ]}>
                        {watchlist.items.length} stocks
                      </Text>
                    </View>
                    <View style={styles.checkContainer}>
                      {isAlreadyInWatchlist ? (
                        <Text style={styles.alreadyAddedText}>✓ Added</Text>
                      ) : (
                        <View style={[
                          styles.checkbox,
                          isSelected && styles.checkedBox,
                        ]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {watchlists.length === 0 && !showCreateNew && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No watchlists yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first watchlist to get started</Text>
            </View>
          )}
        </ScrollView>

        {selectedWatchlistIds.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToSelected}
            >
              <Text style={styles.addButtonText}>
                Add to {selectedWatchlistIds.length} Watchlist{selectedWatchlistIds.length > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
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
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    width: 50,
  },
  stockInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  createForm: {
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelCreateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelCreateText: {
    fontSize: 16,
    color: '#666666',
  },
  confirmCreateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confirmCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedWatchlistItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  disabledWatchlistItem: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  watchlistInfo: {
    flex: 1,
  },
  watchlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  watchlistCount: {
    fontSize: 14,
    color: '#666666',
  },
  disabledText: {
    color: '#999999',
  },
  checkContainer: {
    marginLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alreadyAddedText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});