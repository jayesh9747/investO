import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface StockCardProps {
  ticker: string;
  price: string;
  changePercentage: string;
  changeAmount: string;
  onPress: () => void;
  variant?: 'gainer' | 'loser';
}

const StockCard: React.FC<StockCardProps> = ({
  ticker,
  price,
  changePercentage,
  changeAmount,
  onPress,
  variant = 'gainer'
}) => {
  const isGainer = variant === 'gainer';
  const changeColor = isGainer ? 'text-green-600' : 'text-red-600';
  const changePrefix = isGainer ? '+' : '';

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Stock Icon Placeholder */}
      <View className="w-10 h-10 bg-gray-200 rounded-full mb-3" />
      
      {/* Stock Symbol */}
      <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>
        {ticker}
      </Text>
      
      {/* Stock Price */}
      <Text className="text-gray-600 text-xs mt-1">
        ${parseFloat(price).toFixed(2)}
      </Text>
      
      {/* Change Percentage */}
      <Text className={`text-xs mt-1 font-medium ${changeColor}`}>
        {changePrefix}{changePercentage}
      </Text>
      
      {/* Change Amount (optional, only show if needed) */}
      {changeAmount && (
        <Text className={`text-xs mt-0.5 ${changeColor}`}>
          {changePrefix}${parseFloat(changeAmount).toFixed(2)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default StockCard;