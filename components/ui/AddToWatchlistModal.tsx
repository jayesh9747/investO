import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-4 pb-3 border-b border-gray-200">
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-base text-blue-600">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-black">Add to Watchlist</Text>
          <View className="w-12" />
        </View>

        {/* Stock Info */}
        <View className="px-5 py-4 bg-gray-50 border-b border-gray-200">
          <Text className="text-lg font-bold text-black mb-1">{stock.symbol}</Text>
          <Text className="text-sm text-gray-600">{stock.name}</Text>
        </View>

        {/* Content */}
        <ScrollView className="flex-1">
          {/* Create New Watchlist Section */}
          <View className="px-5 py-4">
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3 px-4 items-center"
              onPress={() => setShowCreateNew(!showCreateNew)}
            >
              <Text className="text-base font-semibold text-white">+ Create New Watchlist</Text>
            </TouchableOpacity>

            {showCreateNew && (
              <View className="mt-4 bg-gray-50 rounded-lg p-4">
                <TextInput
                  className="bg-white rounded-lg px-3 py-2.5 text-base border border-gray-300 mb-3"
                  placeholder="Enter watchlist name"
                  value={newWatchlistName}
                  onChangeText={setNewWatchlistName}
                  autoFocus
                />
                <View className="flex-row justify-end gap-3">
                  <TouchableOpacity
                    className="py-2 px-4"
                    onPress={() => {
                      setShowCreateNew(false);
                      setNewWatchlistName('');
                    }}
                  >
                    <Text className="text-base text-gray-600">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`rounded-md py-2 px-4 ${newWatchlistName.trim() ? 'bg-blue-600' : 'bg-gray-400'
                      }`}
                    onPress={handleCreateWatchlist}
                    disabled={!newWatchlistName.trim()}
                  >
                    <Text className="text-base font-semibold text-white">Create & Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Existing Watchlists */}
          {watchlists.length > 0 && (
            <View className="px-5 py-4">
              <Text className="text-base font-semibold text-black mb-3">Select Existing Watchlists</Text>
              {watchlists.map((watchlist) => {
                const isAlreadyInWatchlist = stockWatchlistIds.includes(watchlist.id);
                const isSelected = selectedWatchlistIds.includes(watchlist.id);

                return (
                  <TouchableOpacity
                    key={watchlist.id}
                    className={`flex-row justify-between items-center py-3 px-4 rounded-lg mb-2 ${isSelected
                        ? 'bg-blue-50 border-2 border-blue-600'
                        : isAlreadyInWatchlist
                          ? 'bg-gray-100 opacity-60'
                          : 'bg-gray-50'
                      }`}
                    onPress={() => !isAlreadyInWatchlist && handleToggleWatchlist(watchlist.id)}
                    disabled={isAlreadyInWatchlist}
                  >
                    <View className="flex-1">
                      <Text className={`text-base font-semibold mb-0.5 ${isAlreadyInWatchlist ? 'text-gray-500' : 'text-black'
                        }`}>
                        {watchlist.name}
                      </Text>
                      <Text className={`text-sm ${isAlreadyInWatchlist ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                        {watchlist.items.length} stocks
                      </Text>
                    </View>
                    <View className="ml-3">
                      {isAlreadyInWatchlist ? (
                        <Text className="text-sm text-green-600 font-semibold">✓ Added</Text>
                      ) : (
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-400'
                          }`}>
                          {isSelected && <Text className="text-white text-sm font-bold">✓</Text>}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {watchlists.length === 0 && !showCreateNew && (
            <View className="items-center py-10">
              <Text className="text-lg font-semibold text-gray-600 mb-2">No watchlists yet</Text>
              <Text className="text-sm text-gray-500 text-center">Create your first watchlist to get started</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {selectedWatchlistIds.length > 0 && (
          <View className="px-5 py-4 border-t border-gray-200 bg-white">
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3.5 items-center"
              onPress={handleAddToSelected}
            >
              <Text className="text-base font-semibold text-white">
                Add to {selectedWatchlistIds.length} Watchlist{selectedWatchlistIds.length > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};