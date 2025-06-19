import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../../context/UserContext';


const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale
const URL_etude = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEtudes`;
const URL_postuler = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getPostuler`;


const Intervenant_recrutement = () => {
  const router = useRouter(); // Permet de naviguer entre les pages
  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext non trouvé");
  const { userMail } = context;
  const mail_uti = userMail;
  const { refresh } = useLocalSearchParams(); // pour détecter un rechargement 
  const [postuler, setPostuler] = useState<any[]>([]);
  const [etudes, setEtudes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);


  // Récupération des candidatures liées à l'utilisateur
  useEffect(() => {
    fetch(URL_postuler)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => {
        setPostuler(data.postuler);
      })
      .catch(err => setError(err.message));
  }, [refresh]);

  // Récupération de toutes les études
  useEffect(() => {
    fetch(URL_etude)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => {
        setEtudes(data.etudes);
      })
      .catch(err => setError(err.message));
  }, [refresh]);

  // Filtres : études en attente
  const filteredpostuler_attente = postuler.filter(
    (postuler) => postuler.Mail_uti === mail_uti && postuler.Statut === 'En attente'
  );
  const filteredEtudes_attente = etudes.filter((etude) =>
    filteredpostuler_attente.some((post) => post.ID_etude === etude.ID_etude)
  );


  // Filtres : études accepté
  const filteredpostuler_accepte = postuler.filter(
    (postuler) => postuler.Mail_uti === mail_uti && postuler.Statut === 'Accepté'
  );
  const filteredEtudes_accepte = etudes.filter((etude) =>
    filteredpostuler_accepte.some((post) => post.ID_etude === etude.ID_etude)
  );

  // Filtres : études refusé
  const filteredpostuler_refuse = postuler.filter(
    (postuler) => postuler.Mail_uti === mail_uti && postuler.Statut === 'Refusé'
  );
  const filteredEtudes_refuse = etudes.filter((etude) =>
    filteredpostuler_refuse.some((post) => post.ID_etude === etude.ID_etude)
  );

  // Fonction pour formater une date en JJ/MM/AAAA ou JJ/MM/AAAA à HHhMM
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    if (hours === 0 && minutes === 0) {
      return `${day}/${month}/${year}`;
    } else {
      const paddedHours = String(hours).padStart(2, '0');
      const paddedMinutes = String(minutes).padStart(2, '0');
      return `${day}/${month}/${year} à ${paddedHours}h${paddedMinutes}`;
    }
  };

  return (
    <View style={styles.container}>

      {/* Barre supérieure */}
      <View style={styles.topBar} />

      {/* Bouton de retour */}
      <View style={styles.titreWrapper}>
        <TouchableOpacity onPress={() => router.push('/Intervenant_Parametres')} style={styles.backButton}>
          <FontAwesome name="cog" size={28} color="black" style={styles.icon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Scrollview */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>

        {/* Titre de l’étude */}
        <View style={[styles.cadre_titre]}>
          <FontAwesome name="search" size={30} color="black" style={styles.icon} />
          <Text style={styles.titre}>Recrutement</Text>
        </View>

        {/* Section : intervenants en attente */}
        <View style={styles.sectionHeader}>
          <AntDesign name="clockcircle" size={25} color="#376887" style={styles.icon} />
          <Text style={[styles.txt, { fontWeight: '600' }]}>Etudes en attente d’acceptation :</Text>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {filteredEtudes_attente.map((etude, index) => (
            <View key={etude.ID_etude} style={styles.cadre_etude}>
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.texttitre}>{etude.Titre_etude}</Text>
                  <Text style={styles.textdate}>Début : {formatDate(etude.Date_heure_debut_etude)}</Text>
                  <Text style={[styles.textdate, { marginBottom: 10 }]}>
                    Fin : {formatDate(etude.Date_heure_fin_etude)}
                  </Text>
                  <Text style={styles.textinfo} numberOfLines={3}>{etude.Description_etude}</Text>
                </View>

                <TouchableOpacity
                  style={styles.buttonVoirPlus}
                  onPress={() => router.push(`/JE_Etude/${etude.ID_etude}`)}
                >
                  <Text style={styles.buttonText}>Voir plus</Text>
                  <AntDesign name="arrowright" size={20} color="white" />
                </TouchableOpacity>
              </View>

            </View>
          ))}
        </ScrollView>

        {/* Section : intervenants acceptés */}
        <View style={styles.sectionHeader}>
          <AntDesign name="check" size={25} color="#376887" style={styles.icon} />
          <Text style={[styles.txt, { fontWeight: '600' }]}>Etudes acceptés :</Text>
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {filteredEtudes_accepte.map((etude, index) => (
            <View key={etude.ID_etude} style={styles.cadre_etude}>
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.texttitre}>{etude.Titre_etude}</Text>
                  <Text style={styles.textdate}>Début : {formatDate(etude.Date_heure_debut_etude)}</Text>
                  <Text style={[styles.textdate, { marginBottom: 10 }]}>
                    Fin : {formatDate(etude.Date_heure_fin_etude)}
                  </Text>
                  <Text style={styles.textinfo} numberOfLines={3}>{etude.Description_etude}</Text>
                </View>

                <TouchableOpacity
                  style={styles.buttonVoirPlus}
                  onPress={() => router.push(`/JE_Etude/${etude.ID_etude}`)}
                >
                  <Text style={styles.buttonText}>Voir plus</Text>
                  <AntDesign name="arrowright" size={20} color="white" />
                </TouchableOpacity>
              </View>

            </View>
          ))}
        </ScrollView>


        {/* Section : refusés */}
        <View style={styles.sectionHeader}>
          <AntDesign name="close" size={25} color="#376887" style={styles.icon} />
          <Text style={[styles.txt, { fontWeight: '600' }]}>Etudes refusés :</Text>
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {filteredEtudes_refuse.map((etude, index) => (
            <View key={etude.ID_etude} style={styles.cadre_etude}>
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.texttitre}>{etude.Titre_etude}</Text>
                  <Text style={styles.textdate}>Début : {formatDate(etude.Date_heure_debut_etude)}</Text>
                  <Text style={[styles.textdate, { marginBottom: 10 }]}>
                    Fin : {formatDate(etude.Date_heure_fin_etude)}
                  </Text>
                  {/* Description à 3 lignes max*/}
                  <Text style={styles.textinfo} numberOfLines={3}>{etude.Description_etude}</Text>
                </View>

                <TouchableOpacity
                  style={styles.buttonVoirPlus}
                  onPress={() => router.push(`/JE_Etude/${etude.ID_etude}`)}
                >
                  <Text style={styles.buttonText}>Voir plus</Text>
                  <AntDesign name="arrowright" size={20} color="white" />
                </TouchableOpacity>
              </View>

            </View>
          ))}
        </ScrollView>

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

