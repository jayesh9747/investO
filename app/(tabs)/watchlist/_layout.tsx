import { Stack } from 'expo-router';

export default function WatchlistLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Watchlist',
                    headerShown: true
                }}
            />
        </Stack>
    );
}