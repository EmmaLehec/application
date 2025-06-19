import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale
const URL_utilisateur = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getUtilisateur`;
const URL_postuler = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getPostuler`;
const URL_etude = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEtudes`;


const Utilisateur = () => {
  // Récupération du routeur pour la navigation
  const router = useRouter();

  // Récupération de l'identifiant depuis les paramètres d'URL donc id sous forme de mail
  const { id, etude, refresh } = useLocalSearchParams<{ id: string; etude?: string; refresh?: string }>();
  // États pour stocker les données utilisateur, postulants, études et erreurs éventuelles
  const [utilisateur, setUtilisateur] = useState<any | null>(null);
  const [postuler, setPostuler] = useState<any[]>([]);
  const [etudes, setEtudes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);


  // Récupération des données utilisateur depuis Firebase
  useEffect(() => {
    fetch(URL_utilisateur)
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => {
        const utilisateur = data.utilisateur.find((u: any) => u.Mail_uti === decodeURIComponent(id));
        setUtilisateur(utilisateur);
      })
      .catch(err => setError(err.message));
  }, [id, refresh]);

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
  }, [id, refresh]);

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
    (postuler) => postuler.Mail_uti === id && postuler.Statut === 'En attente'
  );
  const filteredEtudes_attente = etudes.filter((etude) =>
    filteredpostuler_attente.some((post) => post.ID_etude === etude.ID_etude  && new Date(etude.Date_heure_fin_etude) <= currentDate)
  );

  // Filtres : études réalisées (acceptées et dont la date de fin est passée)
  const currentDate = new Date();
  const filteredpostuler = postuler.filter(
    (postuler) => postuler.Mail_uti === id && postuler.Statut === 'Accepté'
  );
  const filteredEtudes_realisées = etudes.filter((etude) =>
    filteredpostuler.some(
      (post) => post.ID_etude === etude.ID_etude && new Date(etude.Date_heure_fin_etude) <= currentDate
    )
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

  // Si aucun utilisateur trouvé, message d'erreur
  if (!utilisateur) {
    return (
      <View style={styles.container}>
        <Text style={styles.txt}> Page introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barre supérieure */}
      <View style={styles.topBar} />
      {/*bouton retour */}
      <View style={styles.titreWrapper}>
        <TouchableOpacity onPress={() => router.replace(`/JE_Etude_Liste_Int/${etude}?refresh=${Date.now()}`)} style={styles.backButton}>
          <FontAwesome name="search" size={20} color="black" style={styles.icon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>
      </View>
      {/* ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>
        <View style={styles.profilContainer}>{utilisateur.Lien_pdp_uti ? (
          <Image
            source={{ uri: utilisateur.Lien_pdp_uti }}
            style={styles.profilImage}
          />
        ) : (
          <FontAwesome name="user-circle" size={120} color="black" />
        )}
        </View>
        <View style={styles.cadre}>
          {/* Infos personnelles */}
          <Text style={styles.titre}>Nom</Text>
          <View style={styles.rect}>
            <Text style={styles.txt}>{utilisateur.Nom_uti}</Text>
          </View>

          <Text style={styles.titre}>Prénom</Text>
          <View style={styles.rect}>
            <Text style={styles.txt}>{utilisateur.Prenom_uti}</Text>
          </View>

          <Text style={styles.titre}>Date de naissance</Text>
          <View style={styles.rect}>
            <Text style={styles.txt}>{formatDate(utilisateur.Date_naissance)}</Text>
          </View>

          <Text style={styles.titre}>Téléphone</Text>
          <View style={styles.rect}>
            <Text style={styles.txt}>{utilisateur.Telephone_uti}</Text>
          </View>

          <Text style={styles.titre}>Adresse</Text>
          <View style={styles.rect}>
            <Text style={styles.txt}>{utilisateur.Adresse_uti}</Text>
          </View>

          {/* Lien e-portfolio */}
          <Text style={styles.titre}>Lien e-portfolio</Text>
          <View style={utilisateur.Lien_eportfolio_uti ? styles.rect : styles.rect_non_lien}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.txt}>
                {utilisateur.Lien_eportfolio_uti || 'Aucun lien fourni'}
              </Text>
              {utilisateur.Lien_eportfolio_uti && (
                <TouchableOpacity onPress={() => Linking.openURL(utilisateur.Lien_eportfolio_uti)}>
                  <AntDesign name="link" size={20} color="blue" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Lien GitHub */}
          <Text style={styles.titre}>Lien GitHub</Text>
          <View style={utilisateur.Lien_github_uti ? styles.rect : styles.rect_non_lien}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.txt}>
                {utilisateur.Lien_github_uti || 'Aucun lien fourni'}
              </Text>
              {utilisateur.Lien_github_uti && (
                <TouchableOpacity onPress={() => Linking.openURL(utilisateur.Lien_github_uti)}>
                  <AntDesign name="link" size={20} color="blue" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Liste horizontale des études en attente */}
          <Text style={styles.titre}>Etudes en attente d’acceptation</Text>
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
                    <Text style={styles.textinfo} numberOfLines={8}>
                      {etude.Description_etude.length > 300
                        ? etude.Description_etude.slice(0, 300) + '...'
                        : etude.Description_etude}
                    </Text>
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

          {/* Liste horizontale des études réalisées */}
          <Text style={styles.titre}>Etudes réalisées</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {filteredEtudes_realisées.map((etude, index) => (
              <View key={etude.ID_etude} style={styles.cadre_etude}>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.texttitre}>{etude.Titre_etude}</Text>
                    <Text style={styles.textdate}>Début : {formatDate(etude.Date_heure_debut_etude)}</Text>
                    <Text style={[styles.textdate, { marginBottom: 10 }]}>
                      Fin : {formatDate(etude.Date_heure_fin_etude)}
                    </Text>
                    <Text style={styles.textinfo} numberOfLines={8}>
                      {etude.Description_etude.length > 300
                        ? etude.Description_etude.slice(0, 300) + '...'
                        : etude.Description_etude}
                    </Text>
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

const { width, height } = Dimensions.get('window');

import { Platform } from 'react-native';

const styles = StyleSheet.create({
  //Container
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

  // Bouton retour +icône 
  titreWrapper: {
    position: 'absolute',
    top: height * 0.075,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bouton retour
  backButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
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
  // icone loupe
  icon: {
    marginRight: 8,
  },

  // ScrollView
  scrollViewContainer: {
    paddingVertical: height * 0.01,
  },
  scrollViewContent: {
    marginTop: height * 0.13,
    marginBottom: height * 0.15,
  },

  // Photo profil
  profilContainer: {
    alignItems: 'center',
    marginVertical: height * 0.01,
  },

  // Photo profil (avec une image)
  profilImage: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  // Cadre info de utilisateur
  cadre: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  // Titre de chaque info (nom,prenom)
  titre: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  // Cadre contenant les reponses de chaque info 
  rect: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: width * 0.9,
    height: 42,
    marginBottom: 10,
    justifyContent: 'center',
  },
  // Cas où on n'a pas de lien github ou e-portfolio
  rect_non_lien: {
    backgroundColor: '#A8A7A7',
    borderRadius: 8,
    width: width * 0.9,
    height: 42,
    marginBottom: 10,
    justifyContent: 'center',
  },
  // contenu du rect 
  txt: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: 'black',
    marginLeft: 5,
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

  },

  // Bouton voir plus
  buttonVoirPlus: {
    width: '100%',
    borderRadius: 2,
    height: 45,
    backgroundColor: '#56565671',
    paddingLeft: 5,
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
  // Text pour le cas où une erreur est présente
  notFoundText: {
    fontSize: width * 0.045,
    color: 'red',
    textAlign: 'center',
  },

});

export default Utilisateur;