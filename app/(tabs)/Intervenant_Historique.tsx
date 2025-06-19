import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../../context/UserContext';


const IP_LOCAL = '10.226.42.55';  // Remplace par ton IP locale
const URL_etude = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEtudes`;
const URL_postuler = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getPostuler`;
const URL_evenement = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getEvents`;
const URL_inscription = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getInscrire`;


const Intervenant_historique = () => {
  const router = useRouter(); // Permet de naviguer entre les pages
  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext non trouvé");
  const { userMail } = context;
  const { refresh } = useLocalSearchParams(); // pour détecter un rechargement 
 
  const [postuler, setPostuler] = useState<any[]>([]);
  const [etudes, setEtudes] = useState<any[]>([]);
  const [inscrit, setInscrit] = useState<any[]>([]);
  const [evenement, setEvenements] = useState<any[]>([]);

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

    useEffect(() => {
      fetch(URL_evenement)
        .then(response => {
          if (!response.ok) throw new Error('Erreur réseau');
          return response.json();
        })
        .then(data => {
          setEvenements(data.evenement);
        })
        .catch(err => setError(err.message));
    }, [refresh]);


    useEffect(() => {
      fetch(URL_inscription)
        .then(response => {
          if (!response.ok) throw new Error('Erreur réseau');
          return response.json();
        })
        .then(data => {
          setInscrit(data.inscrire);
        })
        .catch(err => setError(err.message));
    }, [refresh]);
  const currentDate = new Date();
  const filteredpostuler = postuler.filter((postuler) => postuler.Mail_uti === userMail && postuler.Statut === 'Accepté');
  const filteredEtudes_realisées = etudes.filter((etude) =>filteredpostuler.some((post) => post.ID_etude === etude.ID_etude && new Date(etude.Date_heure_fin_etude) <= currentDate));

  const filteredinscrit = inscrit.filter((inscrit) => inscrit.Mail_uti === userMail);
  const filteredEvenement_realisées = evenement.filter((evenement) =>filteredinscrit.some((inscr) =>inscr.ID_eve === evenement.ID_eve && new Date(evenement.Date_heure_eve_fin) <= currentDate
  )
);

const historique = [
  ...filteredEtudes_realisées.map((e) => ({
    ...e,
    type: 'étude',
    dateFin: new Date(e.Date_heure_fin_etude),
  })),
  ...filteredEvenement_realisées.map((ev) => ({
    ...ev,
    type: 'événement',
    dateFin: new Date(ev.Date_heure_eve_fin),
  })),
].sort((a, b) => b.dateFin.getTime() - a.dateFin.getTime());

    // Fonction pour formater une date en JJ/MM/AAAA ou JJ/MM/AAAA à HHhMM
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      // Tableau des mois en français
      const mois = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      const jour = date.getDate(); // Pas besoin de padStart ici
      const moisNom = mois[date.getMonth()]; // getMonth() retourne 0-11
      return `${jour} ${moisNom}`;
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



      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>

               {/* Titre de l’étude */}
              <View style={[styles.cadre_titre]}>
                <FontAwesome name="history" size={30} color="black" style={styles.icon} />
                <Text style={styles.titre}>Historique</Text>
              </View>
      
  {historique.map((item) =>
    item.type === 'événement' ? (
      /* ---------- ÉVÉNEMENT ---------- */
      <ImageBackground
        key={item.ID_eve}
        source={{ uri: item.photo_eve }}
        style={styles.cadre_eve}
        imageStyle={styles.cadreBg}
      >
        
        
        <View style={styles.bouttondate}>
          <Text style={[styles.texttitre_eve, { textAlign: 'center' }]}>
            {formatDate(item.Date_heure_eve_deb)}
          </Text>
        </View>

          <View style={[styles.typeLabel,{ left: '35%',}]}>
    <Text style={styles.typeLabelText}>Événement</Text>
  </View>

        <View style={styles.cadreContent} />
        <TouchableOpacity
          style={styles.buttonVoirPlus_eve}
          onPress={() => router.push(`/Intervenant_Evenement/${item.ID_eve}`)}
        >
          <Text style={styles.texttitre_eve}>{item.Titre_eve}</Text>
          <View style={styles.voirplus}>
            <Text style={styles.buttonText}>Voir plus</Text>
            <AntDesign name="arrowright" size={18} color="#fff" style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>
      </ImageBackground>
    ) : (
      /* ---------- ÉTUDE ---------- */
      <View key={item.ID_etude} style={styles.cadre_etude}>

          <View style={styles.typeLabel}>
    <Text style={styles.typeLabelText}>Étude</Text>
  </View>

        <Text style={styles.texttitre}>{item.Titre_etude}</Text>

        <Text style={styles.textinfo} numberOfLines={8}>
          {item.Description_etude.length > 300
            ? item.Description_etude.slice(0, 300) + '…'
            : item.Description_etude}
        </Text>

        <TouchableOpacity
          style={styles.buttonVoirPlus_et}
          onPress={() => router.push(`/Intervenant_Etude/${item.ID_etude}`)}
        >
          <Text style={styles.buttonText}>Voir plus</Text>
          <AntDesign name="arrowright" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    )
  )}
</ScrollView>

      {/* Barre du bas*/}
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

const { width, height } = Dimensions.get('window'); // Récupère la taille de l'écran
const CARD_HEIGHT = height * 0.25;   // fixe ≈ 25 % de la hauteur écran


const styles = StyleSheet.create({
  
  // Conteneur principal de la page
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#D2E3ED',
  },
  
      texttitre_eve: {
      fontSize: width * 0.035,
      fontWeight: '600',
      color: 'white',
      padding: width * 0.02,
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


  typeLabel: {
  position: 'absolute',
  top:'2%',
  left: '40%',
  backgroundColor: '#56565671',
  paddingVertical: 8,
  paddingHorizontal: 15,
  zIndex: 1,
},

typeLabelText: {
  fontSize: width * 0.035,
  fontWeight: 'bold',
  color: 'white',
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

  voirplus: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight:5
},

  cadre_eve: {
  width: width * 0.85,
  height: height * 0.25,
  marginBottom: height * 0.02,
  overflow: 'hidden',
  position: 'relative',
},
cadreBg: {
  resizeMode: 'cover' // couvre toute la carte
},

cadreContent: {
  flex: 1,                
  padding: width * 0.04,
  justifyContent: 'center',
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

  bouttondate: {
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


  // Icônes livre
  icon: {
    marginRight: width * 0.02,
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
        marginBottom:  height * 0.02,
  },

  
//  Cadre pour les etudes (en attente et réalisée)
  cadre_etude: {
    backgroundColor: 'white',
    width: width * 0.85,
    borderRadius:2,
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
    marginBottom:height*0.03,
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
  buttonVoirPlus_et: {
    width: '100%',
    height: 45,
    backgroundColor: '#56565671',
    paddingLeft: 5,
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius:2,
  },

  
buttonVoirPlus_eve: {
  flexDirection: 'row',
  alignItems: 'center',
  height: CARD_HEIGHT * 0.25,    // ~25 % de la carte, adapter à ton goût
  backgroundColor: '#56565671',
  justifyContent: 'space-between', // Sépare le titre et "Voir plus"
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


export default Intervenant_historique;
