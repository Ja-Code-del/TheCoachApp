import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { calcTimeAgo } from '../lib/utils';

const PHOTO_SIZE = 80;

const LIGHT = {
  title: '#1a1a2e',
  timeAgo: 'rgba(0,0,0,0.4)',
  photoBorder: 'rgba(0,0,0,0.08)',
  photoAddBorder: 'rgba(0,0,0,0.12)',
  photoAddBg: 'rgba(0,0,0,0.03)',
  photoAddIcon: 'rgba(0,0,0,0.35)',
  placeholderBorder: 'rgba(0,0,0,0.10)',
  placeholderBg: 'rgba(0,0,0,0.02)',
  placeholderIcon: 'rgba(0,0,0,0.25)',
  placeholderText: 'rgba(0,0,0,0.3)',
  noteBg: '#f5f5f7',
  noteBorder: 'rgba(0,0,0,0.06)',
  noteText: '#374151',
  editBg: 'rgba(0,0,0,0.05)',
  editBorder: 'rgba(0,0,0,0.09)',
  editIcon: 'rgba(0,0,0,0.6)',
  editText: 'rgba(0,0,0,0.65)',
  shareBg: '#1a1a2e',
  shareIcon: '#ffffff',
  shareText: '#ffffff',
  deleteBg: 'rgba(220,38,38,0.08)',
  deleteBorder: 'rgba(220,38,38,0.18)',
  deleteIcon: 'rgba(220,38,38,0.8)',
};

const DARK = {
  title: '#ffffff',
  timeAgo: 'rgba(255,255,255,0.5)',
  photoBorder: 'rgba(255,255,255,0.15)',
  photoAddBorder: 'rgba(255,255,255,0.15)',
  photoAddBg: 'rgba(255,255,255,0.05)',
  photoAddIcon: 'rgba(255,255,255,0.5)',
  placeholderBorder: 'rgba(255,255,255,0.12)',
  placeholderBg: 'rgba(255,255,255,0.04)',
  placeholderIcon: 'rgba(255,255,255,0.3)',
  placeholderText: 'rgba(255,255,255,0.3)',
  noteBg: 'rgba(0,0,0,0.2)',
  noteBorder: 'rgba(255,255,255,0.1)',
  noteText: 'rgba(255,255,255,0.85)',
  editBg: 'rgba(255,255,255,0.12)',
  editBorder: 'rgba(255,255,255,0.2)',
  editIcon: 'rgba(255,255,255,0.8)',
  editText: 'rgba(255,255,255,0.8)',
  shareBg: '#ffffff',
  shareIcon: '#111111',
  shareText: '#111111',
  deleteBg: 'rgba(239,68,68,0.15)',
  deleteBorder: 'rgba(239,68,68,0.25)',
  deleteIcon: 'rgba(252,165,165,0.8)',
};

export default function MemoirScreen({
  event,
  onEdit,
  onShare,
  onDelete,
  isSharing,
  isDark,
}) {
  const c = isDark ? DARK : LIGHT;
  const memoir = event.memoir || { note: '', photos: [], createdAt: null };
  const timeAgo = calcTimeAgo(event.targetDate);
  const title = event.eventName || event.theme || 'Souvenir';
  const hasPhotos = memoir.photos.length > 0;
  const hasNote = memoir.note?.trim().length > 0;
  const hasContent = hasPhotos || hasNote;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, [event.id]);

  return (
    <Animated.View style={[
      styles.container,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>

      {/* Titre */}
      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: c.title }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.timeAgo, { color: c.timeAgo }]}>{timeAgo}</Text>
      </View>

      {/* Carousel photos */}
      <View style={styles.photosBlock}>
        {hasPhotos ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
            {memoir.photos.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={[styles.photo, { borderColor: c.photoBorder }]}
                resizeMode="cover"
              />
            ))}
            {memoir.photos.length < 6 && (
              <TouchableOpacity
                style={[styles.addPhotoBtn, { borderColor: c.photoAddBorder, backgroundColor: c.photoAddBg }]}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={20} color={c.photoAddIcon} />
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : (
          <TouchableOpacity
            style={[styles.photosPlaceholder, { borderColor: c.placeholderBorder, backgroundColor: c.placeholderBg }]}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Feather name="camera" size={22} color={c.placeholderIcon} />
            <Text style={[styles.placeholderText, { color: c.placeholderText }]}>Ajouter des photos</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Note */}
      <View style={[styles.noteBlock, { backgroundColor: c.noteBg, borderColor: c.noteBorder }]}>
        {hasNote ? (
          <ScrollView style={styles.noteScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.noteText, { color: c.noteText }]}>"{memoir.note}"</Text>
          </ScrollView>
        ) : (
          <TouchableOpacity style={styles.notePlaceholder} onPress={onEdit} activeOpacity={0.7}>
            <Feather name="edit-3" size={16} color={c.placeholderIcon} />
            <Text style={[styles.placeholderText, { color: c.placeholderText }]}>Écrire une note…</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: c.editBg, borderColor: c.editBorder }]}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={15} color={c.editIcon} />
          <Text style={[styles.editBtnText, { color: c.editText }]}>Éditer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: c.shareBg }, (!hasContent || isSharing) && styles.shareBtnDisabled]}
          onPress={onShare}
          disabled={!hasContent || isSharing}
          activeOpacity={0.85}
        >
          <Feather name="share" size={15} color={c.shareIcon} />
          <Text style={[styles.shareBtnText, { color: c.shareText }]}>
            {isSharing ? 'Capture…' : 'Partager'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: c.deleteBg, borderColor: c.deleteBorder }]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={15} color={c.deleteIcon} />
        </TouchableOpacity>
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 18,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_900Black',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  timeAgo: {
    fontSize: 13,
    fontFamily: 'Inter_300Light',
    letterSpacing: 1,
  },
  photosBlock: {
    height: PHOTO_SIZE + 8,
  },
  photosRow: {
    gap: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 16,
    borderWidth: 1,
  },
  addPhotoBtn: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photosPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
  },
  noteBlock: {
    minHeight: 90,
    maxHeight: 160,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  noteScroll: {
    flex: 1,
  },
  noteText: {
    fontSize: 15,
    fontFamily: 'Lora_400Regular_Italic',
    lineHeight: 24,
  },
  notePlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    fontFamily: 'Inter_300Light',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderWidth: 1,
    borderRadius: 16,
  },
  editBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  shareBtnDisabled: {
    opacity: 0.35,
  },
  shareBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  deleteBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
