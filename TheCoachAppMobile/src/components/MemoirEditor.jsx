import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const MAX_PHOTOS = 6;
const MAX_NOTE = 500;

const LIGHT = {
  title: '#1a1a2e',
  closeBg: 'rgba(0,0,0,0.06)',
  closeBorder: 'rgba(0,0,0,0.09)',
  closeIcon: 'rgba(0,0,0,0.5)',
  label: 'rgba(0,0,0,0.38)',
  charCount: 'rgba(0,0,0,0.3)',
  hint: 'rgba(0,0,0,0.25)',
  photoBorder: 'rgba(0,0,0,0.08)',
  photoAddBorder: 'rgba(0,0,0,0.12)',
  photoAddBg: 'rgba(0,0,0,0.03)',
  photoAddIcon: 'rgba(0,0,0,0.3)',
  photoAddText: 'rgba(0,0,0,0.35)',
  textareaBg: '#f5f5f7',
  textareaBorder: 'rgba(0,0,0,0.08)',
  textareaText: '#1a1a2e',
  textareaPlaceholder: 'rgba(0,0,0,0.25)',
  saveBg: '#1a1a2e',
  saveBorder: 'transparent',
  saveText: '#ffffff',
};

const DARK = {
  title: '#ffffff',
  closeBg: 'rgba(255,255,255,0.12)',
  closeBorder: 'rgba(255,255,255,0.2)',
  closeIcon: '#ffffff',
  label: 'rgba(255,255,255,0.4)',
  charCount: 'rgba(255,255,255,0.3)',
  hint: 'rgba(255,255,255,0.25)',
  photoBorder: 'rgba(255,255,255,0.15)',
  photoAddBorder: 'rgba(255,255,255,0.15)',
  photoAddBg: 'rgba(255,255,255,0.05)',
  photoAddIcon: 'rgba(255,255,255,0.4)',
  photoAddText: 'rgba(255,255,255,0.35)',
  textareaBg: 'rgba(255,255,255,0.08)',
  textareaBorder: 'rgba(255,255,255,0.15)',
  textareaText: '#ffffff',
  textareaPlaceholder: 'rgba(255,255,255,0.25)',
  saveBg: 'rgba(255,255,255,0.18)',
  saveBorder: 'rgba(255,255,255,0.3)',
  saveText: '#ffffff',
};

export default function MemoirEditor({ event, onSave, onClose, isDark }) {
  const c = isDark ? DARK : LIGHT;
  const memoir = event.memoir || { note: '', photos: [], createdAt: null };
  const [note, setNote] = useState(memoir.note || '');
  const [photos, setPhotos] = useState(memoir.photos || []);

  const handleAddPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "Autorise l'accès à ta galerie dans les Réglages pour ajouter des photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri);
      setPhotos(prev => [...prev, ...newUris].slice(0, MAX_PHOTOS));
    }
  };

  const handleRemovePhoto = (index) => {
    Alert.alert('Supprimer la photo ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setPhotos(prev => prev.filter((_, i) => i !== index)) },
    ]);
  };

  const handleSave = () => {
    onSave({ memoir: { note: note.trim(), photos, createdAt: memoir.createdAt || new Date().toISOString() } });
    onClose();
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.title }]}>Mon souvenir</Text>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: c.closeBg, borderColor: c.closeBorder }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={15} color={c.closeIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>

        {/* Photos */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.label }]}>Photos ({photos.length}/{MAX_PHOTOS})</Text>
          <View style={styles.photosGrid}>
            {photos.map((uri, i) => (
              <TouchableOpacity key={i} onLongPress={() => handleRemovePhoto(i)} activeOpacity={0.85} style={styles.photoWrapper}>
                <Image source={{ uri }} style={[styles.photoThumb, { borderColor: c.photoBorder }]} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhotoBtn} onPress={() => handleRemovePhoto(i)} activeOpacity={0.7}>
                  <Feather name="x" size={10} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                style={[styles.addPhotoBtn, { borderColor: c.photoAddBorder, backgroundColor: c.photoAddBg }]}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={22} color={c.photoAddIcon} />
                <Text style={[styles.addPhotoText, { color: c.photoAddText }]}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.hint, { color: c.hint }]}>Appuie longuement sur une photo pour la supprimer.</Text>
        </View>

        {/* Note */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: c.label }]}>Note</Text>
            <Text style={[styles.charCount, { color: c.charCount }]}>{note.length}/{MAX_NOTE}</Text>
          </View>
          <TextInput
            style={[styles.textarea, { backgroundColor: c.textareaBg, borderColor: c.textareaBorder, color: c.textareaText }]}
            value={note}
            onChangeText={v => setNote(v.slice(0, MAX_NOTE))}
            placeholder="Raconte ce que tu as vécu ce jour-là…"
            placeholderTextColor={c.textareaPlaceholder}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Enregistrer */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: c.saveBg, borderColor: c.saveBorder }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveBtnText, { color: c.saveText }]}>Enregistrer le souvenir</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_900Black',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 24,
    paddingBottom: 8,
  },
  field: {
    gap: 10,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 10,
    fontFamily: 'Inter_300Light',
  },
  hint: {
    fontSize: 10,
    fontFamily: 'Inter_300Light',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 10,
    fontFamily: 'Inter_300Light',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontFamily: 'Inter_300Light',
    minHeight: 120,
    lineHeight: 22,
  },
  saveBtn: {
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
