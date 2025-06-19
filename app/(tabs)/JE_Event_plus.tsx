//IMPORT
import { AntDesign, FontAwesome } from '@expo/vector-icons'; // Import d’icônes
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; //Import pour menu déroulant
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router'; //Import pour naviguer entre pages
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { UserContext } from '../../context/UserContext';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';


// URL de l'API Firebase pour récupérer les articles
const IP_LOCAL = '10.15.137.55';  // Remplace par ton IP locale
const URL_get_TypeEve = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getType_eve`;
const URL_Ajouter_Evenement = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/ajouterEvenement`;

//Dimensions écran
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const Event = () => {
  const router = useRouter(); //accès à la navigation entre pages
  const [type_event, setTypeEvent] = useState<any[]>([]);  // Utilisation de any[] pour stocker type d'event
  const [error, setError] = useState<string | null>(null); // Pour gérer les erreurs
  const [eventHeight, setEventHeight] = useState(40); // hauteur initiale
  //Event
  const [titreEvent, setTitreEvent] = useState('');
  const [date_heure_eve_deb, setDateHeureEveDeb] = useState('');
  const [date_heure_eve_fin, setDateHeureEveFin] = useState('');
  const [date_eve_deb, setDateEveDeb] = useState('');
  const [date_eve_fin, setDateEveFin] = useState('');
  const [heure_eve_deb, setHeureEveDeb] = useState('');
  const [heure_eve_fin, setHeureEveFin] = useState('');
  const [lieu_eve, setLieuEve] = useState('');
  const [description_eve, setDescriptionEve] = useState('');
  const [lien_photo_eve, setLienPhotoEve] = useState<string | null>(null);
  const [nb_place_eve, setNbPlaceEve] = useState('');
  const [showDateDebPicker, setShowDateDebPicker] = useState(false);
  const [showDateFinPicker, setShowDateFinPicker] = useState(false);
  const [showHeureDebPicker, setShowHeureDebPicker] = useState(false);
  const [showHeureFinPicker, setShowHeureFinPicker] = useState(false);
  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext non trouvé");
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
      setLienPhotoEve(result.assets[0].uri);
    }
  };

  const handlePickAndUpload = async () => {
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
      const uri = result.assets[0].uri;
      setLienPhotoEve(uri);
      if (uri.startsWith('file://')) {
        const uploadedUrl = await uploadImageToImgBB(uri);
        if (uploadedUrl) {
          setLienPhotoEve(uploadedUrl);
        } else {
          Alert.alert('Erreur', "Échec de l'upload de l'image.");
        }
      }
    }
  };



  //formulaire vierge
  useFocusEffect(
    React.useCallback(() => {
      // Réinitialise tous les champs quand la page est affichée
      setTitreEvent('');
      setDateEveDeb('');
      setHeureEveDeb(''),
        setDateEveFin('');
      setHeureEveFin(''),
        setLieuEve('');
      setDescriptionEve('');
      setLienPhotoEve('');
      setNbPlaceEve('');
      setSelectedType(null);
    }, [])
  );

  // DateTime format : YYYY-MM-DD
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTimeFull = (dateStr: string, timeStr: string): string => {
    return `${dateStr} ${timeStr}:00`; // Format final : YYYY-MM-DD HH:MM:SS
  };

  const onChangeDateEveDeb = (event: any, selectedDate?: Date) => {
    setShowDateDebPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = formatDateTime(selectedDate);
      setDateEveDeb(formatted);
      if (heure_eve_deb) {
        setDateHeureEveDeb(formatDateTimeFull(formatted, heure_eve_deb))
      }
    }
  };

  const onChangeHeureEveDeb = (event: any, selectedDate?: Date) => {
    setShowHeureDebPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedTime = format(selectedDate, 'HH:mm'); // Ex : "14:30"
      setHeureEveDeb(formattedTime);
      if (date_eve_deb) {
        setDateHeureEveDeb(formatDateTimeFull(date_eve_deb, formattedTime));
      }
    }
  };

  const onChangeDateEveFin = (event: any, selectedDate?: Date) => {
    setShowDateFinPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = formatDateTime(selectedDate);
      setDateEveFin(formatted);
      if (heure_eve_fin) {
        setDateHeureEveFin(formatDateTimeFull(formatted, heure_eve_fin));
      }
    }
  };

  const onChangeHeureEveFin = (event: any, selectedDate?: Date) => {
    setShowHeureFinPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedTime = format(selectedDate, 'HH:mm'); // Ex : "14:30"
      setHeureEveFin(formattedTime);
      if (date_eve_fin) {
        setDateHeureEveFin(formatDateTimeFull(date_eve_fin, formattedTime));
      }
    }
  };

  const handleAjouterEvent = async () => {
    if (!titreEvent || !date_heure_eve_deb || !date_heure_eve_fin || !lieu_eve || !description_eve || !lien_photo_eve || !nb_place_eve) {
      alert('Merci de remplir tous les champs');
      return;
    }

    const mail_admin = userMail;
    if (!mail_admin) {
      alert("Erreur : aucun administrateur connecté.");
      return;
    }

let imageUrl = lien_photo_eve;
    if (!imageUrl) {
      Alert.alert('Erreur', 'Merci de sélectionner une image.');
      return;
    }

    if (imageUrl.startsWith('file://')) {
      const uploaded = await uploadImageToImgBB(imageUrl);
      if (!uploaded) {
        Alert.alert('Erreur', "Échec de l'upload de l'image.");
        return;
      }
      imageUrl = uploaded;
    }

    const body = {
      Titre_eve: titreEvent,
      Date_heure_eve_deb: date_heure_eve_deb,
      Date_heure_eve_fin: date_heure_eve_fin,
      Lieu_eve: lieu_eve,
      Description_eve: description_eve,
      photo_eve: imageUrl, // lien http
      nombre_place_eve: nb_place_eve,
      ID_type_eve: selectedType,
      mail_admin,
    };

    try {
      const response = await fetch(URL_Ajouter_Evenement, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Erreur réseau: ${response.statusText}`);

      const result = await response.json();
      Alert.alert("Succès", "Événement ajouté !");
      router.replace(`/JE_Evenements?refresh=${Date.now()}`); // ou vers une autre page
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'événement.");
    }
  };


  //Lier à la table Type_evenement
  useEffect(() => {
    fetch(URL_get_TypeEve)
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la récupération des types event');
        return response.json();
      })
      .then(data => {
        const types = data.type_evenement;
        setTypeEvent(types);
      });
  }, []);


  // États pour le menu déroulant
  const [selectedType, setSelectedType] = React.useState(null);

  return (
    // Pour fermer le clavier si on tape ailleurs
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS: padding, Android: height
      >
        {/* Barre supérieure */}
        <View style={styles.topBar} />

        {/* Bouton retour */}
        <TouchableOpacity onPress={() => {
          router.push('/JE_Evenements')
        }} style={styles.backButton}>
          <FontAwesome name="microphone" size={28} color="black" style={styles.backButtonIcon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>

        {/* Titre */}
        <View style={styles.titreWrapper}>
          <Text style={styles.titre}>Création d'un évènement</Text>
        </View>

        {/* Formulaire */}
        {/* Titre */}
        <ScrollView style={styles.scrollViewContent}>
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Titre de l'évènement</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TextInput style={styles.Input} placeholder="..." value={titreEvent} onChangeText={setTitreEvent} />
          </View>

          {/* Type event */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Type de l'évènement</Text>
          </View>
          <Picker selectedValue={selectedType} onValueChange={value => setSelectedType(value)} style={styles.picker}>
            <Picker.Item label="Sélectionner un type" value={null} />
            {type_event.map((event, index) => (
              <Picker.Item
                key={event.ID_type_eve ?? `event-${index}`}
                label={event.Nom_type_eve ?? "Type inconnu"}
                value={event.ID_type_eve ?? ""}
              />
            ))}
          </Picker>


          {/* Date de début*/}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Date de début</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TouchableOpacity onPress={() => setShowDateDebPicker(true)}>
              <Text style={styles.Input}>{date_eve_deb || 'Sélectionner une date'}</Text>
            </TouchableOpacity>
            {showDateDebPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="spinner"
                onChange={onChangeDateEveDeb}
              />
            )}
          </View>

          {/* Heure de début*/}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Heure de début</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TouchableOpacity onPress={() => setShowHeureDebPicker(true)}>
              <Text style={styles.Input}>{heure_eve_deb || 'Sélectionner une heure'}</Text>
            </TouchableOpacity>
            {showHeureDebPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display="spinner"
                onChange={onChangeHeureEveDeb}
              />
            )}
          </View>

          {/* Date de fin */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Date de fin</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TouchableOpacity onPress={() => setShowDateFinPicker(true)}>
              <Text style={styles.Input}>{date_eve_fin || 'Sélectionner une date'}</Text>
            </TouchableOpacity>
            {showDateFinPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="spinner"
                onChange={onChangeDateEveFin}
              />
            )}
          </View>

          {/* Heure de fin*/}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Heure de fin</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TouchableOpacity onPress={() => setShowHeureFinPicker(true)}>
              <Text style={styles.Input}>{heure_eve_fin || 'Sélectionner une heure'}</Text>
            </TouchableOpacity>
            {showHeureFinPicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display="spinner"
                onChange={onChangeHeureEveFin}
              />
            )}
          </View>

          {/* Lieu */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Lieu</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TextInput style={styles.Input} placeholder="..." value={lieu_eve} onChangeText={setLieuEve} />
          </View>

          {/* Description */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Description</Text>
          </View>
          <View style={[styles.bandeauInput, { minHeight: eventHeight + 10 }]}>
            <TextInput
              style={[styles.Input, { height: eventHeight }]}
              multiline
              onChangeText={setDescriptionEve}
              value={description_eve}
              onContentSizeChange={(e) => {
                setEventHeight(e.nativeEvent.contentSize.height);
              }}
              placeholder="..."
            />
          </View>

          {/* Nombre de places */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Nombre de places</Text>
          </View>
          <View style={styles.bandeauInput}>
            <TextInput style={styles.Input} placeholder="..." value={nb_place_eve} keyboardType="numeric" onChangeText={setNbPlaceEve} />
          </View>

          {/* Photo */}
          <View style={styles.bandeauSousTitre}>
            <Text style={styles.SousTitre}>Photo</Text>
          </View>
          <TouchableOpacity onPress={handlePickAndUpload}>
            {lien_photo_eve ? (
              <Image
                source={{ uri: lien_photo_eve }}
                style={{
                  width: screenWidth * 0.85,
                  height: screenHeight * 0.25,
                  borderRadius: 8,
                  marginBottom: 10,
                  marginLeft: 0.025 * screenWidth,
                  backgroundColor: '#ccc',
                }}
              />
            ) : (
              <View style={styles.bandeauInputPhoto}>
                <FontAwesome name="upload" size={28} color="black" />
              </View>
            )}
          </TouchableOpacity>

        </ScrollView>

        {/* Bouton plus */}
        <TouchableOpacity style={styles.Buttonplus} onPress={handleAjouterEvent}>
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
  bandeauInputPhoto: {
    backgroundColor: 'white',
    paddingVertical: 5,  //espace au dessus et en dessous de la zone de txt d'infos
    paddingHorizontal: 10,  // marge gauche + droite autour du logo
    marginLeft: 0.025 * screenWidth,
    alignSelf: 'flex-start', // pour coller à gauche (ne pas étirer)
    borderRadius: 10, // optionnel, pour arrondir les coins
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
});

export default Event;