import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { FONTS } from '../../constants/fonts';

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function WidgetSettings({
  activeEvent, eventsCount,
  confirmDelete, setConfirmDelete,
  isLoadingQuote, isLoadingImage,
  onUpdateEvent, onSave, onClose, onDelete,
}) {
  const [dateError, setDateError] = useState('');
  const minDate = getTomorrowStr();

  const handleSave = () => {
    if (!activeEvent.targetDate || activeEvent.targetDate <= new Date().toISOString().split('T')[0]) {
      setDateError('La date doit être dans le futur (à partir de demain).');
      return;
    }
    setDateError('');
    onSave();
  };

  const isLoading = isLoadingQuote || isLoadingImage;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Réglages</Text>
        <View style={styles.headerActions}>
          {eventsCount > 1 && (
            !confirmDelete ? (
              <TouchableOpacity style={styles.trashBtn} onPress={() => setConfirmDelete(true)} activeOpacity={0.7}>
                <Text style={styles.trashIcon}>🗑</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.confirmRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmDelete(false)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                  <Text style={styles.deleteBtnText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            )
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>

          {/* Nom de l'événement */}
          <View style={styles.field}>
            <Text style={styles.label}>Nom de l'événement :</Text>
            <TextInput
              style={styles.input}
              value={activeEvent.eventName}
              onChangeText={(v) => onUpdateEvent({ eventName: v })}
              placeholder="ex: Mon mariage, Mon marathon..."
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          {/* Thème IA */}
          <View style={styles.field}>
            <Text style={styles.label}>Thème (pour l'IA) :</Text>
            <TextInput
              style={styles.input}
              value={activeEvent.theme}
              onChangeText={(v) => onUpdateEvent({ theme: v })}
              placeholder="ex: mariage élégant, marathon sportif..."
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <Text style={styles.hint}>Utilisé pour générer l'image et la citation.</Text>
          </View>

          {/* Date — TextInput YYYY-MM-DD (remplacer par DateTimePicker si besoin) */}
          <View style={styles.field}>
            <Text style={styles.label}>Événement le :</Text>
            <TextInput
              style={[styles.input, dateError ? styles.inputError : null]}
              value={activeEvent.targetDate}
              onChangeText={(v) => { setDateError(''); onUpdateEvent({ targetDate: v }); }}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="numeric"
              maxLength={10}
            />
            {dateError ? (
              <Text style={styles.errorText}>{dateError}</Text>
            ) : (
              <Text style={styles.hint}>Format : AAAA-MM-JJ (ex: {minDate})</Text>
            )}
          </View>

          {/* Police */}
          <View style={styles.field}>
            <Text style={styles.label}>Police :</Text>
            <View style={styles.fontList}>
              {FONTS.map((font) => (
                <TouchableOpacity
                  key={font.id}
                  style={[styles.fontBtn, activeEvent.fontId === font.id && styles.fontBtnActive]}
                  onPress={() => onUpdateEvent({ fontId: font.id })}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.fontLabel}>{font.label}</Text>
                    <Text style={[styles.fontName, { fontFamily: font.numberStyle.fontFamily }]}>
                      {font.name}
                    </Text>
                  </View>
                  <Text style={[styles.fontPreview, {
                    fontFamily: font.numberStyle.fontFamily,
                    fontWeight: font.numberStyle.fontWeight,
                  }]}>
                    42
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Bouton Enregistrer */}
      <TouchableOpacity
        style={[styles.saveBtn, isLoading && { opacity: 0.5 }]}
        onPress={handleSave}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
            <Text style={styles.saveBtnText}>Chargement...</Text>
          </>
        ) : (
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        )}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trashBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashIcon: {
    fontSize: 14,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  cancelBtnText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.4)',
    borderRadius: 20,
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#fca5a5',
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  form: {
    gap: 24,
    paddingBottom: 8,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.4)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 15,
  },
  inputError: {
    borderColor: 'rgba(239,68,68,0.6)',
  },
  hint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
  },
  errorText: {
    fontSize: 10,
    color: '#fca5a5',
  },
  fontList: {
    gap: 8,
  },
  fontBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fontBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  fontLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
  },
  fontName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  fontPreview: {
    fontSize: 30,
    color: '#fff',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
