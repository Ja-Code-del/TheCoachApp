import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Platform, useWindowDimensions, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FONTS } from '../../constants/fonts';
import { requestNotificationPermission } from '../../hooks/useNotifications';

// ─── HELPERS DATE ──────────────────────────────────────────────────────────
const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};
const dateToStr   = (date) => date.toISOString().split('T')[0];
const strToDate   = (str) => {
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
const formatDatetimeFR = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};
const generateReminderId = () => `rem_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

// ─── COUNTER STYLES ────────────────────────────────────────────────────────
const COUNTER_STYLES = [
  { id: 'default', label: 'Standard', description: 'Chiffres lumineux sur fond transparent', preview: '6j · 14h · 32min' },
  { id: 'glass',   label: 'Verre',    description: 'Effet glassmorphism — inspiré Apple',    preview: '6j · 14h · 32min' },
];

const MAX_REMINDERS = 3;

// ─── REMINDER ROW ──────────────────────────────────────────────────────────
function ReminderRow({ reminder, onUpdate, onDelete, targetDate }) {
  const [showPicker, setShowPicker]     = useState(false);
  const [pickerMode, setPickerMode]     = useState('date'); // 'date' | 'time'
  const [editingMsg, setEditingMsg]     = useState(false);

  const currentDate = reminder.datetime ? new Date(reminder.datetime) : (() => {
    // Défaut : J-1 à 9h00 par rapport à la date de l'event
    const d = strToDate(targetDate);
    d.setDate(d.getDate() - 1);
    d.setHours(9, 0, 0, 0);
    return d;
  })();

  const handlePickerChange = (e, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (!selected) return;

    if (Platform.OS === 'android') {
      if (pickerMode === 'date') {
        // Sur Android : d'abord date, puis heure
        const merged = new Date(selected);
        merged.setHours(currentDate.getHours(), currentDate.getMinutes());
        onUpdate({ datetime: merged.toISOString() });
        setTimeout(() => { setPickerMode('time'); setShowPicker(true); }, 100);
      } else {
        const merged = new Date(currentDate);
        merged.setHours(selected.getHours(), selected.getMinutes());
        onUpdate({ datetime: merged.toISOString() });
        setPickerMode('date');
      }
    } else {
      onUpdate({ datetime: selected.toISOString() });
    }
  };

  const isPast = reminder.datetime && new Date(reminder.datetime) <= new Date();

  return (
    <View style={remSt.row}>
      {/* Ligne principale : icône + date/heure + supprimer */}
      <View style={remSt.mainLine}>
        <View style={[remSt.bellIcon, isPast && remSt.bellIconPast]}>
          <Feather name="bell" size={14} color={isPast ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)'} />
        </View>

        <TouchableOpacity
          style={remSt.datetimeBtn}
          onPress={() => { setPickerMode('date'); setShowPicker(true); }}
          activeOpacity={0.7}
        >
          <Text style={[remSt.datetimeText, isPast && remSt.datetimeTextPast]}>
            {reminder.datetime ? formatDatetimeFR(reminder.datetime) : 'Choisir une date et heure'}
          </Text>
          {isPast && <Text style={remSt.pastBadge}>Passé</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={remSt.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
          <Feather name="x" size={13} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </View>

      {/* Message personnalisé — ligne secondaire */}
      <TouchableOpacity
        style={remSt.msgToggle}
        onPress={() => setEditingMsg(v => !v)}
        activeOpacity={0.7}
      >
        <Feather
          name={editingMsg ? 'chevron-up' : 'message-square'}
          size={11}
          color="rgba(255,255,255,0.3)"
        />
        <Text style={remSt.msgToggleText}>
          {editingMsg ? 'Masquer' : reminder.message ? 'Message personnalisé ✓' : 'Ajouter un message'}
        </Text>
      </TouchableOpacity>

      {editingMsg && (
        <TextInput
          style={remSt.msgInput}
          value={reminder.message || ''}
          onChangeText={v => onUpdate({ message: v })}
          placeholder="Laisse vide pour le message automatique…"
          placeholderTextColor="rgba(255,255,255,0.2)"
          maxLength={100}
        />
      )}

      {/* DateTimePicker iOS — inline */}
      {showPicker && Platform.OS === 'ios' && (
        <DateTimePicker
          value={currentDate}
          mode="datetime"
          display="spinner"
          onChange={handlePickerChange}
          locale="fr-FR"
          textColor="#fff"
          style={remSt.picker}
        />
      )}

      {/* DateTimePicker Android — modal */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={currentDate}
          mode={pickerMode}
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

const remSt = StyleSheet.create({
  row: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  mainLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellIcon: {
    width: 30, height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIconPast: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  datetimeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datetimeText: {
    fontSize: 14,
    fontFamily: 'Inter_300Light',
    color: '#fff',
  },
  datetimeTextPast: {
    color: 'rgba(255,255,255,0.3)',
  },
  pastBadge: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(255,165,0,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deleteBtn: {
    width: 28, height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 2,
  },
  msgToggleText: {
    fontSize: 11,
    fontFamily: 'Inter_300Light',
    color: 'rgba(255,255,255,0.35)',
  },
  msgInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 10,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Inter_300Light',
  },
  picker: {
    height: 140,
    marginTop: 4,
  },
});

// ─── WIDGET SETTINGS ───────────────────────────────────────────────────────
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
  const reminders = activeEvent.reminders || [];

  const handleDateChange = (e, date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) onUpdateEvent({ targetDate: dateToStr(date) });
  };

  // ── Rappels ──────────────────────────────────────────────────────────────
  const handleAddReminder = async () => {
    if (reminders.length >= MAX_REMINDERS) return;
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'Notifications désactivées',
        'Active les notifications pour cet app dans les Réglages de ton téléphone.',
        [{ text: 'OK' }]
      );
      return;
    }
    // Proposer une date par défaut : J-1 à 9h
    const d = strToDate(activeEvent.targetDate);
    d.setDate(d.getDate() - 1);
    d.setHours(9, 0, 0, 0);
    const newReminder = {
      id: generateReminderId(),
      datetime: d > new Date() ? d.toISOString() : null,
      message: '',
    };
    onUpdateEvent({ reminders: [...reminders, newReminder] });
  };

  const handleUpdateReminder = (id, patch) => {
    onUpdateEvent({
      reminders: reminders.map(r => r.id === id ? { ...r, ...patch } : r),
    });
  };

  const handleDeleteReminder = (id) => {
    onUpdateEvent({ reminders: reminders.filter(r => r.id !== id) });
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Réglages</Text>
        <View style={styles.headerActions}>
          {eventsCount > 1 && (
            !confirmDelete ? (
              <TouchableOpacity style={styles.trashBtn} onPress={() => setConfirmDelete(true)} activeOpacity={0.7}>
                <Feather name="trash-2" size={14} color="rgba(252,165,165,0.9)" />
              </TouchableOpacity>
            ) : (
              <View style={styles.confirmRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmDelete(false)}>
                  <Text style={[styles.cancelBtnText, { fontFamily: 'Inter_700Bold' }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                  <Text style={[styles.deleteBtnText, { fontFamily: 'Inter_700Bold' }]}>Supprimer</Text>
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

        {/* Nom */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>Nom de l'événement</Text>
          <TextInput
            style={[styles.input, { fontFamily: 'Inter_300Light' }]}
            value={activeEvent.eventName}
            onChangeText={v => onUpdateEvent({ eventName: v })}
            placeholder="ex: Mon mariage, Mon marathon..."
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
        </View>

        {/* Thème IA */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>Thème (pour l'IA)</Text>
          <TextInput
            style={[styles.input, { fontFamily: 'Inter_300Light' }]}
            value={activeEvent.theme}
            onChangeText={v => onUpdateEvent({ theme: v })}
            placeholder="ex: mariage élégant, marathon sportif..."
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
          <Text style={[styles.hint, { fontFamily: 'Inter_300Light' }]}>
            Utilisé pour générer l'image et la citation.
          </Text>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>Date de l'événement</Text>
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
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                <Feather name="calendar" size={15} color="rgba(255,255,255,0.7)" />
                <Text style={[styles.dateBtnText, { fontFamily: 'Inter_300Light' }]}>
                  {activeEvent.targetDate ? formatDateFR(activeEvent.targetDate) : 'Choisir une date'}
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

        {/* ── RAPPELS ── */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>Rappels</Text>
            <Text style={[styles.hint, { fontFamily: 'Inter_300Light' }]}>
              {reminders.length}/{MAX_REMINDERS}
            </Text>
          </View>

          {reminders.length === 0 && (
            <Text style={[styles.hint, { fontFamily: 'Inter_300Light' }]}>
              Aucun rappel configuré.
            </Text>
          )}

          {reminders.map(reminder => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              targetDate={activeEvent.targetDate}
              onUpdate={patch => handleUpdateReminder(reminder.id, patch)}
              onDelete={() => handleDeleteReminder(reminder.id)}
            />
          ))}

          {reminders.length < MAX_REMINDERS && (
            <TouchableOpacity style={styles.addReminderBtn} onPress={handleAddReminder} activeOpacity={0.7}>
              <Feather name="plus" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={[styles.addReminderText, { fontFamily: 'Inter_700Bold' }]}>
                Ajouter un rappel
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Police */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>Police</Text>
          <View style={styles.fontList}>
            {FONTS.map(font => (
              <TouchableOpacity
                key={font.id}
                style={[styles.fontBtn, activeEvent.fontId === font.id && styles.fontBtnActive]}
                onPress={() => onUpdateEvent({ fontId: font.id })}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fontLabel, { fontFamily: 'Inter_700Bold' }]}>{font.label}</Text>
                  <Text style={[styles.fontName, { fontFamily: font.numberStyle.fontFamily }]}>{font.name}</Text>
                </View>
                <Text style={[styles.fontPreview, { fontFamily: font.numberStyle.fontFamily }]}>42</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Style compteur */}
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: 'Inter_700Bold' }]}>Style compteur précis</Text>
          <Text style={[styles.hint, { fontFamily: 'Inter_300Light' }]}>
            Actif automatiquement à moins de 7 jours de l'événement.
          </Text>
          <View style={styles.counterStyleList}>
            {COUNTER_STYLES.map(cs => {
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
                  <View style={[styles.counterPreviewBox, cs.id === 'glass' && styles.counterPreviewBoxGlass]}>
                    <Text style={[styles.counterPreviewText, cs.id === 'glass' && styles.counterPreviewTextGlass, { fontFamily: 'Inter_700Bold' }]}>
                      {cs.preview}
                    </Text>
                  </View>
                  <View style={styles.counterStyleInfo}>
                    <View style={styles.counterStyleRow}>
                      <Text style={[styles.counterStyleLabel, { fontFamily: 'Inter_700Bold' }]}>{cs.label}</Text>
                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Text style={[styles.activeBadgeText, { fontFamily: 'Inter_700Bold' }]}>Actif</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.counterStyleDesc, { fontFamily: 'Inter_300Light' }]}>{cs.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Enregistrer */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && { opacity: 0.5 }]}
          onPress={onSave}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
              <Text style={[styles.saveBtnText, { fontFamily: 'Inter_700Bold' }]}>Chargement...</Text>
            </>
          ) : (
            <Text style={[styles.saveBtnText, { fontFamily: 'Inter_700Bold' }]}>Enregistrer</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  title: { fontSize: 22, fontFamily: 'Inter_900Black', color: '#fff', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trashBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cancelBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20,
  },
  cancelBtnText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  deleteBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: 'rgba(239,68,68,0.4)', borderRadius: 20,
  },
  deleteBtnText: { fontSize: 11, color: '#fca5a5' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  form: { gap: 24, paddingBottom: 8 },
  field: { gap: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(255,255,255,0.4)' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16, padding: 16, color: '#fff', fontSize: 15,
  },
  hint: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  datePicker: { height: 160, marginHorizontal: -8 },
  dateConfirm: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16, padding: 16,
  },
  dateBtnText: { color: '#fff', fontSize: 15 },

  // Rappels
  addReminderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed', borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  addReminderText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  // Police
  fontList: { gap: 8 },
  fontBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 16, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)',
  },
  fontBtnActive: { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.45)' },
  fontLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, color: 'rgba(255,255,255,0.4)' },
  fontName:  { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  fontPreview: { fontSize: 30, color: '#fff' },

  // Style compteur
  counterStyleList: { gap: 10 },
  counterStyleBtn: {
    borderRadius: 18, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden',
  },
  counterStyleBtnActive:      { borderColor: 'rgba(255,255,255,0.45)', backgroundColor: 'rgba(255,255,255,0.10)' },
  counterStyleBtnGlass:       { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.07)' },
  counterStyleBtnGlassActive: { borderColor: 'rgba(255,255,255,0.40)', backgroundColor: 'rgba(255,255,255,0.13)' },
  counterPreviewBox: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', alignItems: 'center',
  },
  counterPreviewBoxGlass:    { backgroundColor: 'rgba(255,255,255,0.06)', borderBottomColor: 'rgba(255,255,255,0.12)' },
  counterPreviewText:        { fontSize: 20, color: '#fff', letterSpacing: 1 },
  counterPreviewTextGlass:   { textShadowColor: 'rgba(255,255,255,0.2)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  counterStyleInfo:          { paddingHorizontal: 16, paddingVertical: 10, gap: 3 },
  counterStyleRow:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counterStyleLabel:         { fontSize: 13, color: '#fff' },
  activeBadge:               { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10 },
  activeBadgeText:           { fontSize: 9, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  counterStyleDesc:          { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  // Enregistrer
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16, marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15 },
});