import { api } from "@/lib/api";
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
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

interface ApiResponse {
  bestMatches: StockMatch[];
}

interface SearchableStockInputProps {
  onStockSelect?: (stock: StockMatch) => void;
  placeholder?: string;
  debounceMs?: number;
  maxResults?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const SearchableStockInput: React.FC<SearchableStockInputProps> = ({
  onStockSelect,
  placeholder = "Search stocks...",
  debounceMs = 500,
  maxResults = 10,
  containerStyle,
  inputStyle,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/query', {
          params: {
            function: 'SYMBOL_SEARCH',
            keywords: searchQuery,
          }
        });

        const data: ApiResponse = response.data;

        if (data.bestMatches && data.bestMatches.length > 0) {
          const limitedResults = data.bestMatches.slice(0, maxResults);
          setResults(limitedResults);
          setShowResults(true);
        } else {
          setResults([]);
          setShowResults(false);
          setError('No results found');
        }
      } catch (err) {
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [debounceMs, maxResults]
  );

  // Trigger search when query changes
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleStockSelect = (stock: StockMatch) => {
    setQuery(`${stock['1. symbol']} - ${stock['2. name']}`);
    setShowResults(false);
    onStockSelect?.(stock);
  };

  const renderStockItem = ({ item }: { item: StockMatch }) => {
    const matchPercentage = (parseFloat(item['9. matchScore']) * 100).toFixed(0);

    return (
      <TouchableOpacity
        className="p-4 border-b border-gray-100 bg-white"
        onPress={() => handleStockSelect(item)}
      >
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-base font-bold text-blue-600">{item['1. symbol']}</Text>
            <Text className="text-xs text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-full">
              {matchPercentage}%
            </Text>
          </View>
          <Text className="text-sm text-gray-800 mb-1.5 font-medium" numberOfLines={2}>
            {item['2. name']}
          </Text>
          <Text className="text-xs text-gray-600 mb-1">
            {item['3. type']} • {item['4. region']} • {item['8. currency']}
          </Text>
          <Text className="text-xs text-gray-500 italic">
            Market: {item['5. marketOpen']} - {item['6. marketClose']} ({item['7. timezone']})
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className={`relative z-50 ${containerStyle ? '' : ''}`} style={containerStyle}>
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 h-11 border border-gray-300">
        <TextInput
          className={`flex-1 text-base text-gray-800 py-0 ${inputStyle ? '' : ''}`}
          style={inputStyle}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        {loading && (
          <ActivityIndicator className="ml-2" size="small" color="#007AFF" />
        )}
      </View>

      {showResults && (
        <View className="absolute top-full left-0 right-0 bg-white rounded-lg border border-gray-300 border-t-0 max-h-80 shadow-lg">
          {error ? (
            <Text className="p-3 text-red-500 text-center text-sm">{error}</Text>
          ) : (
            <FlatList
              data={results}
              renderItem={renderStockItem}
              keyExtractor={(item) => item['1. symbol']}
              className="max-h-80"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </View>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default SearchableStockInput;