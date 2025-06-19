//IMPORT
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Import d’icônes
import { Picker } from '@react-native-picker/picker'; //Import pour menu déroulant
import { useLocalSearchParams, useRouter } from 'expo-router'; //Import pour naviguer entre pages
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// URL de l'API Firebase pour récupérer les articles
const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale
const URL_Articles = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getArticles`;
const URL_Domaines_Articles = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getDomainesArticles`;
const URL_Faire_Partie = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getFairePartie`;

//Dimensions écran
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const Articles = () => {
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);  // Utilisation de any[] pour stocker les articles
  const [domaines_articles, setDomainesArticles] = useState<any[]>([]);  // Utilisation de any[] pour stocker les domaines d'articles
  const [faire_partie, setFairePartie] = useState<any[]>([]);  // Utilisation de any[] pour stocker faire partie
  const [error, setError] = useState<string | null>(null); // Pour gérer les erreurs

  //Lier à table Article  
  const { refresh } = useLocalSearchParams(); // pour détecter un rechargement

  useEffect(() => {
    fetch(URL_Articles)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération des articles');
        return response.json();
      })
      .then(data => {
        setArticles(data.articles); // Stocke les données dans l'état
      })
      .catch(err => setError(err.message)); // Gérer les erreurs
  }, [refresh]); // 🔁 relance le fetch à chaque changement de refresh

  //Lier à la table Domaine_article
  useEffect(() => {
    fetch(URL_Domaines_Articles)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération des domaines');
        return response.json();
      })
      .then(data => {
        // Ajoute une option "Tous les domaines" manuellement
        const domainesAvecTous = [{ ID_domaine_art: 'D00', Nom_domaine_art: 'Domaines' }, ...data.domaines_articles];
        setDomainesArticles(domainesAvecTous);
      })
      .catch(err => {
        console.error(err);
        setError('Impossible de charger les domaines');
      });
  }, []);

  //Lier à la table Faire_partie
  useEffect(() => {
    fetch(URL_Faire_Partie)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération de faire partie');
        return response.json();
      })
      .then(data => {
        setFairePartie(data.faire_partie); // Stocke les données dans l'état
      })
      .catch(err => {
        console.error(err);
        setError('Impossible de charger les domaines');
      });
  }, []);

  //Fonction pour associer un ID à son nom de domaine
  const getDomaineNameFromId = (id: string) => {    //prend id du domaine en entrée            
    const domaine = domaines_articles.find(d => d.ID_domaine_art === id);   //cherche un tableau où ID_domaine_art correspond à id 
    return domaine ? domaine.Nom_domaine_art : null; //retourne domaine si défini, sinon null
  };

  //Fonction pour trouver les domaines des articles
  const getDomainesForArticle = (articleId: string) => { //prend en entrée l'id de l'article dont on cherche le domaine
    return faire_partie
      .filter(fp => fp.ID_art === articleId) //ne garde que les articles dont l'id correpond à celui en entrée
      .map(fp => getDomaineNameFromId(fp.ID_domaine_art)); //récupère le domaine des articles restants
  };

  //Fonction de format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // Convertit la chaîne en objet Date

    // Récupère l'année, le mois, le jour, l'heure et les minutes
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ajouter un zéro devant le mois si < 10
    const day = String(date.getDate()).padStart(2, '0'); // Ajouter un zéro devant le jour si < 10

    return `${year}/${month}/${day}`;
  };

  // États pour les deux menus déroulants
  const [selectedDomaine, setSelectedDomaine] = React.useState('Domaines');
  const [selectedTri, setSelectedTri] = React.useState('datemaj');

  //Fontions de filtre
  const filteredArticles = articles.filter((article) => {
    if (selectedDomaine === 'Domaines') return true;
    const domainesDeLArticle = getDomainesForArticle(article.ID_art); //on récupère les domaines associés à l'article actuel
    return domainesDeLArticle.includes(selectedDomaine); //on garde l'article si le domaine sélectionné correspond au domaine de l'article
  });

  //Fonction de tri
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const dateA = new Date(a.Date_maj_art).getTime();
    const dateB = new Date(b.Date_maj_art).getTime();
    if (selectedTri === 'croissante') {
      return dateA - dateB;
    } else if (selectedTri === 'decroissante') {
      return dateB - dateA;
    }
    return 0;
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
        <FontAwesome name="newspaper-o" size={28} color="black" style={styles.icon} />
        <Text style={styles.titre}>Articles</Text>
      </View>

      {/* Filtre et tri*/}
      <View style={styles.pickerRow}>

        {/* Filtre domaine */}
        <Picker
          selectedValue={selectedDomaine}
          onValueChange={(itemValue, itemIndex) => setSelectedDomaine(itemValue)}
          style={styles.picker}
        >
          {domaines_articles.map((domaine) => (
            <Picker.Item
              key={domaine.ID_domaine_art}
              label={domaine.Nom_domaine_art}
              value={domaine.Nom_domaine_art}
            />
          ))}
        </Picker>

        {/* Tri date maj */}
        <Picker
          selectedValue={selectedTri}
          onValueChange={(itemValue, itemIndex) => setSelectedTri(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Date de mise à jour" value="datemaj" />
          <Picker.Item label="Croissante" value="croissante" />
          <Picker.Item label="Décroissante" value="decroissante" />
        </Picker>
      </View>

      {/* ScrollView contenant les articles */}
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollViewContent} >
        {sortedArticles.map((article) => (
          <View key={article.ID_art} style={styles.art}>
            {/* Début d'article */}
            <Text style={styles.art_title}>{article.Titre_art}</Text>
            <Text style={styles.art_date}>{'Publié le : '}{formatDate(article.Date_publication_art)}{'\n'}{'Mis à jour le : '}{formatDate(article.Date_maj_art)}{'\n'}</Text>
            {/* Affiche 2 lignes si le titre est long (>47), sinon 3 lignes */}
            <Text
              style={styles.art_txt}
              numberOfLines={article.Titre_art.length > 47 ? 2 : 3}
            >
              {article.Txt}
            </Text>

            {/* Rectangle gris transparent */}
            <TouchableOpacity onPress={() => router.push(`/Intervenant_Article/${article.ID_art}`)} style={styles.bottomOverlay}>
              <Text style={styles.bottomOverlayText}>Voir plus</Text>
              <AntDesign name="arrowright" size={28} color="white" style={styles.fleche} />
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
    top: 70,
    flexDirection: 'row',         //  icône + texte côte à côte
    alignItems: 'center',         //  centre verticalement
    alignSelf: 'center',          //  centre horizontalement
  },
  icon: {
    marginRight: 8,               //  espace entre icône et texte
  },
  titre: {
    fontSize: 25,
    fontWeight: 'bold',
  },

  //Filtre et tri
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 130,        // marge du haut
  },
  picker: {
    height: 50,
    width: screenWidth * 0.4,
    backgroundColor: '#E4DFDB',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  // ScrollView
  scrollViewContent: {
    marginTop: 10,
    marginBottom: 60,  // pour éviter la barre du bas
  },
  scrollContainer: {
    alignItems: 'center',  // centre horizontalement les articles
    paddingVertical: 5,
  },

  //Articles
  art: {
    width: screenWidth * 0.85,  // 85% largeur écran
    height: 150,
    backgroundColor: 'white',
    marginVertical: 10, //espace entre chaque article
    borderRadius: 2,
    justifyContent: 'flex-start',  // aligne en haut texte
    paddingTop: 10,             // un peu d’espace au dessus
    alignItems: 'flex-start',  // ALIGNE HORIZONTALEMENT À GAUCHE
    paddingLeft: 10,           // un peu d’espace à gauche
    elevation: 10, // ombre Android
    shadowColor: '#000', // ombre IOS
    shadowOffset: { width: 0, height: 6 },  // ombre IOS
    shadowOpacity: 0.3, // ombre IOS
    shadowRadius: 6, // ombre IOS
  },
  art_title: {
    color: 'black',
    fontSize: 13,
    fontWeight: '600',
  },
  art_date: {
    color: 'black',
    fontSize: 11,
    fontWeight: '600',
  },
  art_txt: {
    color: '#437E9B',
    fontSize: 11,
    fontWeight: '600',
  },

  //Rectangle gris et voir plus
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#56565671', // gris
    paddingVertical: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',  // centre verticalement texte
    justifyContent: 'flex-start',  // ALIGNE HORIZONTALEMENT À GAUCHE
    paddingLeft: 10,           // un peu d’espace à gauche
    flexDirection: 'row',
  },
  bottomOverlayText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  fleche: {
    marginLeft: 5,               //  espace entre icône et texte
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

export default Articles;