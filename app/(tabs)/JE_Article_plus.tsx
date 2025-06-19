//IMPORT
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Import d’icônes
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; //Import pour menu déroulant
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router'; //Import pour naviguer entre pages
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { UserContext } from '../../context/UserContext';


// URL de l'API Firebase pour récupérer les articles
const IP_LOCAL = '10.226.42.55';  // Remplace par ton IP locale
const URL_Domaines_Articles = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getDomainesArticles`;
const URL_Ajouter_Article_Complet = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/ajouterArticleComplet`;
const URL_Ajouter_Domaine_article = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/ajouterDomaineArticle`;

//Dimensions écran
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const Article = () => {
  const router = useRouter(); //accès à la navigation entre pages
  const [domaines_articles, setDomainesArticles] = useState<any[]>([]);  // Utilisation de any[] pour stocker les domaines d'articles
  const [error, setError] = useState<string | null>(null); // Pour gérer les erreurs
  const [articleHeight, setArticleHeight] = useState(40); // hauteur initiale
  //Article complet
  const [titreArt, setTitreArt] = useState('');
  const [datePublicationArt, setDatePublicationArt] = useState('');
  const [dateMajArt, setDateMajArt] = useState('');
  const [showDatePublicationPicker, setShowDatePublicationPicker] = useState(false);
  const [showDateMajPicker, setShowDateMajPicker] = useState(false);
  const [auteurArt, setAuteurArt] = useState('');
  const [txtArt, setTxtArt] = useState('');
  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext non trouvé");
  const { userMail } = context;
  //nouveau domaine
  const [showPopup, setShowPopup] = useState(false);
  const [nouveauDomaine, setNouveauDomaine] = useState('');

  //formulaire vierge
  useFocusEffect(
    React.useCallback(() => {
      // Réinitialise tous les champs quand la page est affichée
      setTitreArt('');
      setDatePublicationArt('');
      setDateMajArt('');
      setAuteurArt('');
      setTxtArt('');
      setSelectedDomaine('D01');
      setShowPopup(false);
      setNouveauDomaine('');
    }, [])
  );

  const onChangeDatePublication = (event: any, selectedDate?: Date) => {
    setShowDatePublicationPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0]; // format YYYY-MM-DD
      setDatePublicationArt(formatted);
    }
  };

  const onChangeDateMaj = (event: any, selectedDate?: Date) => {
    setShowDateMajPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setDateMajArt(formatted);
    }
  };

  const handleAjouterArticle = async () => {
    if (!titreArt || !datePublicationArt || !dateMajArt || !auteurArt || !txtArt) {
      alert('Merci de remplir tous les champs');
      return;
    }

    const mail_admin = userMail;

    if (!mail_admin) {
      alert("Erreur : aucun administrateur connecté.");
      return;
    }

    try {
      const reponse = await fetch(URL_Ajouter_Article_Complet, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Titre_art: titreArt,
          Date_publication_art: datePublicationArt,
          Date_maj_art: dateMajArt,
          Auteur_art: auteurArt,
          Txt: txtArt,
          mail_admin,
          ID_domaine_art: selectedDomaine
        }),
      });

      const message = await reponse.text();

      if (reponse.ok) {
        alert('Article créé !');
        router.replace(`/JE_Articles?refresh=${Date.now()}`);
      } else {
        alert('Erreur : ' + message);
      }
    } catch (error) {
      console.error('Erreur API :', error);
      alert('Une erreur est survenue');
    }
  };

  //Lier à la table Domaine_article
  useEffect(() => {
    fetch(URL_Domaines_Articles)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération des domaines');
        return response.json();
      })
      .then(data => {
        const domainesAvecPlus = [...data.domaines_articles, { ID_domaine_art: 'PLUS', Nom_domaine_art: '+' }];
        setDomainesArticles(domainesAvecPlus);
      })
      .catch(err => {
        console.error(err);
        setError('Impossible de charger les domaines');
      });
  }, []);

  // Fonction ajouter nouveau domaine
  const handleAjouterDomaine = async () => {
    if (!nouveauDomaine.trim()) {
      alert('Merci de saisir un nom de domaine');
      return;
    }

    try {
      const response = await fetch(URL_Ajouter_Domaine_article, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nom_domaine_art: nouveauDomaine }),
      });

      const message = await response.text();

      if (response.ok) {
        alert('Nouveau domaine ajouté !');
        setShowPopup(false);
        setNouveauDomaine('');
        // Recharge la liste des domaines
        const reload = await fetch(URL_Domaines_Articles);
        const data = await reload.json();
        const domainesAvecOption = [
          ...data.domaines_articles,
          { ID_domaine_art: 'PLUS', Nom_domaine_art: '+' }
        ];
        setDomainesArticles(domainesAvecOption);
      } else {
        alert('Erreur : ' + message);
      }
    } catch (error) {
      console.error('Erreur ajout domaine :', error);
      alert('Une erreur est survenue');
    }
  };

  // États pour le menu déroulant
  const [selectedDomaine, setSelectedDomaine] = React.useState('D01');

  return (
    // Pour fermer le clavier si on tape ailleurs
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS: padding, Android: height
      >
        {/* Barre supérieure */}
        <View style={styles.topBar} />

        {/* Bouton retour */}
        <TouchableOpacity onPress={() => {
          router.push('/JE_Articles')
        }} style={styles.backButton}>
          <FontAwesome name="newspaper-o" size={28} color="black" style={styles.backButtonIcon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>

        {/* Titre */}
        <View style={styles.titreWrapper}>
          <Text style={styles.titre}>Ajout d'un article</Text>
        </View>

        {/* Formulaire */}
        {/* Titre */}
        <ScrollView style={styles.scrollViewContent}>
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Titre de l'article</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TextInput style={styles.Input} placeholder="..." value={titreArt} onChangeText={setTitreArt} />
          </View>
          {/* Date de publication */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Date de publication</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TouchableOpacity onPress={() => setShowDatePublicationPicker(true)}>
              <Text style={styles.Input}>{datePublicationArt || 'Sélectionner une date'}</Text>
            </TouchableOpacity>
            {showDatePublicationPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="spinner"
                onChange={onChangeDatePublication}
              />
            )}
          </View>
          {/* Date de maj */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Date de mise à jour</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TouchableOpacity onPress={() => setShowDateMajPicker(true)}>
              <Text style={styles.Input}>{dateMajArt || 'Sélectionner une date'}</Text>
            </TouchableOpacity>
            {showDateMajPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="spinner"
                onChange={onChangeDateMaj}
              />
            )}
          </View>
          {/* Auteur */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Auteur</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TextInput style={styles.Input} placeholder="..." value={auteurArt} onChangeText={setAuteurArt} />
          </View>
          {/* Domaine */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Domaine</Text>
          </View>
          <Picker
            selectedValue={selectedDomaine}
            onValueChange={(itemValue, itemIndex) => {
              if (itemValue === 'PLUS') {
                setShowPopup(true); // popup pour ajouter un domaine
              } else {
                setSelectedDomaine(itemValue);
              }
            }}
            style={styles.picker}
          >
            {domaines_articles.map((domaine) => (
              <Picker.Item
                key={domaine.ID_domaine_art}
                label={domaine.Nom_domaine_art}
                value={domaine.ID_domaine_art}
              />
            ))}
          </Picker>
          {/* Article */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Article</Text>
          </View>
          <View style={[styles.bandeauInput, { minHeight: articleHeight + 10 }]}>
            <TextInput
              style={[styles.Input, { height: articleHeight }]}
              multiline
              onChangeText={setTxtArt}
              value={txtArt}
              onContentSizeChange={(e) => {
                setArticleHeight(e.nativeEvent.contentSize.height);
              }}
              placeholder="..."
            />
          </View>
        </ScrollView>

        {/* Popup pour ajouter un domaine personnalisé */}
        <Modal visible={showPopup} animationType="slide" transparent={true}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Nouveau domaine</Text>
              <TextInput
                placeholder="Nom du domaine"
                value={nouveauDomaine}
                onChangeText={setNouveauDomaine}
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8 }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <TouchableOpacity onPress={() => setShowPopup(false)}>
                  <Text style={{ color: 'red' }}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAjouterDomaine}>
                  <Text style={{ color: 'blue' }}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bouton plus */}
        <TouchableOpacity style={styles.Buttonplus} onPress={handleAjouterArticle}>
          <Image source={require('../../assets/images/Bouton_plus.png')} style={styles.imagebouton} />
        </TouchableOpacity>

        {/* Barre inférieure */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <FontAwesome name="user" size={28} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/JE_Accueil')}>
            <FontAwesome name="home" size={28} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/JE_Parametres')}>
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

  //Titre
  titreWrapper: {
    position: 'absolute',
    top: 120,
    flexDirection: 'row',         //  icône + texte côte à côte
    alignItems: 'center',         //  centre verticalement
    alignSelf: 'center',          //  centre horizontalement
  },
  titre: {
    fontSize: 25,
    fontWeight: 'bold',
  },

  // ScrollView
  scrollViewContent: {
    marginTop: 170,
    marginBottom: 80,  // pour éviter la barre du bas
  },

  //Formulaire
  bandeauSousTitre: {
    alignItems: 'flex-start',
    paddingLeft: screenWidth * 0.025,
    marginBottom: 10, //espace après le bandeau
  },
  SousTitre: {
    fontSize: 15,
    fontWeight: '600',
  },
  bandeauInput: {
    backgroundColor: 'white',
    paddingVertical: 5,  //espace au dessus et en dessous de la zone de txt d'infos
    paddingLeft: 5,  //espace à gauche de la zone de txt d'infos
    width: screenWidth * 0.95,  // 95% largeur écran
    borderRadius: 10,
    marginBottom: 10, //espace après le bandeau Input
    alignSelf: 'center',          //  centre horizontalement
  },
  Input: {
    fontSize: 15,
    fontWeight: '600',
  },
  picker: {
    height: 50,
    width: screenWidth * 0.5,
    backgroundColor: '#E4DFDB',
    borderRadius: 5,
    marginHorizontal: 10,
  },

  //Bouton plus
  Buttonplus: {
    position: 'absolute',
    bottom: 70,
    right: 10,
    elevation: 10, // ombre Android
    shadowColor: '#000', // ombre IOS
    shadowOffset: { width: 0, height: 6 },  // ombre IOS
    shadowOpacity: 0.3, // ombre IOS
    shadowRadius: 6, // ombre IOS
  },
  imagebouton: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
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

  //Nouveau domaine
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  popup: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  popupInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    borderRadius: 5,
    marginBottom: 10,
  },
  popupButton: {
    backgroundColor: '#007BFF',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Article;