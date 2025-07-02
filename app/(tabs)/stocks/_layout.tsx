import { Stack } from 'expo-router';

export default function StocksLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Stocks',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="search"
                options={{
                    title: 'search',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="product/[id]"
                options={{
                    title: 'Stock Details',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="view-all/[section]"
                options={{
                    title: 'View All',
                    headerShown: false
                }}
            />
        </Stack>
    );
}