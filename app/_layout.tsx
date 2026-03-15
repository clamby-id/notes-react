import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { NotesProvider } from '@/context/notes-context';

export default function RootLayout() {
  return (
    <NotesProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: false,
          headerTintColor: '#4F46E5',
          headerTitleStyle: { fontWeight: '700', color: '#111827' },
          contentStyle: { backgroundColor: '#F5F6FA' },
        }}>
        <Stack.Screen name="index" options={{ title: 'My Notes' }} />
        <Stack.Screen name="note/[id]" options={{ title: '' }} />
      </Stack>
      <StatusBar style="dark" />
    </NotesProvider>
  );
}
