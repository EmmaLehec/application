import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale
const URL_etude = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEtudes`;
const URL_postuler = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getPostuler`;
const URL_utilisateur = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getUtilisateur`;


const Intervenant = () => {
  const router = useRouter(); // Permet de naviguer entre les pages
  const { id } = useLocalSearchParams() as { id: string }; // Récupère dynamiquement l'ID de l'étude depuis l'URL

  // État pour stocker les données de l'étude en cours
  const [etude, setEtude] = useState<any | null>(null);

  // État pour stocker tous les postulants de toutes les études
  const [postuler, setPostuler] = useState<any[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);

  const { refresh } = useLocalSearchParams(); // pour détecter un rechargement

  // État pour gérer les erreurs éventuelles
  const [error, setError] = useState<string | null>(null);

  // Fonction pour envoyer la mise à jour du statut au serveur Firebase
  const updateStatutServeur = async (mail: string, id_etude: string, statut: string) => {
    try {
      const response = await fetch(`http://${IP_LOCAL}:5001/application-5c3f8/us-central1/updateStatutPostuler`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, id_etude, statut }),
      });

      if (!response.ok) throw new Error("Erreur serveur");

      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      Alert.alert("Erreur", "Impossible de modifier le statut");
      return false;
    }
  };


  // Récupère les infos de l’étude dès que l’ID change
  useEffect(() => {
    fetch(URL_etude)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => {
        const foundEtude = data.etudes.find((etude: any) => etude.ID_etude === id);
        setEtude(foundEtude); // Met à jour l'étude courante
      })
      .catch(err => setError(err.message)); // Gère les erreurs
  }, [id, refresh]);

  useEffect(() => {
    fetch(URL_utilisateur)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => {
        setUtilisateurs(data.utilisateur); // stocke tous les utilisateurs
      })
      .catch(err => setError(err.message));
  }, [refresh]);



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
    fetchPostuler(); //
  }, [id, refresh]);

  // Fonction appelée lorsqu'on accepte un postulant
  const handleAccept = (p: any) => {

    const mail = p.Mail_uti;
    const utilisateurCorrespondant = utilisateurs.find(u => u.Mail_uti === p.Mail_uti);
    const prenom = utilisateurCorrespondant?.Prenom_uti || 'Prénom';
    const nom = utilisateurCorrespondant?.Nom_uti || 'Nom';

    Alert.alert(
      "",
      `${prenom} ${nom} est accepté(e)!`,
      [
        {
          text: "OK",
          onPress: async () => {
            const success = await updateStatutServeur(mail, id, 'Accepté');
            if (success) fetchPostuler();
          },
        }
      ]
    );
  };
  // Fonction appelée lorsqu'on refuse un postulant
  const handleRefuse = (p: any) => {

    const mail = p.Mail_uti;
    const utilisateurCorrespondant = utilisateurs.find(u => u.Mail_uti === p.Mail_uti);
    const prenom = utilisateurCorrespondant?.Prenom_uti || 'Prénom';
    const nom = utilisateurCorrespondant?.Nom_uti || 'Nom';

    Alert.alert(
      "",
      `${prenom} ${nom} est refusé(e)!`,
      [
        {
          text: "OK",
          onPress: async () => {
            const success = await updateStatutServeur(mail, id, 'Refusé');
            if (success) fetchPostuler();
          },
        }
      ]
    );
  };


  // Si aucune étude trouvée, on affiche un message
  if (!etude) {
    return (
      <View style={styles.container}>
        <Text style={styles.txt}>Étude introuvable.</Text>
      </View>
    );
  }

  // On filtre les postulants selon leur statut et l'étude
  const postulantsattente = postuler.filter(p => p.ID_etude === id && p.Statut === 'En attente');
  const postulantsaccepte = postuler.filter(p => p.ID_etude === id && p.Statut === 'Accepté');
  const postulantsrefuse = postuler.filter(p => p.ID_etude === id && p.Statut === 'Refusé');

  return (
    <View style={styles.container}>

      {/* Barre supérieure */}
      <View style={styles.topBar} />

      {/* Bouton de retour */}
      <View style={styles.titreWrapper}>
        <TouchableOpacity onPress={() => router.push(`/JE_Etude/${etude.ID_etude}`)} style={styles.backButton}>
          <FontAwesome name="book" size={28} color="black" style={styles.icon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Scrollview */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>

        {/* Titre de l’étude */}
        <View style={[styles.cadre_titre]}>
          <FontAwesome name="search" size={30} color="black" style={styles.icon} />
          <Text style={styles.titre}>{etude.Titre_etude}</Text>
        </View>

        {/* Section : intervenants en attente */}
        <View style={styles.sectionHeader}>
          <AntDesign name="clockcircle" size={25} color="#376887" style={styles.icon} />
          <Text style={[styles.txt, { fontWeight: '600' }]}>Intervenants en attente d’acceptation :</Text>
        </View>

        {/* Liste des postulants en attente */}
        <View style={[styles.cadre]}>
          {postulantsattente.map((p, index) => {
            const utilisateurCorrespondant = utilisateurs.find(u => u.Mail_uti === p.Mail_uti);
            const prenom = utilisateurCorrespondant?.Prenom_uti || 'Prénom';
            const nom = utilisateurCorrespondant?.Nom_uti || 'Nom';

            const handleNavigate = () => {
              router.replace(
                `/JE_Profil_Int/${encodeURIComponent(p.Mail_uti)}?etude=${encodeURIComponent(p.ID_etude
                )}&refresh=${Date.now()}`
              );
            };

            return (
              <View key={index} style={[styles.cadre_int, { alignItems: 'flex-start' }]}>
                {/* Ligne du nom + lien */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.txt, { marginRight: 5 }]}>• {prenom}</Text>
                  <Text style={styles.txt}>{nom}</Text>
                  <TouchableOpacity onPress={handleNavigate} style={styles.link}>
                    <AntDesign name="link" size={20} color="black" />
                  </TouchableOpacity>
                </View>

                {/* Ligne des boutons */}
                <View style={{ flexDirection: 'row' }}>

                  <TouchableOpacity style={styles.bouton_recru} onPress={() => handleAccept(p)}>
                    <Text style={styles.recru}>Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bouton_recru} onPress={() => handleRefuse(p)}>
                    <Text style={styles.recru}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              </View>

            );
          })}
        </View>


        {/* Section : intervenants acceptés */}
        <View style={styles.sectionHeader}>
          <AntDesign name="check" size={25} color="#376887" style={styles.icon} />
          <Text style={[styles.txt, { fontWeight: '600' }]}>Intervenants acceptés :</Text>
        </View>

        {/* Liste des acceptés */}
        <View style={[styles.cadre]}>
          {postulantsaccepte.map((p, index) => {
            const utilisateurCorrespondant = utilisateurs.find(u => u.Mail_uti === p.Mail_uti);
            const prenom = utilisateurCorrespondant?.Prenom_uti || 'Prénom';
            const nom = utilisateurCorrespondant?.Nom_uti || 'Nom';
            const handleNavigate = () => {

              router.replace(
                `/JE_Profil_Int/${encodeURIComponent(p.Mail_uti)}?etude=${encodeURIComponent(p.ID_etude
                )}&refresh=${Date.now()}`
              );
            };

            return (
              <View key={index} style={[styles.cadre_int, { flexDirection: 'row' }]}>
                <Text style={[styles.txt, { marginRight: 5 }]}>•{prenom}</Text>
                <Text style={styles.txt}>{nom}</Text>
                <TouchableOpacity onPress={handleNavigate} style={styles.link}>
                  <AntDesign name="link" size={25} color="black" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Section : refusés */}
        <View style={styles.sectionHeader}>
          <AntDesign name="close" size={25} color="#376887" style={styles.icon} />
          <Text style={[styles.txt, { fontWeight: '600' }]}>Intervenants refusés :</Text>
        </View>

        {/* Liste des refusés */}
        <View style={[styles.cadre]}>
          {postulantsrefuse.map((p, index) => {
            const utilisateurCorrespondant = utilisateurs.find(u => u.Mail_uti === p.Mail_uti);
            const prenom = utilisateurCorrespondant?.Prenom_uti || 'Prénom';
            const nom = utilisateurCorrespondant?.Nom_uti || 'Nom';
            const handleNavigate = () => {
              router.replace(
                `/JE_Profil_Int/${encodeURIComponent(p.Mail_uti)}?etude=${encodeURIComponent(p.ID_etude
                )}&refresh=${Date.now()}`
              );
            };

            return (
              <View key={index} style={[styles.cadre_int, { flexDirection: 'row' }]}>
                <Text style={[styles.txt, { marginRight: 5 }]}>•{prenom}</Text>
                <Text style={styles.txt}>{nom}</Text>
                <TouchableOpacity onPress={handleNavigate} style={styles.link}>
                  <AntDesign name="link" size={25} color="black" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Barre inférieure */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('../')}>
          <FontAwesome name="user" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('../JE_Accueil')}>
          <FontAwesome name="home" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('../JE_Parametres')}>
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
    marginBottom: height * 0.12,
    paddingLeft: width * 0.03

  },

  // Bloc contenant titre + icône (clock check et x)
  cadre_titre: {
    marginBottom: height * 0.02,
    flexDirection: 'row',
  },

  // Titre principal
  titre: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: width * 0.9, // pour éviter que le texte prenne toute la ligne

  },

  // Aligne l’icône et le texte côte à côte
  sectionHeader: {
    flexDirection: 'row',
  },

  // Cadre en attente/accepté /refusé
  cadre: {
    marginTop: height * 0.015,
    marginBottom: height * 0.015,
    backgroundColor: 'white',
    borderRadius: 5,
    width: width * 0.95,
  },

  // Cadre de chaque utilisateur
  cadre_int: {
    flexDirection: 'column',
    flexWrap: 'wrap', // autorise les retours à la ligne si l'écran est trop petit (donc si le nom de l'utilisateur est très long)
    alignItems: 'center',
    marginVertical: height * 0.01,
    paddingHorizontal: width * 0.02, //REGLER ICI POUR PROBLEME BOUTON ACCEPTE ET REFUSE (ou sinon je le sors du cadre_int et je le mets en dehors mais dans cadre)
    backgroundColor: 'white',
    borderRadius: 8,
    width: width * 0.95,
  },

  // Texte générique (ex : "Intervenants acceptés")
  txt: {
    fontSize: width * 0.045,
    marginVertical: 0,
  },


  // Lien vers la fiche utilisateur
  link: {
    paddingLeft: width * 0.02,
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


  // Boutons "Accepté" et "Refuser"
  bouton_recru: {
    backgroundColor: '#4B92B7',
    borderRadius: 5,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.01,
    marginLeft: width * 0.02,
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

  // Texte dans les boutons recru
  recru: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: 'white',
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




export default Intervenant;
