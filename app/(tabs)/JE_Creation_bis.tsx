import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../../context/UserContext';

const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale
const API_KEY_IMGBB = '77e7cd2a2746714d8d3ca005410b4641';

type TypeChamp = {
  label: string;
  valeur: string;
  onChangeText?: any;
};

const JEProfil = () => {
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [imageUrL, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext must be used within a UserProvider");


  useFocusEffect(
    React.useCallback(() => {
      // Réinitialise tous les champs quand la page est affichée
      setNom('');
      setPrenom('');
      setTelephone('');
    }, [])
  );

  const { mailCreation, mdpCreation } = context;

  const handleAjouterconnexion = async () => {
    if (!nom || !prenom || !telephone || !mailCreation || !mdpCreation) {
      alert('Merci de remplir tous les champs');
      return;
    }
    const imageUrl = imageUrL ? imageUrL : null;
    try {
      const reponse = await fetch(`http://${IP_LOCAL}:5001/application-5c3f8/us-central1/ajouterAdmin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mail_admin: mailCreation,
          nom_admin: nom,
          prenom_admin: prenom,
          Telephone_admin: telephone,
          Lien_pdp_admin: imageUrl || null
        }),
      });

      const message = await reponse.text();

      if (reponse.ok) {
        alert('Admin créée !');
        router.replace(`/JE_Connexion?refresh=${Date.now()}`);
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

    <View style={styles.container}>
      <View style={styles.Bar_du_haut}></View>
      <View style={styles.titreWrapper}>

        <TouchableOpacity onPress={() => router.push('/JE_Creation')} style={styles.backButton}>
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
          <Text style={styles.label}>Telephone</Text>
          <View >
            <TextInput style={styles.input} value={telephone} keyboardType="phone-pad" onChangeText={setTelephone} />
          </View>

          <TouchableOpacity
            style={styles.bouton}
            onPress={handleAjouterconnexion}
          >
            <Text style={styles.boutonTexte}>Créer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => {
            router.push('/');
          }}
        >
          <FontAwesome name="user" size={28} color="black" style={{ marginTop: height * 0.015 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  Bar_du_haut: {
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.06,
    backgroundColor: 'white',
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

export default JEProfil;
