import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Keyboard, KeyboardAvoidingView, TextInput, StyleSheet, TouchableOpacity, Image, Alert, Dimensions, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from '../../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { Platform } from 'react-native';
import { useCallback } from 'react';
import * as FileSystem from 'expo-file-system';

// URL de l'API Firebase pour récupérer les articles
const IP_LOCAL = '10.226.42.55';  // Remplace par ton IP locale
const URL_Get1Admin = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/get1Admin`;
const URL_UpdateAdmin = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/updateAdmin`;

const JEProfil = () => {
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [photoProfil, setPhotoProfil] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // <--- Pour gérer le mode édition
  const router = useRouter();

  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext must be used within a UserProvider");
  const { userMail } = context;

  // Fonction upload sur ImgBB (à placer dans le composant ou un fichier utils)
  const uploadImageToImgBB = async (uri: string): Promise<string | null> => {
    try {
      const apiKey = '77e7cd2a2746714d8d3ca005410b4641'; // 🔐 à remplacer ou extraire d'un .env
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const formData = new FormData();
      formData.append('image', base64);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      return json?.data?.url || null;
    } catch (e) {
      console.error('Upload ImgBB échoué', e);
      return null;
    }
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
      const fetchAdminInfo = async () => {
        try {
          const response = await fetch(URL_Get1Admin, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mail_admin: userMail }),
          });

          const data = await response.json();
          const admin = data.admin[0];

          setNom(admin.nom_admin);
          setPrenom(admin.prenom_admin);
          setTelephone(admin.Telephone_admin);

          if (admin.Lien_pdp_admin) {
            setPhotoProfil(admin.Lien_pdp_admin); // <= on enregistre le lien s’il existe
          }

        } catch (error) {
          Alert.alert("Erreur", "Impossible de récupérer les informations du profil.");
        }
      };

      if (userMail) {
        fetchAdminInfo();
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
          router.push('/JE_Parametres');  // navigue vers la page souhaitée
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
        <ScrollView contentContainerStyle={styles.FormulaireContainer} style={styles.FormulaireContent}>
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
            {/* Téléphone */}
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              style={[styles.input, !isEditing && { backgroundColor: '#EEEEEE' }]}
              editable={isEditing}
            />

            {/* Bouton Modifier/Valider */}
            <TouchableOpacity
              style={styles.bouton}
              onPress={async () => {
                if (isEditing) {
                  // En mode édition -> Envoi des données
                  try {
                    const payload: any = {
                      mail_admin: userMail,
                      nom_admin_up: nom.trim(),
                      prenom_admin_up: prenom.trim(),
                      telephone_admin_up: telephone.trim(),
                    };

                    if (photoProfil) {
                      payload.Lien_pdp_admin_up = photoProfil;
                    }

                    const response = await fetch(URL_UpdateAdmin, {
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
                  // En mode édition -> préparation du payload
                  try {
                    const payload: any = {
                      mail_admin: userMail,
                      nom_admin_up: nom.trim(),
                      prenom_admin_up: prenom.trim(),
                      telephone_admin_up: telephone.trim(),
                    };

                    // 📸 Si URI locale, on upload vers ImgBB pour en obtenir une URL publique
                    if (photoProfil && photoProfil.startsWith('file://')) {
                      const uploadedUrl = await uploadImageToImgBB(photoProfil);
                      if (!uploadedUrl) {
                        Alert.alert('Erreur', 'Échec de l’upload de la photo.');
                        return;
                      }
                      payload.lien_pdp_admin_up = uploadedUrl;
                    } else if (photoProfil) {
                      // déjà une URL → on la réutilise
                      payload.lien_pdp_admin_up = photoProfil;
                    }

                    const response = await fetch(URL_UpdateAdmin, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });

                    if (response.ok) {
                      Alert.alert('Succès', 'Profil mis à jour !');
                      setIsEditing(false);
                    } else {
                      Alert.alert('Erreur', 'Échec de la mise à jour du profil.');
                    }

                  } catch (error) {
                    console.error(error);
                    Alert.alert('Erreur', 'Problème lors de la mise à jour.');
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

  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    height: 40,
    marginBottom: 5,
    paddingLeft: 10,
  },
  editIcon: {
    position: 'absolute',
    right: 10, // marge intérieure droite
    top: '50%',
    transform: [{ translateY: -9 }], // verticalement centré (18/2 = 9)
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

export default JEProfil;
