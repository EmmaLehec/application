import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// URL de l'API Firebase pour récupérer les études
const IP_LOCAL = '10.226.42.55';  // IP locale
const URL = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEtudes`;

const Intervenant_Etudes = () => {
  const router = useRouter(); // Permet la navigation entre les écrans

  // État pour stocker les études récupérées depuis l'API
  const [etudes, setEtudes] = useState<any[]>([]); // 

  // État pour gérer les erreurs de chargement
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // Appel à l'API pour récupérer la liste des études
    fetch(URL)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau'); // Gestion erreur HTTP
        return response.json();
      })
      .then(data => {
        setEtudes(data.etudes); // Stockage des études dans le state venant de data SQL 
      })
      .catch(err => setError(err.message)); // En cas d'erreur, on met à jour l'état "error"
  }, []);

  // Récupère la date actuelle
  const currentDate = new Date();

  // Filtre les études pour ne garder que celles qui sont encore disponibles (date de fin ≥ aujourd’hui)
  const filteredEtudes = etudes.filter((etude) => new Date(etude.Date_heure_fin_etude) >= currentDate);

  // Fonction pour formater les dates au format AAAA-MM-JJ à HHhMM
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} à ${hours}h${minutes}`;
  };

  return (
    <View style={styles.container}>
      {/* Barre supérieure */}
      <View style={styles.topBar} />

      {/* Titre "Études" + bouton retour */}
      <View style={styles.titreWrapper}>

        <TouchableOpacity onPress={() => router.push('/Intervenant_Accueil')} style={styles.backButton}>
          <Image source={require('../../assets/images/autres/logo_JE.jpg')} style={styles.logo_JE} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>

        {/* Icône livre + Titre */}
        <FontAwesome name="book" size={28} color="black" style={styles.icon} />
        <Text style={styles.titre}>Etudes</Text>
      </View>

      {/* Affichage d'une erreur éventuelle */}
      {error && <Text style={styles.titre}>Erreur : {error}</Text>}

      {/* Liste des études */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>
        {filteredEtudes.map((etude, index) => (
          <View key={etude.ID_etude} style={[styles.cadre]}>
            {/* Titre de l’étude */}
            <Text style={styles.texttitre}>{etude.Titre_etude}</Text>

            {/* Dates début et fin */}
            <Text style={styles.textdate}>Début : {formatDate(etude.Date_heure_debut_etude)}</Text>
            <Text style={[styles.textdate, { marginBottom: 10 }]}>Fin : {formatDate(etude.Date_heure_fin_etude)}</Text>

            {/* Description à 3 lignes max */}
            <Text style={styles.textinfo} numberOfLines={3}> {etude.Description_etude} </Text>

            {/* Bouton pour voir l’étude en détail */}
            <TouchableOpacity style={styles.buttonVoirPlus} onPress={() => router.push(`/Intervenant_Etude/${etude.ID_etude}`)}>
              <Text style={styles.buttonText}>Voir plus</Text>
              <AntDesign name="arrowright" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>



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

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window'); // Récupère la taille de l'écran

const styles = StyleSheet.create({

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
  // Conteneur principal
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#D2E3ED',
  },

  // Contenu du ScrollView 
  scrollViewContainer: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  scrollViewContent: {
    marginTop: height * 0.15,
    marginBottom: height * 0.065,
  },

  // Titre principal "Études"
  titre: {
    fontSize: width * 0.08, // Taille du texte en fonction de la largeur d'écran
    fontWeight: 'bold',
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
  // Logo de Junior Entreprise
  logo_JE: {
    width: width * 0.06,
    height: width * 0.06,
    resizeMode: 'contain',
    marginRight: 5,
  },
  // Carte d'une étude
  cadre: {
    marginTop: height * 0.02,
    backgroundColor: 'white',
    borderRadius: 2,
    width: width * 0.85,
    // Ombre pour iOS et Android
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  // Titre de l’étude
  texttitre: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: 'black',
    padding: width * 0.02,
  },

  // Dates début / fin
  textdate: {
    fontSize: width * 0.03,
    fontWeight: '600',
    color: 'black',
    paddingLeft: width * 0.02,
  },

  // Description de l’étude
  textinfo: {
    fontSize: width * 0.03,
    fontWeight: '600',
    color: '#437E9B',
    padding: width * 0.02,
  },

  // Bouton "Voir plus"
  buttonVoirPlus: {
    width: '100%',
    height: height * 0.06,
    backgroundColor: '#56565671',
    borderRadius: 2,
    paddingHorizontal: width * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Texte du bouton "Voir plus"
  buttonText: {
    color: 'white',
    fontSize: width * 0.035,
    fontWeight: 'bold',
    right: 5
  },

  // Bouton flottant "+"
  Buttonplus: {
    position: 'absolute',
    bottom: height * 0.12,
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



export default Intervenant_Etudes;