import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({

  // Conteneur principal de la page
  container: {
    flex: 1,
    position: 'relative',
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

  // bouton retour 
  titreWrapper: {
    position: 'absolute',
    top: height * 0.075,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bouton retour (haut gauche)
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
        elevation: 10,
      },
    }),
  },

  // Icônes livre
  icon: {
    marginRight: width * 0.02,
  },

  // ScrollView – conteneur interne
  scrollViewContainer: {
    paddingVertical: height * 0.01,
  },

  // ScrollView 
  scrollViewContent: {
    marginTop: height * 0.14,
    marginBottom: height * 0.065,
    left: width * 0.05,

  },

  // Bloc contenant titre + icône (clock check et x)
  cadre_titre: {
    marginBottom: height * 0.03,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  // Titre principal
  titre: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
  },

  // Aligne l’icône et le texte côte à côte
  sectionHeader: {
    flexDirection: 'row',
  },


  // Texte générique (ex : "Intervenants acceptés")
  txt: {
    fontSize: width * 0.045,
    marginBottom: height * 0.02,
  },


  //  Cadre pour les etudes (en attente et réalisée)
  cadre_etude: {
    backgroundColor: 'white',
    borderRadius: 2,
    width: width * 0.7,
    marginRight: 20,
    marginBottom: 20,
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
  // Titre des études
  texttitre: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: 'black',
    padding: 5,
  },
  // Date des études
  textdate: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: 'black',
    paddingLeft: 5,
  },
  // description des études 
  textinfo: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#437E9B',
    padding: 5,
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: 16,
  },

  // Bouton voir plus
  buttonVoirPlus: {
    width: '100%',
    height: 45,
    backgroundColor: '#56565671',
    paddingLeft: 5,
    borderRadius: 2,
    alignItems: 'center',
    flexDirection: 'row',
  },
  // Text du bouton voir plus
  buttonText: {
    color: 'white',
    fontSize: width * 0.035,
    fontWeight: 'bold',
    marginRight: 5,
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


export default Intervenant_recrutement;
