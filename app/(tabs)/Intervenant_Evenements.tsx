import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { Dimensions, Platform } from 'react-native';
import { ImageBackground } from 'react-native';

// URL de l'API Firebase pour récupérer les events
const IP_LOCAL = '10.15.137.55';  // IP locale
const URL_getEvent = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEvents`;
const URL_getTypeEvent = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getType_eve`;

//Calendrier

//convertir la langue du calendrier en francais
import { LocaleConfig, Calendar } from 'react-native-calendars';

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  monthNamesShort: [
    'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
    'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'
  ],
  dayNames: [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: 'Aujourd\'hui'
};

// Définir le français comme langue par défaut
LocaleConfig.defaultLocale = 'fr';

//Dimensions écran
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const CARD_HEIGHT = screenHeight * 0.25;   // fixe ≈ 25 % de la hauteur écran

const IntEveListe = () => {
  const router = useRouter(); // Permet la navigation entre les écrans
  const [events, setEvents] = useState<any[]>([]); // 
  const [types_events, setTypesEvents] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('Tous');  // ← État pour le type sélectionné ds le filtre
  const [mode, setMode] = useState<'liste' | 'calendrier'>('liste'); // ← état pour switch
  const [error, setError] = useState<string | null>(null);

  //Lier à table Events
  const { refresh } = useLocalSearchParams(); // pour détecter un rechargement 
  useEffect(() => {
    // Appel à l'API pour récupérer la liste des events
    fetch(URL_getEvent)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau'); // Gestion erreur HTTP
        return response.json();
      })
      .then(data => {
        setEvents(data.evenement); // Stockage des events dans le state venant de data SQL 
      })
      .catch(err => setError(err.message)); // En cas d'erreur, on met à jour l'état "error"
  }, [refresh]);

  //Lier à table type Events
  useEffect(() => {
    // Appel à l'API pour récupérer la liste des type d'events
    fetch(URL_getTypeEvent)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau'); // Gestion erreur HTTP
        return response.json();
      })
      .then(data => {
        setTypesEvents(data.type_evenement); // Stockage des types d'events dans le state venant de data SQL 
      })
      .catch(err => setError(err.message)); // En cas d'erreur, on met à jour l'état "error"
  }, []);


  // Récupère la date actuelle
  const currentDate = new Date();

  // Filtre les events pour ne garder que ceux qui sont encore disponibles (date de fin ≥ aujourd’hui)
  const EventsAVenir = events.filter((event) => new Date(event.Date_heure_eve_deb) >= currentDate);

  //Fonction entré : id event , sortie : nom type event
  function getNomTypeEvenement(
    idEvent: number,
    events: { ID_eve: number; ID_type_eve: number }[],
    typesEvents: { ID_type_eve: number; Nom_type_eve: string }[]
  ): string | null {
    const event = events.find(e => e.ID_eve === idEvent);
    if (!event) return null;

    const typeEvent = typesEvents.find(t => t.ID_type_eve === event.ID_type_eve);
    return typeEvent ? typeEvent.Nom_type_eve : null;
  }

  //Fonction filtre par type
  const filteredEvents = EventsAVenir.filter((event) => {
    if (selectedType === 'Tous') return true;
    const nomType = getNomTypeEvenement(event.ID_eve, events, types_events);
    return nomType === selectedType;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Tableau des mois en français
    const mois = [
      'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
      'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'
    ];
    const jour = date.getDate(); // Pas besoin de padStart ici
    const moisNom = mois[date.getMonth()]; // getMonth() retourne 0-11
    return `${jour} ${moisNom}`;
  };

  const items = [
    { label: 'Tous', value: 'Tous' },
    ...types_events.map((t: any) => ({
      label: t.Nom_type_eve,
      value: t.Nom_type_eve,
    })),
  ];


  //Calendrier 

  //stocker la date selectionnée
  const [selectedDate, setSelectedDate] = useState('');

  //convertir du format : AAAA-MM-JJTHH:MM:SS.000Z en HH h MM-HH h MM
  const formatHeure = (dateStringdeb: string, dateStringfin: string) => {
    const datedeb = new Date(dateStringdeb);
    const datefin = new Date(dateStringfin);
    const hDeb = datedeb.getUTCHours();
    const mDeb = datedeb.getUTCMinutes();
    const hFin = datefin.getUTCHours();
    const mFin = datefin.getUTCMinutes();

    const fmt = (h: number, m: number) => m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;

    return `${fmt(hDeb, mDeb)}-${fmt(hFin, mFin)}`;
  };

  // Formate la date en "YYYY-MM-DD HH:mm:ss" (UTC) pour insertion en base MySQL.
  const getISODate = (str: string): string | null => {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  };

  // Fonction par le calendrier pour afficher des dots sous les dates ayant des événements,
  // et pour surligner la date sélectionnée.
  const buildMarkedDates = (eventsArr: any[], selDate: string) => {
    const marks: Record<string, any> = {};

    eventsArr.forEach(ev => {
      const dateKey = getISODate(ev.Date_heure_eve_deb);
      if (!dateKey) {
        console.warn('Date invalide :', ev.Date_heure_eve_deb);
        return;
      }

      const color = '#437E9B';
      const key = ev.ID_type_eve;

      if (!marks[dateKey]) marks[dateKey] = { dots: [] };
      marks[dateKey].dots.push({ key, color });
    });


    if (selDate) {
      if (!marks[selDate]) marks[selDate] = { dots: [] };
      marks[selDate] = {
        ...marks[selDate],
        selected: true,
        selectedColor: '#D7E8F1',
        selectedTextColor: '#437E9B',
      };
    }

    return marks;
  };

  //fonction qui se lance quand je selectionne une date 
  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const markedDates = buildMarkedDates(events, selectedDate);

  //filtrer les evenements du jour sélectionné 
  const filterEvents = events.filter(
    ev => getISODate(ev.Date_heure_eve_deb) === selectedDate
  );

  //filtrer les evenements selon le type d'evenement
  const filteredEvents_calendrier = filterEvents.filter((event) => {
    if (selectedType === 'Tous') return true;
    const nomType = getNomTypeEvenement(event.ID_eve, events, types_events);
    return nomType === selectedType;
  });


  return (
    <View style={styles.container}>
      {/* Barre supérieure */}
      <View style={styles.topBar} />

      {/* Bouton retour */}
      <TouchableOpacity onPress={() => router.push('/Intervenant_Accueil')} style={styles.backButton}>
        <Image source={require('../../assets/images/logo_JE.jpg')} style={styles.logo_JE} />
        <AntDesign name="arrowleft" size={28} color="black" />
      </TouchableOpacity>

      {/* Titre + Icône */}
      <View style={styles.titreWrapper}>
        <FontAwesome name="microphone" size={28} color="black" style={styles.icon} />
        <Text style={styles.titre}>Evènements</Text>
      </View>

      {/* Bouton switch + picker */}
      <View style={{ marginTop: 180, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' }}>
        {/*Bouton switch*/}
        <View style={{
          flexDirection: 'row',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#376887',
          width: 200,
          height: 40,
        }}
        >
          {/* Bouton Calendrier */}
          <TouchableOpacity
            onPress={() => setMode('calendrier')}
            style={{
              flex: 1,
              backgroundColor: mode === 'calendrier' ? '#DADADA' : '#376887',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FontAwesome name="calendar" size={20} color="white" />
          </TouchableOpacity>

          {/* Bouton Liste */}
          <TouchableOpacity
            onPress={() => setMode('liste')}
            style={{
              flex: 1,
              backgroundColor: mode === 'liste' ? '#DADADA' : '#376887',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FontAwesome name="list" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Picker de type d'événement */}
        <View style={styles.picker}>
          <Picker
            selectedValue={selectedType}
            onValueChange={(itemValue) => setSelectedType(itemValue)}
          >
            <Picker.Item label="Tous" value="Tous" />
            {types_events.map((type: any) => (
              <Picker.Item key={type.ID_type_eve} label={type.Nom_type_eve} value={type.Nom_type_eve} />
            ))}
          </Picker>
        </View>
      </View>

      {/*Mode liste*/}
      {mode === 'liste' && (
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollViewContent} >
          {filteredEvents.map(event => (
            <ImageBackground
              key={event.ID_eve}
              source={{ uri: event.photo_eve }}   // ← URL de la photo dans ta BD
              style={styles.cadre}               // mêmes dimensions qu’avant
              imageStyle={styles.cadreBg}        // arrondir l’image
            >
              {/* Bouton date en haut-droite */}
              <View style={styles.buttondate} >
                <Text style={[styles.texttitre, { textAlign: 'center' }]}>
                  {formatDate(event.Date_heure_eve_deb)}
                </Text>
              </View>

              {/* Contenu du cadre (vide) */}
              <View style={styles.cadreContent} />
              {/* Bouton Voir plus en bas */}
              <TouchableOpacity style={styles.buttonVoirPlus} onPress={() => router.push(`/Intervenant_Evenement/${event.ID_eve}`)}>
                <Text style={styles.texttitre}>{event.Titre_eve}</Text>
                <View style={styles.voirplus}>
                  <Text style={styles.buttonText}>Voir plus</Text>
                  <AntDesign name="arrowright" size={18} color="#fff" style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            </ImageBackground>
          ))}
        </ScrollView>
      )}
      {/*Mode calendrier*/}
      {mode === 'calendrier' && (
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollViewContent} >

          <View style={styles.calendrierWrapper}>
            <Calendar
              firstDay={1} //pour commencer la semaine lundi
              markingType="multi-dot" //pour pouvoir avoir plusieurs dots donc evenement le meme jour
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={{
                // couleurs & polices proches du screen
                backgroundColor: 'white',
                calendarBackground: 'white',
                textSectionTitleColor: '#9FB3C6',
                monthTextColor: '#437E9B',
                arrowColor: '#437E9B',
                todayTextColor: '#437E9B',
                dayTextColor: '#2D4150',
                textDisabledColor: '#D9E1E8',
                selectedDayBackgroundColor: '#D7E8F1',
                selectedDayTextColor: '#437E9B',
                textDayFontSize: 16,
                textDayFontWeight: '300',
                textDayHeaderFontSize: 14,
                textDayHeaderFontWeight: '500',
                textMonthFontSize: 20,
                textMonthFontWeight: 'bold',
              }}
            />
          </View>
          {selectedDate !== '' && (
            <View style={{ width: '85%', alignItems: 'flex-start', marginBottom: 5 }}>
              <Text style={styles.textdate}>{selectedDate}</Text>
            </View>
          )}
          <View>
            {filteredEvents_calendrier.length > 0 ? (
              filteredEvents_calendrier.map(event => (
                <ImageBackground
                  key={event.ID_eve}
                  source={{ uri: event.photo_eve }}   // ← URL de la photo dans ta BD
                  style={styles.cadre}
                  imageStyle={styles.cadreBg}
                >

                  {/* Bouton date en haut-droite */}
                  <View style={styles.buttondate}>
                    <Text style={[styles.textinfo, { textAlign: 'center' }]}>
                      {formatHeure(event.Date_heure_eve_deb, event.Date_heure_eve_fin)}
                    </Text>
                  </View>

                  {/* Contenu du central (vide) */}
                  <View style={styles.cadreContent} />

                  {/* Bouton Voir plus en bas */}
                  <TouchableOpacity style={styles.buttonVoirPlus} onPress={() => router.push(`/Intervenant_Evenement/${event.ID_eve}`)}>
                    <Text style={styles.texttitre}>{event.Titre_eve}</Text>
                    <View style={styles.voirplus}>
                      <Text style={styles.buttonText}>Voir plus</Text>
                      <AntDesign name="arrowright" size={18} color="#fff" style={{ marginLeft: 4 }} />
                    </View>
                  </TouchableOpacity>
                </ImageBackground>
              ))
            ) : (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 14, color: 'black' }}> Aucun évènement pour cette date. </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Barre inférieure */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <FontAwesome name="user" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/Intervenant_Accueil')}>
          <FontAwesome name="home" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/Intervenant_Parametres')}>
          <FontAwesome name="cog" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </View>

  );
};



const { width, height } = Dimensions.get('window'); // Récupère la taille de l'écran


//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D2E3ED',
  },

  //Barre du haut
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'black',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  //Bouton retour
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10, // ombre Android
    shadowColor: '#000', // ombre IOS
    shadowOffset: { width: 0, height: 6 },  // ombre IOS
    shadowOpacity: 0.3, // ombre IOS
    shadowRadius: 6, // ombre IOS
  },
  logo_JE: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 5,               //  espace entre icône et texte
  },

  //Titre + icône
  titreWrapper: {
    position: 'absolute',
    top: 120,
    flexDirection: 'row',         //  icône + texte côte à côte
    alignItems: 'center',         //  centre verticalement
    alignSelf: 'center',          //  centre horizontalement
  },
  icon: {
    marginRight: 8,               //  espace entre icône et texte
  },

  //Titre Evenement
  titre: {
    fontSize: 25,
    fontWeight: 'bold',
  },

  //Picker
  picker: {
    height: 50,
    width: screenWidth * 0.4,
    backgroundColor: '#E4DFDB',
    borderRadius: 5,
    marginHorizontal: 10,
  },

  //ScrollView
  scrollViewContent: {
    marginTop: screenHeight * 0.01,
    marginBottom: screenHeight * 0.065,  // pour éviter la barre du bas
  },
  scrollContainer: {
    alignItems: 'center',  // centre horizontalement les articles
    paddingVertical: 5,
  },

  //cadre contentant l'image de l'evenement
  cadre: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.25,
    marginTop: screenHeight * 0.02,
    overflow: 'hidden',
    position: 'relative',
  },

  //cadre contentant l'image de l'evenement bis
  cadreBg: {
    resizeMode: 'cover' // couvre toute la carte
  },

  //cadre contenant les dates des evenements
  buttondate: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CARD_HEIGHT * 0.25,
    width: CARD_HEIGHT * 0.25,
    backgroundColor: '#56565671',
    justifyContent: 'center',
    position: 'absolute',
    top: 5,
    right: 5,
  },

  //style pour la date et le titre
  texttitre: {
    fontSize: screenWidth * 0.035,
    fontWeight: '600',
    color: 'white',
    padding: screenWidth * 0.02,
  },


  cadreContent: {
    flex: 1,
  },

  //Bouton voir plus
  buttonVoirPlus: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CARD_HEIGHT * 0.25,    // ~25 % de la carte, adapter à ton goût
    backgroundColor: '#56565671',
    justifyContent: 'space-between', // Sépare le titre et "Voir plus"
  },
  voirplus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: screenWidth * 0.035,
    marginRight: 4,
  },

  //MODE CALENDRIER

  calendrierWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 5,
    marginTop: 20,
    marginBottom: 20,
    width: width * 0.85,   // ← C’EST CETTE LIGNE qui fixe la largeur principale
    elevation: 4, // pour Android
    shadowColor: '#000', // pour iOS
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },


  textinfo: {
    fontSize: width * 0.025,
    color: 'white',
  },

  textdate: {
    fontSize: width * 0.035,
    fontWeight: 'bold',
    color: 'black',
    justifyContent: 'flex-start',
  },

  imagebouton: {
    width: 49, // Ajuste la taille de l'image
    height: 62,
    marginRight: -40,  // Espace entre bouton et droite
  },


  //Barre du bas
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',           // place les icônes en ligne
    justifyContent: 'space-around', // espace régulier entre les 3 icônes
    alignItems: 'center',           // aligne verticalement au centre
  },

  // Container des 3 icônes dans la barre du bas
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '50%',
  },

});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 45,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    width: 100,
    borderColor: '#376887',
    color: '#376887',
    backgroundColor: '#E4DFDB',
    fontSize: 16,
    justifyContent: 'center',
  },
  inputAndroid: {
    height: 45,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#376887',
    color: '#376887',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  iconContainer: { top: 14, right: 10 },
});

export default IntEveListe;