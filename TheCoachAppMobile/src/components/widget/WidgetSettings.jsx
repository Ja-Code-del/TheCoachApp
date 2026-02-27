import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Platform, useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FONTS } from '../../constants/fonts';

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dateToStr = (date) => date.toISOString().split('T')[0];

const strToDate = (str) => {
  if (!str) return getTomorrowDate();
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? getTomorrowDate() : date;
};

const formatDateFR = (str) => {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

const COUNTER_STYLES = [
  {
    id: 'default',
    label: 'Standard',
    description: 'Chiffres lumineux sur fond transparent',
    preview: '6j · 14h · 32min',
  },
  {
    id: 'glass',
    label: 'Verre',
    description: 'Effet glassmorphism — inspiré Apple',
    preview: '6j · 14h · 32min',
  },
];

export default function WidgetSettings({
  activeEvent, eventsCount,
  confirmDelete, setConfirmDelete,
  isLoadingQuote, isLoadingImage,
  onUpdateEvent, onSave, onClose, onDelete,
}) {
  const { height: screenHeight } = useWindowDimensions();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isLoading = isLoadingQuote || isLoadingImage;
  const selectedDate = strToDate(activeEvent.targetDate);
  const currentCounterStyle = activeEvent.counterStyle || 'default';

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) onUpdateEvent({ targetDate: dateToStr(date) });
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Réglages</Text>
        <View style={styles.headerActions}>
          {eventsCount > 1 && (
            !confirmDelete ? (
              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() => setConfirmDelete(true)}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={14} color="rgba(252,165,165,0.9)" />
              </TouchableOpacity>
            ) : (
              <View style={styles.confirmRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setConfirmDelete(false)}
                >
                  <Text style={[styles.cancelBtnText, { fontFamily: 'Inter_700Bold' }]}>
                    Annuler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                  <Text style={[styles.deleteBtnText, { fontFamily: 'Inter_700Bold' }]}>
                    Supprimer
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Feather name="x" size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Formulaire scrollable */}
      <ScrollView
        style={{ maxHeight: screenHeight * 0.60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.form}
      >
        {/* Nom de l'événement */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>
            Nom de l'événement
          </Text>
          <TextInput
            style={[styles.input, { fontFamily: 'Inter_300Light' }]}
            value={activeEvent.eventName}
            onChangeText={(v) => onUpdateEvent({ eventName: v })}
            placeholder="ex: Mon mariage, Mon marathon..."
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
        </View>

        {/* Thème IA */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>
            Thème (pour l'IA)
          </Text>
          <TextInput
            style={[styles.input, { fontFamily: 'Inter_300Light' }]}
            value={activeEvent.theme}
            onChangeText={(v) => onUpdateEvent({ theme: v })}
            placeholder="ex: mariage élégant, marathon sportif..."
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          <Text style={[styles.hint, { fontFamily: 'Inter_300Light' }]}>
            Utilisé pour générer l'image et la citation.
          </Text>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>
            Date de l'événement
          </Text>

          {Platform.OS === 'ios' && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              minimumDate={getTomorrowDate()}
              onChange={handleDateChange}
              locale="fr-FR"
              style={styles.datePicker}
              textColor="#fff"
            />
          )}

          {Platform.OS === 'android' && (
            <>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Feather name="calendar" size={15} color="rgba(255,255,255,0.7)" />
                <Text style={[styles.dateBtnText, { fontFamily: 'Inter_300Light' }]}>
                  {activeEvent.targetDate
                    ? formatDateFR(activeEvent.targetDate)
                    : 'Choisir une date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  minimumDate={getTomorrowDate()}
                  onChange={handleDateChange}
                />
              )}
            </>
          )}

          {Platform.OS === 'ios' && activeEvent.targetDate && (
            <Text style={[styles.dateConfirm, { fontFamily: 'Inter_300Light' }]}>
              📅 {formatDateFR(activeEvent.targetDate)}
            </Text>
          )}
        </View>

        {/* Police */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>Police</Text>
          <View style={styles.fontList}>
            {FONTS.map((font) => (
              <TouchableOpacity
                key={font.id}
                style={[
                  styles.fontBtn,
                  activeEvent.fontId === font.id && styles.fontBtnActive,
                ]}
                onPress={() => onUpdateEvent({ fontId: font.id })}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fontLabel, { fontFamily: 'Inter_700Bold' }]}>
                    {font.label}
                  </Text>
                  <Text style={[styles.fontName, { fontFamily: font.numberStyle.fontFamily }]}>
                    {font.name}
                  </Text>
                </View>
                <Text style={[styles.fontPreview, { fontFamily: font.numberStyle.fontFamily }]}>
                  42
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Style du compteur — visible seulement à < 7 jours */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>
            Style compteur précis
          </Text>
          <Text style={[styles.hint, { fontFamily: 'Inter_300Light' }]}>
            Actif automatiquement à moins de 7 jours de l'événement.
          </Text>
          <View style={styles.counterStyleList}>
            {COUNTER_STYLES.map((cs) => {
              const isActive = currentCounterStyle === cs.id;
              return (
                <TouchableOpacity
                  key={cs.id}
                  style={[
                    styles.counterStyleBtn,
                    isActive && styles.counterStyleBtnActive,
                    cs.id === 'glass' && styles.counterStyleBtnGlass,
                    cs.id === 'glass' && isActive && styles.counterStyleBtnGlassActive,
                  ]}
                  onPress={() => onUpdateEvent({ counterStyle: cs.id })}
                  activeOpacity={0.7}
                >
                  {/* Preview chiffres */}
                  <View style={[
                    styles.counterPreviewBox,
                    cs.id === 'glass' && styles.counterPreviewBoxGlass,
                  ]}>
                    <Text style={[
                      styles.counterPreviewText,
                      cs.id === 'glass' && styles.counterPreviewTextGlass,
                      { fontFamily: 'Inter_700Bold' },
                    ]}>
                      {cs.preview}
                    </Text>
                  </View>

                  {/* Label + description */}
                  <View style={styles.counterStyleInfo}>
                    <View style={styles.counterStyleRow}>
                      <Text style={[styles.counterStyleLabel, { fontFamily: 'Inter_700Bold' }]}>
                        {cs.label}
                      </Text>
                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={[styles.activeBadgeText, { fontFamily: 'Inter_700Bold' }]}>
                            Actif
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.counterStyleDesc, { fontFamily: 'Inter_300Light' }]}>
                      {cs.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bouton Enregistrer */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && { opacity: 0.5 }]}
          onPress={onSave}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
              <Text style={[styles.saveBtnText, { fontFamily: 'Inter_700Bold' }]}>
                Chargement...
              </Text>
            </>
          ) : (
            <Text style={[styles.saveBtnText, { fontFamily: 'Inter_700Bold' }]}>
              Enregistrer
            </Text>
          )}
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
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  cancelBtnText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(239,68,68,0.4)',
    borderRadius: 20,
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#fca5a5',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
  hint: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
  },
  datePicker: {
    height: 160,
    marginHorizontal: -8,
  },
  dateConfirm: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  dateBtnText: {
    color: '#fff',
    fontSize: 15,
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  fontLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.4)',
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

  // --- Style compteur ---
  counterStyleList: {
    gap: 10,
  },
  counterStyleBtn: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  counterStyleBtnActive: {
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  counterStyleBtnGlass: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  counterStyleBtnGlassActive: {
    borderColor: 'rgba(255,255,255,0.40)',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  counterPreviewBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  counterPreviewBoxGlass: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  counterPreviewText: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1,
  },
  counterPreviewTextGlass: {
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  counterStyleInfo: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 3,
  },
  counterStyleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterStyleLabel: {
    fontSize: 13,
    color: '#fff',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counterStyleDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },

  // --- Enregistrer ---
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
  },
});