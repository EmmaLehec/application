import { AntDesign, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, Image, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../../context/UserContext';

const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale


const JE_etude_plus = () => {
  //Dimensions écran
  const router = useRouter();
  const [titre, setTitre] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [showDateDebut, setShowDateDebut] = useState(false);
  const [showDateFin, setShowDateFin] = useState(false);
  const [showTimeFin, setShowTimeFin] = useState(false);
  const [showTimeDebut, setShowTimeDebut] = useState(false);
  const [dateFin, setDateFin] = useState('');
  const [remuneration, setRemuneration] = useState('');
  const [description, setDescription] = useState('');
  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext non trouvé");
  const { userMail } = context;

  useFocusEffect(
    React.useCallback(() => {
      // Réinitialise tous les champs quand la page est affichée
      setTitre('');
      setDateDebut('');
      setDateFin('');
      setRemuneration('');
      setDescription('');

    }, [])
  );

  const formatDateTimeForMySQL = (isoString: string): string => {
    const date = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  const handleAjouterEtude = async () => {
    if (!titre || !dateDebut || !dateFin || !remuneration || !description) {
      alert('Merci de remplir tous les champs');
      return;
    }


    const mail_admin = userMail;

    if (!mail_admin) {
      alert("Erreur : aucun administrateur connecté.");
      return;
    }

    try {
      const reponse = await fetch(`http://${IP_LOCAL}:5001/application-5c3f8/us-central1/ajouterEtude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({

          Titre_etude: titre,
          Description_etude: description,
          Date_heure_debut_etude: formatDateTimeForMySQL(dateDebut),
          Date_heure_fin_etude: formatDateTimeForMySQL(dateFin),
          Remuneration: remuneration,
          mail_admin
        }),
      });

      const message = await reponse.text();

      if (reponse.ok) {
        alert('Étude créée !');
        router.replace(`/JE_Etudes?refresh=${Date.now()}`);
      }
      else {
        alert('Erreur : ' + message);
      }
    } catch (error) {
      console.error('Erreur API :', error);
      alert('Une erreur est survenue');
    }
  };


  return (
    // Pour fermer le clavier si on tape ailleurs
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS: padding, Android: height
      >
        {/* Barre supérieure */}
        <View style={styles.topBar} />

        {/* Avoir le titre+bouton retour*/}
        <View style={styles.titreWrapper}>
          {/* Bouton retour */}
          <TouchableOpacity onPress={() => router.push('/JE_Etudes')} style={styles.backButton}>
            <FontAwesome name="book" size={20} color="black" style={styles.icon} />
            <AntDesign name="arrowleft" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent} keyboardShouldPersistTaps="handled" >
          <Text style={styles.titre}>Création d'une étude</Text>
          <View style={styles.cadre}>
            <Text style={styles.txt}>Titre de l'étude</Text>
            <TextInput
              style={[styles.rect, { minHeight: 40 }]}
              placeholder=""
              value={titre}
              onChangeText={setTitre}
            />

            {/* DEBUT DE L'ÉTUDE */}
            <Text style={styles.txt}>Date et heure du début de l'étude</Text>
            <TouchableOpacity
              onPress={() => setShowDateDebut(true)}
              style={[styles.rect, { height: 40, justifyContent: 'center' }]}
            >
              <Text>
                {dateDebut ? new Date(dateDebut).toLocaleString() : ''}
              </Text>
            </TouchableOpacity>

            {showDateDebut && (
              <DateTimePicker
                value={dateDebut ? new Date(dateDebut) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDateDebut(false);
                  if (selectedDate) {
                    const date = new Date(selectedDate);
                    setDateDebut(date.toISOString());
                    setTimeout(() => setShowTimeDebut(true), 300); // petit délai pour enchaîner l'heure
                  }
                }}
              />
            )}

            {showTimeDebut && (
              <DateTimePicker
                value={dateDebut ? new Date(dateDebut) : new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimeDebut(false);
                  if (selectedTime) {
                    const previous = new Date(dateDebut || new Date());
                    previous.setHours(selectedTime.getHours());
                    previous.setMinutes(selectedTime.getMinutes());
                    setDateDebut(previous.toISOString());
                  }
                }}
              />
            )}


            {/* FIN DE L'ÉTUDE */}
            <Text style={styles.txt}>Date et heure de la fin de l'étude</Text>
            <TouchableOpacity
              onPress={() => setShowDateFin(true)}
              style={[styles.rect, { height: 40, justifyContent: 'center' }]}
            >
              <Text>
                {dateFin ? new Date(dateFin).toLocaleString() : ''}
              </Text>
            </TouchableOpacity>


            {showDateFin && (
              <DateTimePicker
                value={dateFin ? new Date(dateFin) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDateFin(false);
                  if (selectedDate) {
                    const date = new Date(selectedDate);
                    setDateFin(date.toISOString());
                    setTimeout(() => setShowTimeFin(true), 300);
                  }
                }}
              />
            )}

            {showTimeFin && (
              <DateTimePicker
                value={dateFin ? new Date(dateFin) : new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimeFin(false);
                  if (selectedTime) {
                    const previous = new Date(dateFin || new Date());
                    previous.setHours(selectedTime.getHours());
                    previous.setMinutes(selectedTime.getMinutes());
                    setDateFin(previous.toISOString());
                  }
                }}
              />
            )}



            <Text style={styles.txt}>Rémunération</Text>
            <TextInput
              style={[styles.rect, { minHeight: 40 }]}
              placeholder=""
              value={remuneration}
              onChangeText={setRemuneration}
              keyboardType="numeric"
            />


            <Text style={styles.txt}>Description</Text>
            <TextInput
              style={[styles.rect, { minHeight: 40, paddingTop: 10 }]} // plus de place
              placeholder=""
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              scrollEnabled
            />


          </View>

        </ScrollView>

        {/* Bouton plus */}
        <TouchableOpacity style={styles.Buttonplus} onPress={handleAjouterEtude}>
          <Image source={require('../../assets/images/autres/Bouton_plus.png')} style={styles.imagebouton} />
        </TouchableOpacity>

        {/* Barre inférieure */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <FontAwesome name="user" size={28} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/JE_Accueil')}>
            <FontAwesome name="home" size={28} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/JE_Parametres')}>
            <FontAwesome name="cog" size={28} color="black" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const { width, height } = Dimensions.get('window'); // Récupère la taille de l'écran

const styles = StyleSheet.create({
  // Conteneur principal
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#D2E3ED',
  },
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

  // Bloc contenant le titre et le bouton retour
  titreWrapper: {
    position: 'absolute',
    top: height * 0.075, // Position verticale du bloc titre
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Icône (livre)
  icon: {
    marginRight: width * 0.02,
  },
  // Bouton retour 
  backButton: {
    position: 'absolute',
    top: 0,
    left: width * 0.04,
    backgroundColor: 'white',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Ombres adaptées à iOS et Android
    ...Platform.select({ // pour ajouter un ombre à un bouton
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  // Contenu du ScrollView 
  scrollViewContainer: {
    alignItems: 'center',
  },
  scrollViewContent: {
    marginTop: height * 0.15,
    marginBottom: height * 0.08,
  },

  // Titre principal Creation etude
  titre: {
    fontSize: width * 0.08, // Taille du texte en fonction de la largeur d'écran
    fontWeight: 'bold',
    marginBottom: height * 0.01
  },

  // cadre contenant tout le contenu donc ajout de titre,date,remuneration,description..
  cadre: {
    width: '90%',
    alignSelf: 'center',
  },
  txt: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: 'black',
    marginTop: height * 0.01,
  },
  //cadre des texts input 
  rect: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  //boutton plus
  Buttonplus: {
    position: 'absolute',
    bottom: height * 0.1,
    right: width * 0.05,
    borderRadius: 30,
    // Ombre
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  // Image du bouton "+"
  imagebouton: {
    width: width * 0.13,
    height: height * 0.08,
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

});



export default JE_etude_plus;