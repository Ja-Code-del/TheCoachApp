export default {
  // ── Général
  app_name: 'TheCoachApp',
  save: 'Enregistrer',
  cancel: 'Annuler',
  delete: 'Supprimer',
  close: 'Fermer',
  edit: 'Éditer',
  share: 'Partager',
  add: 'Ajouter',
  loading: 'Chargement...',
  confirm: 'Confirmer',

  // ── Toggle modes
  mode_countdown: 'Événements',
  mode_memoir: 'Souvenirs',

  // ── WelcomeScreen
  welcome_title: 'Chaque jour compte.',
  welcome_subtitle: 'Compte à rebours pour tes grands moments.\nGarde-les en souvenir après.',
  welcome_cta: 'Commencer',

  // ── WidgetDisplay
  days_remaining: 'Jours restants',
  day_remaining: 'Jour restant',
  hours_short: 'h',
  minutes_short: 'min',
  jour_j: "Aujourd'hui !",
  refresh_image: 'Nouvelle image',
  refresh_quote: 'Nouvelle citation',
  add_event: 'Ajouter un événement',
  share_card: 'Partager',
  sharing: 'Capture…',
  quote_error: 'Erreur citation',
  image_loading: 'Nouvelle image…',
  save_success: 'Sauvegardé !',
  share_error: 'Erreur partage',

  // ── JourJScreen
  jour_j_title: "C'est le grand jour !",
  jour_j_subtitle: 'Tu as attendu ce moment.',

  // ── WidgetSettings
  settings_title: 'Réglages',
  settings_event_name: "Nom de l'événement",
  settings_event_name_placeholder: 'ex: Mon mariage, Mon marathon...',
  settings_theme: 'Thème (pour l\'IA)',
  settings_theme_placeholder: 'ex: mariage élégant, marathon sportif...',
  settings_theme_hint: "Utilisé pour générer l'image et la citation.",
  settings_date: "Date de l'événement",
  settings_date_placeholder: 'Choisir une date',
  settings_font: 'Police',
  settings_counter_style: 'Style compteur précis',
  settings_counter_style_hint: "Actif automatiquement à moins de 7 jours de l'événement.",
  settings_counter_standard: 'Standard',
  settings_counter_standard_desc: 'Chiffres lumineux sur fond transparent',
  settings_counter_glass: 'Verre',
  settings_counter_glass_desc: 'Effet glassmorphism — inspiré Apple',
  settings_counter_active_badge: 'Actif',
  settings_delete_confirm: 'Supprimer',
  settings_delete_cancel: 'Annuler',
  settings_abandon_title: 'Abandonner la création ?',
  settings_abandon_message: "Cet événement ne sera pas sauvegardé.",
  settings_abandon_continue: 'Continuer la création',
  settings_abandon_confirm: 'Abandonner',

  // ── Rappels
  reminders_title: 'Rappels',
  reminders_add: 'Ajouter un rappel',
  reminders_none: 'Aucun rappel configuré.',
  reminders_choose_datetime: 'Choisir une date et heure',
  reminders_past_badge: 'Passé',
  reminders_message_add: 'Ajouter un message',
  reminders_message_has: 'Message personnalisé ✓',
  reminders_message_hide: 'Masquer',
  reminders_message_placeholder: 'Laisse vide pour le message automatique…',
  reminders_permission_title: 'Notifications désactivées',
  reminders_permission_message: "Active les notifications pour cette app dans les Réglages de ton téléphone.",
  // Message auto : %{name} approche ! Plus que %{days} jour(s).
  reminders_auto_today: '%{name} — C\'est aujourd\'hui ! 🎉',
  reminders_auto_tomorrow: '%{name} — C\'est demain ! ✨',
  reminders_auto_days: '%{name} approche ! Plus que %{days} jours.',
  reminders_auto_day: '%{name} approche ! Plus que 1 jour.',

  // ── MemoirWelcomeScreen
  memoir_welcome_title: 'Tes souvenirs',
  memoir_welcome_subtitle: 'Un espace pour garder et revivre tes plus beaux moments.',
  memoir_welcome_step1_title: 'Après le Jour J',
  memoir_welcome_step1_desc: 'Tes événements passés apparaissent ici automatiquement.',
  memoir_welcome_step2_title: 'Ajoute tes photos',
  memoir_welcome_step2_desc: "Jusqu'à 6 photos de ce moment inoubliable.",
  memoir_welcome_step3_title: 'Écris ta note',
  memoir_welcome_step3_desc: 'Quelques mots pour ne jamais oublier ce que tu as ressenti.',
  memoir_welcome_step4_title: 'Partage le souvenir',
  memoir_welcome_step4_desc: 'Une belle card à partager avec tes proches.',
  memoir_welcome_hint: 'Crée un premier événement et reviens ici après le Jour J.',

  // ── MemoirScreen
  memoir_add_photos: 'Ajouter des photos',
  memoir_write_note: 'Écrire une note…',
  memoir_delete_title: 'Supprimer ce souvenir ?',
  memoir_delete_message: "L'événement et son souvenir seront supprimés définitivement.",

  // ── MemoirEditor
  memoir_editor_title: 'Mon souvenir',
  memoir_photos_label: 'Photos',
  memoir_photos_hint: 'Appuie longuement sur une photo pour la supprimer.',
  memoir_photos_add: 'Ajouter',
  memoir_photos_delete_title: 'Supprimer la photo ?',
  memoir_note_label: 'Note',
  memoir_note_placeholder: 'Raconte ce que tu as vécu ce jour-là…',
  memoir_save: 'Enregistrer le souvenir',
  memoir_permission_title: 'Permission requise',
  memoir_permission_message: "Autorise l'accès à ta galerie dans les Réglages pour ajouter des photos.",

  // ── Dates (formatage)
  date_today: "Aujourd'hui",
  date_yesterday: 'Il y a 1 jour',
  date_days_ago: 'Il y a %{count} jours',
  date_week_ago: 'Il y a 1 semaine',
  date_weeks_ago: 'Il y a %{count} semaines',
  date_month_ago: 'Il y a 1 mois',
  date_months_ago: 'Il y a %{count} mois',
  date_year_ago: 'Il y a 1 an',
  date_years_ago: 'Il y a %{count} ans',

  // ── Unsplash crédit
  photo_credit: '📷 %{name} / Unsplash',

  // ── WelcomeScreen (compléments)
  welcome_badge: 'Bienvenue',
  welcome_how_label: 'Comment ça marche',
  welcome_step1: 'Choisis un thème et une date cible',
  welcome_step2: 'Une citation et une image sont générées pour toi',
  welcome_step3: 'Partage le moment avec tes proches',

  // ── JourJScreen (compléments)
  jour_j_heading: 'Jour J',
  jour_j_immortalize: 'Immortaliser ce moment',

  // ── WidgetDisplay (compléments)
  share_moment: 'Partager le moment',
  generating: 'Génération en cours…',
  remaining: 'Restants',

  // ── MemoirWelcomeScreen (compléments)
  memoir_welcome_hint1: "Le lendemain du Jour J, l'événement bascule automatiquement ici.",
  memoir_welcome_hint2: 'Ajoutez des photos et une note pour immortaliser le moment.',

  // ── MemoirScreen (compléments)
  memoir_default_title: 'Souvenir',
};