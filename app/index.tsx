import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Note, Priority, useNotes } from '@/context/notes-context';

type FilterOption = 'all' | Priority;

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'important', label: 'Important' },
  { value: 'not-so-important', label: 'Not So Important' },
  { value: 'for-fun', label: 'For Fun' },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  'important': { label: 'Important', color: '#EF4444' },
  'not-so-important': { label: 'Not So Important', color: '#F59E0B' },
  'for-fun': { label: 'For Fun', color: '#10B981' },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Today at ${timeStr}`;
  if (diffDays === 1) return `Yesterday at ${timeStr}`;
  if (diffDays < 7) {
    const dayName = date.toLocaleDateString([], { weekday: 'long' });
    return `${dayName} at ${timeStr}`;
  }
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return `${dateStr} at ${timeStr}`;
}

function NoteCard({ note, onPress }: { note: Note; onPress: () => void }) {
  const preview = note.content.trim().replace(/\n+/g, ' ');
  const priorityConfig = PRIORITY_CONFIG[note.priority ?? 'for-fun'];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {note.title || 'Untitled'}
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '1A', borderColor: priorityConfig.color + '40' }]}>
          <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
          <Text style={[styles.priorityBadgeText, { color: priorityConfig.color }]}>
            {priorityConfig.label}
          </Text>
        </View>
      </View>
      {preview.length > 0 && (
        <Text style={styles.cardPreview} numberOfLines={2}>
          {preview}
        </Text>
      )}
      <Text style={styles.cardDate}>{formatDate(note.updatedAt)}</Text>
    </TouchableOpacity>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#C7C9D9" />
      <Text style={styles.emptyTitle}>{filtered ? 'No notes here' : 'No notes yet'}</Text>
      <Text style={styles.emptySubtitle}>
        {filtered
          ? 'No notes match this filter'
          : 'Tap the + button to create your first note'}
      </Text>
    </View>
  );
}

export default function NotesListScreen() {
  const { notes } = useNotes();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const filteredNotes = activeFilter === 'all'
    ? notes
    : notes.filter((n) => (n.priority ?? 'for-fun') === activeFilter);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
        style={styles.filterBarWrapper}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.value)}
            activeOpacity={0.7}>
            <Text style={[styles.filterChipText, activeFilter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard note={item} onPress={() => router.push(`/note/${item.id}`)} />
        )}
        contentContainerStyle={filteredNotes.length === 0 ? styles.listEmpty : styles.listContent}
        ListEmptyComponent={<EmptyState filtered={activeFilter !== 'all'} />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/note/new')}
        activeOpacity={0.85}>
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  filterBarWrapper: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
});
