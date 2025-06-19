import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../../../context/UserContext';

const IP_LOCAL = '10.226.42.55';  // Remplace par ton IP locale
const URL_evenement = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEvents`;
const URL_type_evenement = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getType_eve`;
const URL_admin = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getAdmin`;
const URL_inscrire = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getInscrire`;
const URL_utilisateur = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getUtilisateur`;

const PageEvent = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams() as { id: string };

  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext non trouvé");
  const { userMail } = context;

  const [evenement, setEvenement] = useState<any | null>(null);
  const [type_evenement, settype_Evenement] = useState<any | null>(null);
  const [admin, setAdmin] = useState<any | null>(null);
  const [inscrit, setInscrit] = useState<any[]>([]);
  const [utilisateur, setUtilisateur] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(URL_evenement)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => {
        const foundEvenement = data.evenement.find((evenement: any) => evenement.ID_eve === id);
        setEvenement(foundEvenement);
      })
      .catch(err => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (!evenement) return;

    fetch(URL_type_evenement)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau'); // Gestion des erreurs HTTP
        return response.json(); // Conversion de la réponse en JSON
      })
      .then(data => {
        // Recherche de l'étude correspondant à l'ID dans les résultats
        const foundtype_evenement = data.type_evenement.find((type_evenement: any) => type_evenement.ID_type_eve === evenement.ID_type_eve);
        settype_Evenement(foundtype_evenement);
      })
      .catch(err => setError(err.message)); // Gestion des erreurs (réseau, etc.)
  }, [evenement]);

  useEffect(() => {
    if (!evenement) return;

    fetch(URL_admin)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau'); // Gestion des erreurs HTTP
        return response.json(); // Conversion de la réponse en JSON
      })
      .then(data => {
        // Recherche de l'étude correspondant à l'ID dans les résultats
        const foundadmin = data.admin.find((admin: any) => admin.mail_admin === evenement.mail_admin);
        setAdmin(foundadmin);

      })
      .catch(err => setError(err.message)); // Gestion des erreurs (réseau, etc.)
  }, [evenement]);


  // Appel de l’API Firebase pour récupérer toutes les études
  const fetchInscrire = () => {
    fetch(URL_inscrire)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau'); // Gestion des erreurs HTTP
        return response.json(); // Conversion de la réponse en JSON
      })
      .then(data => {
        // Recherche de l'étude correspondant à l'ID dans les résultats
        const foundinscrit = data.inscrire.filter((inscrire: any) => inscrire.ID_eve === id);
        setInscrit(foundinscrit);
      })
      .catch(err => setError(err.message)); // Gestion des erreurs (réseau, etc.)
  };

  // Récupère la liste des postulants liés à cette étude
  useEffect(() => {
    fetchInscrire();
  }, [evenement]);


  useEffect(() => {
    if (inscrit.length === 0) { setUtilisateur([]); return; }

    fetch(URL_utilisateur)

      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau'); // Gestion des erreurs HTTP
        return response.json(); // Conversion de la réponse en JSON
      })
      .then(data => {
        const mails = inscrit.map(i => i.Mail_uti);
        const foundUtilisateur = data.utilisateur.filter((u: any) => mails.includes(u.Mail_uti));
        setUtilisateur(foundUtilisateur);
      })
      .catch(err => setError(err.message)); // Gestion des erreurs (réseau, etc.)
  }, [inscrit]); // Se relance uniquement si l'ID change





  // Fonction pour formater une date en chaîne lisible
  const formatDate = (dateStringdeb: string,dateStringfin: string) => {
    const datedeb = new Date(dateStringdeb); // Conversion en objet Date

    // Extraction des parties de la date
    const yeardeb = datedeb.getFullYear();
    const monthdeb = String(datedeb.getUTCMonth() + 1).padStart(2, '0');
    const daydeb = String(datedeb.getUTCDate()).padStart(2, '0');

    const datefin = new Date(dateStringfin); // Conversion en objet Date

    // Extraction des parties de la date
    const yearfin = datefin.getFullYear();
    const monthfin = String(datefin.getUTCMonth() + 1).padStart(2, '0');
    const dayfin = String(datefin.getUTCDate()).padStart(2, '0');
    // const hours = String(date.getUTCHours()).padStart(2, '0');
    // const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${daydeb}/${monthdeb}/${yeardeb} au ${dayfin}/${monthfin}/${yearfin} `;
  };

  const formatHeure = (dateStringdeb: string, dateStringfin: string) => {
    const datedeb = new Date(dateStringdeb);
    const datefin = new Date(dateStringfin);
    const hDeb = datedeb.getUTCHours();
    const mDeb = datedeb.getUTCMinutes();
    const hFin = datefin.getUTCHours();
    const mFin = datefin.getUTCMinutes();
    const fmt = (h: number, m: number) =>
      m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;

    return `${fmt(hDeb, mDeb)}-${fmt(hFin, mFin)}`;
  };

  if (!evenement) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Evenement introuvable.</Text>
      </View>
    );
  }
  const nbrparticipant = inscrit.length;
  const capacitePleine = nbrparticipant >= evenement.nombre_place_eve;


  const dejaInscrit = inscrit.some(
    (p) => p.Mail_uti === userMail && p.ID_eve === id
  );

  const boutonTexte = dejaInscrit
    ? 'Déjà inscrit(e)'
    : capacitePleine
      ? 'Plus de place'
      : "S'inscrire";

  const boutonDesactive = dejaInscrit || capacitePleine;


  const inscrire_eve = async () => {
    const mail_user = userMail;
    try {
      const response = await fetch(`http://${IP_LOCAL}:5001/application-5c3f8/us-central1/ajouterInscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mail_uti: mail_user, // ← remplace par mail récupéré via UserContext
          id_eve: id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert("Succès", "Inscription enregistrée !");
        fetchInscrire(); // ← recharge la liste
      } else {
        Alert.alert("Erreur", result.message);
      }
    } catch (error) {
      console.error("Erreur API :", error);
      Alert.alert("Erreur", "Impossible de postuler.");
    }
  };


  const evenement_fini = new Date(evenement.Date_heure_eve_fin) < new Date();
  return (
    <View style={styles.container}>
      {/* Barre supérieure */}
      <View style={styles.topBar} />

      {/* En-tête contenant le bouton de retour */}
      <View style={styles.titreWrapper}>
        <TouchableOpacity onPress={() => router.push('../Intervenant_Evenements')} style={styles.backButton}>
          <FontAwesome name="microphone" size={28} color="black" style={styles.icon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* infos de l'étude */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>
        <ImageBackground
          source={{ uri: evenement.photo_eve }}   // ← URL de la photo dans ta BD
          style={styles.cadre}
          imageStyle={styles.cadreBg}                   // mêmes dimensions qu’avant
        >
        </ImageBackground>

        <View style={styles.cadre_eve}>
          <Text style={[styles.titre, { fontWeight: "bold", fontSize: width * 0.05 }]}>{evenement.Titre_eve}</Text>
          <Text style={styles.titre}>{type_evenement?.Nom_type_eve}</Text>
          <View style={styles.cadre_detail}>
            <View style={styles.cadre_info}>
              <FontAwesome name="calendar" size={20} color="black" style={styles.icon} />
              <Text style={styles.description}>{formatDate(evenement.Date_heure_eve_deb,evenement.Date_heure_eve_fin)}</Text>
            </View>
            <View style={styles.cadre_info}>
              <FontAwesome name="clock-o" size={22} color="black" style={styles.icon} />
              <Text style={styles.description}>{formatHeure(evenement.Date_heure_eve_deb, evenement.Date_heure_eve_fin)}</Text>
            </View>
            <View style={[styles.cadre_info, { paddingBottom: width * 0.025 }]}>
              <FontAwesome name="map-marker" size={22} color="black" style={[styles.icon, { marginRight: 15 }]} />
              <Text style={styles.description}>{evenement.Lieu_eve}</Text>
            </View>
          </View>
          <Text style={styles.titre}>Informations</Text>
          <Text style={[styles.description, { color: '#5B5B5B', marginTop: 10 }]}>{evenement.Description_eve}</Text>
          <Text style={[styles.titre, { marginBottom: 30 }]}>Crée par {admin?.prenom_admin} {admin?.nom_admin} </Text>

          <View style={styles.cadre_inscription}  >
            {evenement_fini ? (
              <View style={[styles.bouton_inscrire, { backgroundColor: '#A8A7A7' }]}>
                <Text style={[styles.txtplace, { fontSize: width * 0.03 }]}>Inscription passé</Text>
              </View>
            ) : (
              <TouchableOpacity
                disabled={boutonDesactive}
                style={[
                  styles.bouton_inscrire,
                  boutonDesactive && { backgroundColor: '#aaa' }
                ]}
                onPress={() => {
                  Alert.alert(
                    'Confirmation',
                    '',
                    [
                      { text: 'Oui, je veux bien m’inscrire :)', onPress: inscrire_eve },
                      { text: 'Mmh, je ne suis pas sûr(e) :|', style: 'cancel' },
                    ],
                    { cancelable: true }
                  );
                }}
              >
                <Text style={styles.txtplace}>{boutonTexte}</Text>
              </TouchableOpacity>
            )}



            <View style={styles.cadre_place}  >
              <Text style={styles.txtplace}>Place</Text>
              <View style={styles.trait}></View>
              <View style={styles.cadre_placebis}>
                <Text style={styles.txtplace}>
                  {nbrparticipant}/{evenement.nombre_place_eve}
                </Text>
                <Image source={require('../../../assets/images/autres/Logo place.png')} style={styles.image} />
              </View>
            </View>

          </View>
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
  bouton_inscrire: {
    backgroundColor: '#4B92B7',
    borderRadius: 6,
    width: '35%',
    height: height * 0.05,
    marginBottom: height * 0.01,
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
    alignItems: 'center'
  },
  scrollViewContent: {
    marginTop: height * 0.14,
    marginBottom: height * 0.15,
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
  cadreBg: {

    resizeMode: 'cover' // couvre toute la carte
  },

  cadre_inscription: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width * 0.85,
    alignSelf: 'center',
    marginTop: height * 0.02,
  },
  cadre_placebis: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 10
  },

  cadre_eve: {
    alignItems: 'flex-start',
    width: width * 0.85,
  },


  image: {
    width: width * 0.08,
    height: width * 0.08,
    resizeMode: 'contain',
    marginTop: 10,

  },

  trait: {
    width: width * 0.4,
    backgroundColor: '#D2E3ED',
    height: height * 0.003,
    marginTop: 6
  },


  cadre_detail: {
    alignItems: 'flex-start',
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
    marginTop: 10,
  },
  cadre_place: {
    alignSelf: 'flex-end',   // ← ajoute cette ligne
    backgroundColor: "#4B92B7",
    borderRadius: 12,
    height: height * 0.12,
    width: width * 0.4,
    marginTop: 10,

  },
  // Titre de l'étude
  txtplace: {
    fontSize: width * 0.04,
    fontWeight: '600',
    marginTop: height * 0.015,
    alignSelf: 'center',
    color: 'white',
  },


  cadre_info: {

    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: width * 0.025,
    paddingRight: width * 0.025,
    paddingTop: width * 0.025

  },
  // Icône livre 
  icon: {
    marginRight: width * 0.02,
  },
  cadre: {
    width: width * 0.85,
    height: height * 0.25,
    marginTop: height * 0.02,
    overflow: 'hidden',
    position: 'relative',
  },

  // Titre de l'étude
  titre: {
    fontSize: width * 0.04,
    fontWeight: '600',
    marginTop: height * 0.02,
    color: 'black',
  },


  description: {
    fontSize: width * 0.035,
  },


  notFoundText: {
    fontSize: width * 0.045,
    color: 'red',
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

  // Conteneur des icônes en bas
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '30%',
  },

});


export default PageEvent;
