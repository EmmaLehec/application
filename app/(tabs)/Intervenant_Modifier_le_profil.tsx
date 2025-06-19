import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Keyboard, KeyboardAvoidingView, TextInput, StyleSheet, TouchableOpacity, Image, Alert, Dimensions, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from '../../context/UserContext';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

// URL de l'API Firebase pour récupérer les articles
const IP_LOCAL = '10.226.42.55';  // Remplace par ton IP locale
const URL_Get1Uti = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/get1Uti`;
const URL_UpdateUti = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/updateUti`;

const IntProfil = () => {
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [dateNaissance, setDateNaissance] = useState<string>('');;
  const [telephone, setTelephone] = useState<string>('');
  const [adresse, setAdresse] = useState<string>('');
  const [lienEPortfolio, setLienEPortfolio] = useState<string>('');
  const [lienGitHub, setLienGitHub] = useState<string>('');
  const [photoProfil, setPhotoProfil] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // <--- Pour gérer le mode édition
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
  const [ePortfolioEnabled, setEPortfolioEnabled] = useState<boolean>(true);
  const [githubEnabled, setGithubEnabled] = useState<boolean>(true);
  const router = useRouter();

  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext must be used within a UserProvider");
  const { userMail } = context;

  //Fonction de date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // Convertit la chaîne en objet Date

    // Récupère l'année, le mois, le jour
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ajouter un zéro devant le mois si < 10
    const day = String(date.getDate()).padStart(2, '0'); // Ajouter un zéro devant le jour si < 10

    return `${year}/${month}/${day}`;
  };

  //Fonction pour choisir une image dans la galerie
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoProfil(result.assets[0].uri);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchUtiInfo = async () => {
        try {
          const response = await fetch(URL_Get1Uti, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Mail_uti: userMail }),
          });

          const data = await response.json();
          const utilisateur = data.utilisateur[0];

          setNom(utilisateur.Nom_uti);
          setPrenom(utilisateur.Prenom_uti);
          setDateNaissance(utilisateur.Date_naissance);
          setTelephone(utilisateur.Telephone_uti);
          setAdresse(utilisateur.Adresse_uti);

          if (utilisateur.Lien_eportfolio_uti) {
            setLienEPortfolio(utilisateur.Lien_eportfolio_uti);
            setEPortfolioEnabled(true);
          } else {
            setLienEPortfolio('');
            setEPortfolioEnabled(false);
          }
          if (utilisateur.Lien_github_uti) {
            setLienGitHub(utilisateur.Lien_github_uti);
            setGithubEnabled(true);
          } else {
            setLienGitHub('');
            setGithubEnabled(false);
          }
          if (utilisateur.Lien_pdp_uti) {
            setPhotoProfil(utilisateur.Lien_pdp_uti); // <= on enregistre le lien s’il existe
          }

        } catch (error) {
          Alert.alert("Erreur", "Impossible de récupérer les informations du profil.");
        }
      };

      if (userMail) {
        fetchUtiInfo();
      }
    }, [userMail])); // ⚠️ Déclenché au montage et dès que userMail change

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
          setIsEditing(false);  // quitte mode édition sans sauvegarder
          router.push('/Intervenant_Parametres');  // navigue vers la page souhaitée
        }} style={styles.backButton}>
          <FontAwesome name="cog" size={28} color="black" style={styles.backButtonIcon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>

        {/* Titre + Icône */}
        <View style={styles.titreWrapper}>
          <FontAwesome name="user-o" size={28} color="black" style={styles.icon} />
          <Text style={styles.titre}>Modifier le profil</Text>
        </View>

        {/* Formulaire */}
        <ScrollView contentContainerStyle={styles.FormulaireContainer} style={styles.FormulaireContent} >
          {/* Pdp */}
          {isEditing ? (
            <TouchableOpacity onPress={pickImage}>
              {photoProfil ? (
                <Image
                  source={{ uri: photoProfil }}
                  style={styles.imagePicker}
                />
              ) : (
                <Image
                  source={require('../../assets/images/Pdp_defaut.jpg')}
                  style={styles.imagePicker}
                />
              )}
            </TouchableOpacity>
          ) : (
            photoProfil ? (
              <Image
                source={{ uri: photoProfil }}
                style={styles.imagePicker}
              />
            ) : (
              <Image
                source={require('../../assets/images/Pdp_defaut.jpg')}
                style={styles.imagePicker}
              />
            )
          )}

          <View style={[styles.infos]}>
            {/* Nom */}
            <Text style={styles.label}>Nom</Text>
            <TextInput
              value={nom}
              onChangeText={setNom}
              style={[styles.input, !isEditing && { backgroundColor: '#EEEEEE' }]}
              editable={isEditing}
            />
            {/* Prénom */}
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              value={prenom}
              onChangeText={setPrenom}
              style={[styles.input, !isEditing && { backgroundColor: '#EEEEEE' }]}
              editable={isEditing}
            />
            {/* Date de naissance */}
            <Text style={styles.label}>Date de naissance</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) setShowDatePicker(true);
              }}
              style={[styles.input, { justifyContent: 'center' }, !isEditing && { backgroundColor: '#EEEEEE' }]}
            >
              <Text>{formatDate(dateNaissance)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={tempDate ? tempDate : new Date(dateNaissance)}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowDatePicker(false); // Android ferme automatiquement
                  if (selectedDate) {
                    const isoDate = selectedDate.toISOString();
                    setTempDate(selectedDate);
                    setDateNaissance(isoDate);
                  }
                }}
              />
            )}

            {/* Téléphone */}
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              style={[styles.input, !isEditing && { backgroundColor: '#EEEEEE' }]}
              editable={isEditing}
            />
            {/* Adresse */}
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              value={adresse}
              onChangeText={setAdresse}
              style={[styles.input, !isEditing && { backgroundColor: '#EEEEEE' }]}
              editable={isEditing}
            />

            {/* Lien e-portfolio avec case à cocher */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Lien e-portfolio</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!isEditing) return; // ⚠️ Ne rien faire si on n'est pas en mode édition
                  const newValue = !ePortfolioEnabled;
                  setEPortfolioEnabled(newValue);
                  if (!newValue) setLienEPortfolio('');
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: 1,
                  borderColor: '#333',
                  backgroundColor: ePortfolioEnabled ? '#fff' : '#ccc',
                  marginRight: 10,
                  opacity: isEditing ? 1 : 0.5, // indication visuelle de désactivation
                }}
              />

            </View>
            <TextInput
              value={lienEPortfolio}
              onChangeText={setLienEPortfolio}
              style={[
                styles.input,
                !isEditing && { backgroundColor: '#EEEEEE' },
                !ePortfolioEnabled && { backgroundColor: '#ccc' }
              ]}
              editable={isEditing && ePortfolioEnabled}
            />

            {/* Lien GitHub avec case à cocher */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Lien GitHub</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!isEditing) return; // ⚠️ Ne rien faire si on n'est pas en mode édition
                  const newValue = !githubEnabled;
                  setGithubEnabled(newValue);
                  if (!newValue) setLienGitHub('');
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: 1,
                  borderColor: '#333',
                  backgroundColor: githubEnabled ? '#fff' : '#ccc',
                  marginRight: 10,
                  opacity: isEditing ? 1 : 0.5,
                }}
              />

            </View>
            <TextInput
              value={lienGitHub}
              onChangeText={setLienGitHub}
              style={[
                styles.input,
                !isEditing && { backgroundColor: '#EEEEEE' },
                !githubEnabled && { backgroundColor: '#ccc' }
              ]}
              editable={isEditing && githubEnabled}
            />


            {/* Bouton Modifier/Valider */}
            <TouchableOpacity
              style={styles.bouton}
              onPress={async () => {
                if (isEditing) {
                  // En mode édition -> Envoi des données
                  try {
                    const payload: any = {
                      Mail_uti: userMail,
                      Nom_uti_up: nom.trim(),
                      Prenom_uti_up: prenom.trim(),
                      Date_naissance_up: dateNaissance.split('T')[0],
                      Telephone_uti_up: telephone.trim(),
                      Adresse_uti_up: adresse.trim(),
                    };

                    payload.Lien_eportfolio_uti_up = ePortfolioEnabled ? lienEPortfolio : null;
                    payload.Lien_github_uti_up = githubEnabled ? lienGitHub : null;

                    if (photoProfil) {
                      payload.Lien_pdp_uti_up = photoProfil;
                    }

                    const response = await fetch(URL_UpdateUti, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                      Alert.alert("Succès", "Profil mis à jour !");
                      setIsEditing(false); // repasse en lecture

                    } else {
                      Alert.alert("Erreur", "Échec de la mise à jour.");
                    }
                  } catch (error) {
                    Alert.alert("Erreur", "Problème lors de la mise à jour.");
                  }
                } else {
                  // On active le mode édition
                  setIsEditing(true);
                }
              }}
            >
              <Text style={styles.boutonTexte}>{isEditing ? 'Valider' : 'Modifier'}</Text>
            </TouchableOpacity>

          </View>
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
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const { width, height } = Dimensions.get('window');

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

  //Titre + icône
  titreWrapper: {
    position: 'absolute',
    top: 120,
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

  // Contenu du formulaire 
  FormulaireContainer: {
    alignItems: 'center',
  },
  FormulaireContent: {
    marginTop: 170,
    marginBottom: 80,  // pour éviter la barre du bas
  },

  //Pdp
  imagePicker: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
  },

  //Cadre infos
  infos: {
    marginTop: height * 0.02,
    borderRadius: 5,
    width: width * 0.9,
  },

  //Sous-titre
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2
  },

  //Texte Input
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    height: 40,
    marginBottom: 5,
    paddingLeft: 10,
  },

  //Bouton Modifier
  bouton: {
    backgroundColor: '#4B92B7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({ // pour ajouter un ombre à un bouton
      ios: {     // Ombres adaptées à iOS et Android
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
  boutonTexte: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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

export default IntProfil;
