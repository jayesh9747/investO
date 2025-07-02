// SearchableStockInput.tsx
import Constants from 'expo-constants';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Types for API response
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

const apiKey = Constants.expoConfig?.extra?.apiKey;

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
        const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`;
        const response = await fetch(url);
        const data: ApiResponse = await response.json();

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
    [debounceMs, maxResults, apiKey]
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
        style={styles.resultItem}
        onPress={() => handleStockSelect(item)}
      >
        <View style={styles.stockInfo}>
          <View style={styles.symbolRow}>
            <Text style={styles.stockSymbol}>{item['1. symbol']}</Text>
            <Text style={styles.matchScore}>{matchPercentage}%</Text>
          </View>
          <Text style={styles.stockName} numberOfLines={2}>
            {item['2. name']}
          </Text>
          <Text style={styles.stockDetails}>
            {item['3. type']} • {item['4. region']} • {item['8. currency']}
          </Text>
          <Text style={styles.marketHours}>
            Market: {item['5. marketOpen']} - {item['6. marketClose']} ({item['7. timezone']})
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, inputStyle]}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        {loading && (
          <ActivityIndicator style={styles.loadingIndicator} size="small" color="#007AFF" />
        )}
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={results}
              renderItem={renderStockItem}
              keyExtractor={(item) => item['1. symbol']}
              style={styles.resultsList}
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopWidth: 0,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  stockInfo: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  stockName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  stockDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  marketHours: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  matchScore: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  errorText: {
    padding: 12,
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default SearchableStockInput;