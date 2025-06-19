import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../../../context/UserContext';
const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale
const URL = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEtudes`;
const URL_postuler = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getPostuler`;

const Etude = () => {
  // Récupère le routeur pour la navigation
  const router = useRouter();

  // Récupère l'ID de l'étude depuis l'URL
  const { id } = useLocalSearchParams() as { id: string };

  // État pour stocker les données de l'étude récupérée
  const [etude, setEtude] = useState<any | null>(null);
  const [postuler, setPostuler] = useState<any[]>([]);
  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext non trouvé");
  const { userMail } = context;

  // État pour stocker un message d'erreur éventuel
  const [error, setError] = useState<string | null>(null);
  const fetchPostuler = () => {
    fetch(URL_postuler)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => setPostuler(data.postuler))
      .catch(err => setError(err.message));
  };


  // Récupère la liste des postulants liés à cette étude
  useEffect(() => {
    fetchPostuler();
  }, [id]);

  const postulerEtude = async () => {
    const mail_user = userMail;
    try {
      const response = await fetch(`http://${IP_LOCAL}:5001/application-5c3f8/us-central1/ajouterPostuler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mail: mail_user, // ← remplace par mail récupéré via UserContext
          id_etude: id,
        }),
      });

      const result = await response.json();
      console.log("Réponse brute :", result);

      if (result.success) {
        Alert.alert("Succès", "Postulation enregistrée !");
        fetchPostuler(); // ← recharge la liste
      } else {
        Alert.alert("Erreur", result.message);
      }
    } catch (error) {
      console.error("Erreur API :", error);
      Alert.alert("Erreur", "Impossible de postuler.");
    }
  };


  useEffect(() => {
    fetch(URL)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau'); // Gestion des erreurs HTTP
        return response.json(); // Conversion de la réponse en JSON
      })
      .then(data => {
        // Recherche de l'étude correspondant à l'ID dans les résultats
        const foundEtude = data.etudes.find((etude: any) => etude.ID_etude === id);
        setEtude(foundEtude); // Mise à jour de l’état avec l’étude trouvée
      })
      .catch(err => setError(err.message)); // Gestion des erreurs (réseau, etc.)
  }, [id]); // Se relance uniquement si l'ID change

  // Si aucune étude n'est trouvée, afficher un message d'erreur
  if (!etude) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Étude introuvable.</Text>
      </View>
    );
  }

  // Fonction pour formater une date en chaîne lisible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // Conversion en objet Date

    // Extraction des parties de la date
    const year = date.getFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} à ${hours}h${minutes}`;
  };

  const dejaPostule = postuler.some(
    (p) => p.Mail_uti === userMail && p.ID_etude === id
  );

  return (
    <View style={styles.container}>
      {/* Barre supérieure */}
      <View style={styles.topBar} />


      {/* En-tête contenant le bouton de retour */}
      <View style={styles.titreWrapper}>
        <TouchableOpacity onPress={() => router.push('../Intervenant_Etudes')} style={styles.backButton}>
          <FontAwesome name="book" size={28} color="black" style={styles.icon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Affichage d'un message d'erreur s'il existe */}
      {error && <Text style={styles.titre}>Erreur : {error}</Text>}

      {/* infos de l'étude */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>
        <View style={styles.cadre}>
          {/* Titre de l'étude */}
          <Text style={styles.titre}>{etude.Titre_etude}</Text>

          {/* Dates début et fin */}
          <Text style={styles.date}>Début :  {formatDate(etude.Date_heure_debut_etude)}</Text>
          <Text style={[styles.date, { marginBottom: height * 0.015 }]}>Fin :  {formatDate(etude.Date_heure_fin_etude)}</Text>

          {/* Affichage de la rémunération */}
          <Text style={styles.remuneration}>Rémunération : {etude.Remuneration}</Text>

          {/* Description de l'étude */}
          <Text style={styles.description}>{etude.Description_etude}</Text>

          {/* Bouton pour accéder à la gestion du recrutement */}

          <TouchableOpacity
            disabled={dejaPostule}
            style={[
              styles.bouton_recru,
              dejaPostule && { backgroundColor: '#aaa' }
            ]}
            onPress={() => {
              if (dejaPostule) {
                Alert.alert("Info", "Vous avez déjà postulé à cette étude.");
                return;
              }

              Alert.alert(
                "Confirmation",
                "",
                [
                  {
                    text: "Oui, je veux bien postuler :)",
                    onPress: () => {
                      postulerEtude();
                      console.log("Bravo cliqué !");
                    }
                  },
                  {
                    text: "Mmh, je ne suis pas sûr(e) :|",
                    onPress: () => {
                      console.log("Non cliqué");
                    },
                    style: "cancel"
                  }
                ],
                { cancelable: true }
              );
            }}
          >
            <Text style={styles.txt}>
              {dejaPostule ? "Déjà postulé" : "Postuler"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      {/* Barre inférieure */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('../')}>
          <FontAwesome name="user" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('../Intervenant_Accueil')}>
          <FontAwesome name="home" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('../Intervenant_Parametres')}>
          <FontAwesome name="cog" size={28} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#D2E3ED',
    width: '100%',
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

  // Bouton de retour (haut gauche)
  backButton: {
    position: 'absolute',
    top: height * 0.005,
    left: width * 0.05,
    backgroundColor: 'white',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Contenu du ScrollView
  scrollViewContainer: {
    paddingVertical: height * 0.01,
  },
  scrollViewContent: {
    marginTop: height * 0.14,
    marginBottom: height * 0.065,
  },
  // Wrapper du titre en haut
  titreWrapper: {
    position: 'absolute',
    top: height * 0.075,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Icône livre 
  icon: {
    marginRight: width * 0.02,
  },

  // Bloc contenant les infos de l'étude
  cadre: {
    alignItems: 'flex-start',
    paddingHorizontal: width * 0.045,
  },

  // Titre de l'étude
  titre: {
    fontSize: width * 0.07,
    fontWeight: '600',
    marginBottom: height * 0.02,
    color: 'black',
  },

  // Dates
  date: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: 'black',
  },

  // Rémunération
  remuneration: {
    fontSize: width * 0.037,
    fontWeight: '600',
    color: 'black',
  },

  // Description de l'étude
  description: {
    fontSize: width * 0.035,
    paddingVertical: height * 0.02,
    color: '#717477',
  },

  // Message si l'étude n'est pas trouvée
  notFoundText: {
    fontSize: width * 0.045,
    color: 'red',
    textAlign: 'center',
  },

  // Bouton "Gérer le recrutement"
  bouton_recru: {
    backgroundColor: '#4B92B7',
    borderRadius: 6,
    width: '80%',
    height: height * 0.065,
    alignSelf: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Texte du bouton "gérer le recrutement"
  txt: {
    fontSize: width * 0.03,
    fontWeight: '600',
    paddingHorizontal: width * 0.07,
    paddingVertical: height * 0.015,
    color: 'white',
    textAlign: 'center',
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


export default Etude;
