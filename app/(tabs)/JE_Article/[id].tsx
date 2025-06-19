// ===================== IMPORTS =====================

import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Import d’icônes
import { useLocalSearchParams, useRouter } from 'expo-router'; //Import pour naviguer entre pages
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';


// ===================== CONSTANTES =====================

// URL de Firebase pour récupérer et mettre à jour les articles
const IP_LOCAL = '10.15.137.55';  // À remplacer par l'IP locale
const URL_Articles = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getArticles`;
const URL_Domaines_Articles = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getDomainesArticles`;
const URL_Faire_Partie = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getFairePartie`;
const URL_Update_Articles = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/updateArticle`;

//Dimensions écran
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;


// ===================== COMPOSANT PRINCIPAL =====================

const Article = () => {
  const router = useRouter(); //Navigation entre page

  // ===================== ÉTATS =====================
  const [articles, setArticles] = useState<any[]>([]);
  const [domaines_articles, setDomainesArticles] = useState<any[]>([]);
  const [faire_partie, setFairePartie] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null); // Pour gérer les erreurs

  const { id } = useLocalSearchParams() as { id: string }; //id de l'article récupéré

  const [isEditing, setIsEditing] = useState(false); //true : mode édition , false : mode affichage
  const [articleState, setArticleState] = useState<any>({ Titre_art: '', }); // Article affiché
  const [editedText, setEditedText] = useState(''); //Stocke l'article édité, avec en valeur initiale : l'article originel s'il existe, sinon chaine vide
  const [showUpdateMessage, setShowUpdateMessage] = useState(false); //Affiche bandeau "Mise à jour de l'article" en haut ou non


  // ===================== CHARGEMENT DES DONNÉES =====================

  // Récupération des articles depuis Firebase
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
        setEditedText(initialArticle.txt); // Préremplir le champ édition
      })
      .catch(err => setError(err.message));  // Gérer les erreurs
  }, [id]);

  // Récupération des domaines d’articles depuis Firebase
  useEffect(() => {
    fetch(URL_Domaines_Articles)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération des domaines');
        return response.json();
      })
      .then(data => {
        // Ajout d'une option "Tous les domaines"
        setDomainesArticles([{ ID_domaine_art: 'D00', Nom_domaine_art: 'Domaines' }, ...data.domaines_articles]);
      })
      .catch(err =>
        setError(err.message));
  }, [articles]);

  /// Récupération des relations article-domaine (table faire_partie) depuis Firebase
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


  // ===================== GESTION DES DOMAINES =====================

  //Fonction pour associer un ID à son nom de domaine
  const getDomaineNameFromId = (id: string) => {    //Entrée : ID du domaine            
    const domaine = domaines_articles.find(d => d.ID_domaine_art === id);   //Cherche un tableau où ID_domaine_art correspond à id 
    return domaine ? domaine.Nom_domaine_art : null; //Sortie : domaine si défini, sinon null
  };

  //Fonction pour trouver les domaines des articles
  const getDomainesForArticle = (articleId: string) => { //Entrée : id de l'article dont on cherche le domaine
    return faire_partie
      .filter(fp => fp.ID_art === articleId) //Ne garde que les articles dont l'id correpond à celui en entrée
      .map(fp => getDomaineNameFromId(fp.ID_domaine_art)); //Sortie : domaine des articles restants
  };


  // ===================== UTILITAIRES =====================

  // Formatage de date en AAAA/MM/JJ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // Convertit la chaîne en objet Date
    const year = date.getFullYear(); // Récupère l'année
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Récupère le mois + ajout d'un zéro devant le mois si < 10
    const day = String(date.getDate()).padStart(2, '0'); // Récupère le jour + ajout d'un zéro devant le jour si < 10
    return `${year}/${month}/${day}`;
  };


  // ===================== GESTION ÉDITION =====================

  // Fonction pour activer l'édition du texte de l'article à modifier
  const handleEdit = () => {
    setEditedText(articleState.Txt); //initialise editedText au txt de articleState
    setIsEditing(true); //entre ds le mode édition
    setShowUpdateMessage(true); // Affiche le message "Mise à jour de l'article"
  };

  // Fonction de sauvegarde des modifs du texte de l'article
  const handleValidate = async () => {
    try {
      const response = await fetch(URL_Update_Articles, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Txt: editedText,
          ID_art: articleState.ID_art,
        }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'article');
      }
      // Mise à jour locale après retour serveur
      await fetch(URL_Articles)
        .then(response => response.json())
        .then(data => {
          const updatedArticle = data.articles.find((e: any) => e.ID_art === id);
          if (updatedArticle) {
            setArticleState(updatedArticle); // met à jour articleState avec les vraies valeurs
            setEditedText(updatedArticle.Txt); // aussi pour être sûr que editedText soit bien à jour
          }
        });
      setIsEditing(false); // quitte le mode édition
      setShowUpdateMessage(false); // Cache le message "Mise à jour de l'article"
      Alert.alert(`Article mis à jour le : `, `${formatDate(new Date().toISOString())} !`);
    }
    catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'article.');
    }
  };


  // ===================== AFFICHAGE =====================

  if (error) return <Text>{error}</Text>;

  return (
    // Pour fermer le clavier si on tape ailleurs
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS: padding, Android: height
      >

        {/* Barre supérieure */}
        <View style={styles.topBar} />

        {/* Bandeau "Mise à jour de l'article" */}
        {showUpdateMessage && (
          <View style={styles.updateBanner}>
            <Text style={styles.updateBannerText}>Mise à jour de l'article</Text>
          </View>
        )}

        {/* Bouton retour */}
        <TouchableOpacity onPress={() => {
          setIsEditing(false); // on quitte le mode édition
          setEditedText(articleState.Txt); // on réinitialise le texte édité
          setShowUpdateMessage(false); // Cache le message "Mise à jour de l'article"
          router.replace(`../JE_Articles?refresh=${Date.now()}`);
        }} style={styles.backButton}>
          <FontAwesome name="newspaper-o" size={28} color="black" style={styles.backButtonIcon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>

        {/* Article */}
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollViewContent}>
          <View style={styles.infos}>
            <Text style={styles.title}>{articleState.Titre_art}</Text>
            <Text style={styles.infos_sec}>{'Publié le : '}{formatDate(articleState.Date_publication_art)}{'\n'}{'Mis à jour le : '}{formatDate(articleState.Date_maj_art)}{'\n'}{'Auteur : '}{articleState.Auteur_art}{'\n'}{'Domaine : '}{getDomainesForArticle(articleState.ID_art).join(', ')}</Text>
          </View>
          {isEditing ? (
            <TextInput style={styles.txt} multiline value={editedText} onChangeText={setEditedText} />
          ) : (
            <Text style={styles.txt}>{articleState.Txt}</Text>
          )}
          {/* Bouton maj/valider */}
          {isEditing ? (
            <TouchableOpacity onPress={handleValidate} style={styles.majButton}>
              <Text style={styles.majButtonTxt}>Valider</Text>
              <FontAwesome name="check" size={25} color="white" style={styles.majButtonIcon} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleEdit} style={styles.majButton}>
              <Text style={styles.majButtonTxt}>Mettre à jour</Text>
              <FontAwesome name="pencil" size={25} color="white" style={styles.majButtonIcon} />
            </TouchableOpacity>
          )}
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

      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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

  //Bandeau "Mise à jour de l'article"
  updateBanner: {
    position: 'absolute',
    top: 120,
    alignItems: 'center',         //  centre verticalement
    alignSelf: 'center',          //  centre horizontalement
  },
  updateBannerText: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
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

  //Bouton maj
  majButton: {
    backgroundColor: '#4B92B7',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10, // ombre Android
    shadowColor: '#000', // ombre IOS
    shadowOffset: { width: 0, height: 6 },  // ombre IOS
    shadowOpacity: 0.3, // ombre IOS
    shadowRadius: 6, // ombre IOS
    marginBottom: 20, //espace après la case info
  },
  majButtonTxt: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  majButtonIcon: {
    resizeMode: 'contain',
    marginLeft: 10,               //  espace entre icône et texte
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

export default Article;