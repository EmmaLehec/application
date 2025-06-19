import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard, KeyboardAvoidingView, TouchableOpacity, Image, ScrollView, Alert, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from '../../context/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale
const API_KEY_IMGBB = '77b5d4ea764ab7a2fe091155ce42ca7b';

type TypeChamp = {
  label: string;
  valeur: string;
  onChangeText?: any;
};

const IntervProfil = () => {
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [dateNaissance, setDateNaissance] = useState<string>('');
  const [showDateNaiss, setShowDateNaiss] = useState(false);
  const [telephone, setTelephone] = useState<string>('');
  const [adresse, setAdresse] = useState<string>('');
  const [portfolioActif, setPortfolioActif] = useState<boolean>(false);
  const [githubActif, setGithubActif] = useState<boolean>(false);
  const [portfolioLien, setPortfolioLien] = useState<string>('');
  const [githubLien, setGithubLien] = useState<string>('');
  const [imageUrL, setImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext must be used within a UserProvider");

  const formatDateTimeForMySQL = (isoString: string): string => {
    const date = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `;
  };

  useFocusEffect(
    React.useCallback(() => {
      // Réinitialise tous les champs quand la page est affichée
      setNom('');
      setPrenom('');
      setDateNaissance('');
      setTelephone('');
      setAdresse('');
      setPortfolioLien('');
      setPortfolioActif(false);
      setGithubLien('');
      setGithubActif(false);
    }, [])
  );

  const { mailCreation, mdpCreation } = context;
  const handleAjouterconnexion = async () => {
    if (!nom || !prenom || !telephone || !mailCreation || !mdpCreation || !dateNaissance || !adresse) {
      alert('Merci de remplir tous les champs');
      return;
    }
    const imageUrl = imageUrL ? imageUrL : null;
    try {
      const reponse = await fetch(`http://${IP_LOCAL}:5001/application-5c3f8/us-central1/ajouterUtilisateur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Mail_uti: mailCreation,
          Nom_uti: nom,
          Prenom_uti: prenom,
          Adresse_uti: adresse,
          Date_naissance: formatDateTimeForMySQL(dateNaissance),
          Lien_eportfolio_uti: portfolioLien?.trim() !== '' ? portfolioLien : null,
          Lien_github_uti: githubLien?.trim() !== '' ? githubLien : null,
          Telephone_uti: telephone,
          Lien_pdp_uti: imageUrl || null
        }),
      });

      const message = await reponse.text();

      if (reponse.ok) {
        alert('Intervenant créée !');
        router.replace(`/Intervenant_Connexion?refresh=${Date.now()}`);
      } else {
        alert('Erreur : ' + message);
      }
    } catch (error) {
      console.error('Erreur API :', error);
      alert('Une erreur est survenue');
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission refusée", "Tu dois autoriser l'accès à la galerie");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageAsset = result.assets[0];
    const uri = imageAsset.uri;
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const formData = new FormData();
    formData.append('image', {
      uri,
      name: filename,
      type,
    } as any);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.success) {
        const url = data.data.url;
        setImageUrl(url);

      } else {
        console.log(data);
        Alert.alert("Erreur ImgBB", data?.error?.message || "Erreur inconnue");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erreur réseau", err.message);
    }
  };

  return (

    // Pour fermer le clavier si on tape ailleurs
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS: padding, Android: height
      >
        {/* Barre supérieure */}
        <View style={styles.topBar} />
        <View style={styles.titreWrapper}>
          <TouchableOpacity onPress={() => router.push('/Intervenant_Creation')} style={styles.backButton}>
            <FontAwesome name="user" size={20} color="black" style={styles.icon} />
            <AntDesign name="arrowleft" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUrL ? (<Image source={{ uri: imageUrL }} style={styles.image} />
            ) : (
              <FontAwesome name="user-plus" size={100} color="black" />
            )}
          </TouchableOpacity>

          <View style={[styles.cadre]}>
            <Champ label="Nom" valeur={nom} onChangeText={setNom} />
            <Champ label="Prénom" valeur={prenom} onChangeText={setPrenom} />
            <Text style={styles.label}>Date de naissance</Text>
            <TouchableOpacity onPress={() => setShowDateNaiss(true)} style={[styles.input, { height: 40, justifyContent: 'center' }]}>
              <Text>
                {dateNaissance ? new Date(dateNaissance).toLocaleDateString() : ''}
              </Text>
            </TouchableOpacity>
            {showDateNaiss && (<DateTimePicker
              value={dateNaissance ? new Date(dateNaissance) : new Date()}
              mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDateNaiss(false); if (selectedDate) { const date = new Date(selectedDate); setDateNaissance(date.toISOString()); }
              }}
            />)}

            <Text style={styles.label}>Telephone</Text>
            <View >
              <TextInput style={styles.input} value={telephone} keyboardType="phone-pad" onChangeText={setTelephone} />
            </View>
            <Champ label="Adresse" valeur={adresse} onChangeText={setAdresse} />


            <View style={styles.checkboxLigne}>
              <Text style={styles.checkboxLabel}>Lien e-portfolio</Text>
              <TouchableOpacity onPress={() => setPortfolioActif(!portfolioActif)} style={styles.checkboxWrapper}>
                <FontAwesome
                  name={portfolioActif ? 'check-square-o' : 'square-o'}
                  size={28}
                  color="black"
                />
              </TouchableOpacity>

            </View>
            {portfolioActif && (
              <Champ valeur={portfolioLien} onChangeText={setPortfolioLien} label={''} />
            )}

            <View style={styles.checkboxLigne}>
              <Text style={styles.checkboxLabel}>Lien GitHub</Text>
              <TouchableOpacity onPress={() => setGithubActif(!githubActif)} style={styles.checkboxWrapper}>
                <FontAwesome
                  name={githubActif ? 'check-square-o' : 'square-o'}
                  size={28}
                  color="black"
                />
              </TouchableOpacity>

            </View>
            {githubActif && (
              <Champ valeur={githubLien} onChangeText={setGithubLien} label={''} />
            )}

            <TouchableOpacity
              style={styles.bouton}
              onPress={handleAjouterconnexion}
            >
              <Text style={styles.boutonTexte}>Créer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => { router.push('/'); }}>
            <FontAwesome name="user" size={28} color="black" style={{ marginTop: height * 0.015 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};


const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Contenu du ScrollView 
  scrollViewContainer: {
    alignItems: 'center',
  },
  scrollViewContent: {
    marginTop: height * 0.07,
    marginBottom: height * 0.15,
  },

  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#D2E3ED',
  },
  //Barre du haut
  topBar: {
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
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2
  },
  cadre: {
    marginTop: height * 0.02,

    borderRadius: 5,
    width: width * 0.9,
  },
  // Bouton retour 
  backButton: {
    position: 'absolute',
    top: 0,
    left: width * 0.04,
    backgroundColor: 'white',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Ombres adaptées à iOS et Android
    ...Platform.select({ // pour ajouter un ombre à un bouton
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
  checkboxWrapper: {

    // Ombres adaptées à iOS et Android
    ...Platform.select({ // pour ajouter un ombre à un bouton
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
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    height: 40,
    marginBottom: 5,
    paddingLeft: 10,
  },
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
    width: '100%',
    height: '100%',
  },
  checkboxLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,

  },
  checkboxLabel: {
    marginLeft: 4,
    fontWeight: 'bold',
    paddingRight: 10
  },
  bouton: {
    backgroundColor: '#4B92B7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    // Ombres adaptées à iOS et Android
    ...Platform.select({ // pour ajouter un ombre à un bouton
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
  boutonTexte: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  // Bloc contenant le titre et le bouton retour
  titreWrapper: {
    position: 'absolute',
    top: height * 0.075, // Position verticale du bloc titre
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Icône (livre)
  icon: {
    marginRight: width * 0.02,
  },
});

const Champ = ({ label, valeur, onChangeText }: TypeChamp) => (
  <>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      value={valeur}
      onChangeText={onChangeText}
      style={styles.input}
      placeholder={''}
    />
  </>
);

export default IntervProfil;
