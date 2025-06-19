//IMPORT
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Import d’icônes
import { useLocalSearchParams, useRouter } from 'expo-router'; //Import pour naviguer entre pages
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';


// URL de l'API Firebase pour récupérer les articles
const IP_LOCAL = '10.15.137.55';  // Remplacer par IP locale
const URL_Articles = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getArticles`;
const URL_Domaines_Articles = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getDomainesArticles`;
const URL_Faire_Partie = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getFairePartie`;

//Dimensions écran
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const Article = () => {
  const router = useRouter(); //accès à la navigation entre pages
  const [articles, setArticles] = useState<any[]>([]);  // Utilisation de any[] pour stocker les articles
  const [domaines_articles, setDomainesArticles] = useState<any[]>([]);  // Utilisation de any[] pour stocker les domaines d'articles
  const [faire_partie, setFairePartie] = useState<any[]>([]);  // Utilisation de any[] pour stocker faire partie
  const [error, setError] = useState<string | null>(null); // Pour gérer les erreurs
  const { id } = useLocalSearchParams() as { id: string }; //accès à la récupération de l'id de l'article
  const [articleState, setArticleState] = useState<any>({ Titre_art: '', }); // Article affiché
  const [editedText, setEditedText] = useState(''); //stocke l'article édité, avec en valeur initiale : l'article originel s'il existe, sinon chaine vide

  //Chargement des Articles
  useEffect(() => {
    fetch(URL_Articles)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération des articles');
        return response.json();
      })
      .then(data => {
        setArticles(data.articles);  // Stocke les données dans l'état
        const initialArticle = data.articles.find((e: any) => e.ID_art === id);
        if (!initialArticle) {
          throw new Error('Article introuvable');
        }
        setArticleState(initialArticle);
        setEditedText(initialArticle.txt);
      })
      .catch(err => setError(err.message));  // Gérer les erreurs
  }, [id]);

  //Chargement des Domaines d'article
  useEffect(() => {
    fetch(URL_Domaines_Articles)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération des domaines');
        return response.json();
      })
      .then(data => {
        // Ajoute une option "Tous les domaines" manuellement
        setDomainesArticles([{ ID_domaine_art: 'D00', Nom_domaine_art: 'Domaines' }, ...data.domaines_articles]);
      })
      .catch(err =>
        setError(err.message));
  }, [articles]);

  //Chargement de la table Faire_partie
  useEffect(() => {
    fetch(URL_Faire_Partie)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération de faire partie');
        return response.json();
      })
      .then(data => {
        setFairePartie(data.faire_partie); // Stocke les données dans l'état
      })
      .catch(err =>
        setError(err.message));
  }, [articles]);


  if (error) return <Text>{error}</Text>;

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

  //Fonction de date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // Convertit la chaîne en objet Date

    // Récupère l'année, le mois, le jour, l'heure et les minutes
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ajouter un zéro devant le mois si < 10
    const day = String(date.getDate()).padStart(2, '0'); // Ajouter un zéro devant le jour si < 10

    return `${year}/${month}/${day}`;
  };

  return (
    <View style={styles.container}>
      {/* Barre supérieure */}
      <View style={styles.topBar} />

      {/* Bouton retour */}
      <TouchableOpacity onPress={() => { router.push('../Intervenant_Articles') }} style={styles.backButton}>
        <FontAwesome name="newspaper-o" size={28} color="black" style={styles.backButtonIcon} />
        <AntDesign name="arrowleft" size={28} color="black" />
      </TouchableOpacity>

      {/* Article */}
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollViewContent}>
        <View style={styles.infos}>
          <Text style={styles.title}>{articleState.Titre_art}</Text>
          <Text style={styles.infos_sec}>{'Publié le : '}{formatDate(articleState.Date_publication_art)}{'\n'}{'Mis à jour le : '}{formatDate(articleState.Date_maj_art)}{'\n'}{'Auteur : '}{articleState.Auteur_art}{'\n'}{'Domaine : '}{getDomainesForArticle(articleState.ID_art).join(', ')}</Text>
        </View>
        <Text style={styles.txt}>{articleState.Txt}</Text>
      </ScrollView>

      {/* Barre inférieure */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('../')}>
          <FontAwesome name="user" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('..//Intervenant_Accueil')}>
          <FontAwesome name="home" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('../Intervenant_Parametres')}>
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
  backButtonIcon: {
    resizeMode: 'contain',
    marginRight: 5,               //  espace entre icône et texte
  },

  // ScrollView
  scrollViewContent: {
    marginTop: 170,
    marginBottom: 80,  // pour éviter la barre du bas
  },
  scrollContainer: {
    alignItems: 'center',  // centre horizontalement les articles
  },

  //Article
  infos: {
    backgroundColor: 'white',
    paddingVertical: 10,  //espace au dessus et en dessous de la zone de txt d'infos
    width: screenWidth * 0.85,  // 85% largeur écran
    paddingHorizontal: 10, //espace sur les cotés de la zone de txt d'infos
    borderRadius: 10,
    alignItems: 'flex-start', //aligne le txt d'infos à gauche
    marginBottom: 20, //espace après la case info
    elevation: 10, // ombre Android
    shadowColor: '#000', // ombre IOS
    shadowOffset: { width: 0, height: 6 },  // ombre IOS
    shadowOpacity: 0.3, // ombre IOS
    shadowRadius: 6, // ombre IOS
  },
  title: {
    color: 'black',
    fontSize: 22,
    fontWeight: '600',
  },
  infos_sec: {
    color: 'black',
    fontSize: 15,
    fontWeight: '600',
  },
  txt: {
    width: screenWidth * 0.85,  // 85% largeur écran
    color: '#717477',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20, //espace après la case info
  },
  notFoundText: { fontSize: 20, color: 'red' },

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

export default Article;