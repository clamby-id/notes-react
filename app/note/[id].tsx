import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNotes } from '@/context/notes-context';

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { getNoteById, addNote, updateNote, deleteNote } = useNotes();

  const existingNote = isNew ? undefined : getNoteById(id);

  const [title, setTitle] = useState(existingNote?.title ?? '');
  const [content, setContent] = useState(existingNote?.content ?? '');
  const [isEditing, setIsEditing] = useState(isNew);

  const router = useRouter();
  const navigation = useNavigation();
  const contentRef = useRef<TextInput>(null);

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      router.back();
      return;
    }
    if (isNew) {
      await addNote(title.trim(), content.trim());
    } else {
      await updateNote(id, title.trim(), content.trim());
    }
    setIsEditing(false);
    if (isNew) router.back();
  }, [isNew, title, content, id, addNote, updateNote, router]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(id);
          router.back();
        },
      },
    ]);
  }, [id, deleteNote, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isEditing ? (
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerIconButton}>
              <Ionicons name="pencil" size={20} color="#4F46E5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerIconButton}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ),
    });
  }, [navigation, isEditing, handleSave, handleDelete]);

  useEffect(() => {
    if (isNew) {
      setTimeout(() => contentRef.current?.focus(), 100);
    }
  }, [isNew]);

  const displayDate = existingNote
    ? new Date(existingNote.updatedAt).toLocaleString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#C4C6D8"
          editable={isEditing}
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
          multiline={false}
        />

        {displayDate && (
          <Text style={styles.dateText}>{displayDate}</Text>
        )}

        <View style={styles.divider} />

        <TextInput
          ref={contentRef}
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing..."
          placeholderTextColor="#C4C6D8"
          editable={isEditing}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    padding: 0,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    minHeight: 300,
    padding: 0,
  },
  headerButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    padding: 4,
  },
});
