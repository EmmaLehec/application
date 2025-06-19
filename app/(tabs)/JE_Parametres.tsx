import { FontAwesome, AntDesign } from '@expo/vector-icons'; // Import d’icônes
import { useRouter } from 'expo-router'; //Import pour naviguer entre pages
import React, { useState,useContext  } from 'react';
import { Dimensions, Image,  Modal, StyleSheet, Text, TouchableOpacity,TextInput, View } from 'react-native';

//Dimensions écran
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;


const Parametres = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Barre supérieure */}
      <View style={styles.topBar} />

      {/* Titre et logo */}
      <View style={styles.titreWrapper}>
        <Text style={styles.titre}>Paramètres</Text>
        <Image source={require('../../assets/images/Logo_EPF_Projet.png')} style={styles.logo_EPF_Projet} />
      </View>

      {/* Compte */}
      <View style={[styles.bandeauSousTitre, { marginTop: 300 }]}>
        <Text style={styles.SousTitre}>Compte</Text>
      </View>

      {/* Bouton Modifier le profil */}
      <TouchableOpacity onPress={() => router.push('/JE_Modifier_le_profil')} style={[styles.bouton, styles.boutonBottomBorder]}>
        <View style={styles.contenuBouton}>
          <FontAwesome name="user-o" size={28} color="black" />
          <Text style={styles.txtBouton}>Modifier le profil</Text>
          <FontAwesome name="angle-right" size={28} color="black" />
        </View>
      </TouchableOpacity>

      {/* Barre inférieure */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <FontAwesome name="user" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/JE_Accueil')}>
          <FontAwesome name="home" size={28} color="black"  />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/JE_Parametres')}>
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

 //Titre + logo
  titreWrapper: {
    position: 'absolute',
    top: 100,
    alignItems: 'center',         //  centre verticalement
    alignSelf: 'center',        //  centre horizontalement       
  },
  logo_EPF_Projet: {
    height: 100,
    resizeMode: 'contain',
  },
  titre: {
    fontSize: 34,
    fontWeight: 'bold',
  },

  //Sous titre
  bandeauSousTitre:{
    alignItems: 'flex-start',
    paddingLeft: screenWidth * 0.05,
    marginBottom: 10, //espace après le bandeau
  },
  SousTitre:{
    fontSize: 26,
    fontWeight: '600',
  },

  //Bouton
   bouton: {
    backgroundColor: '#F1EBEB',
    width: screenWidth * 0.9,
    borderRadius: 4,
    alignSelf: 'center', //centre le bouton horizontalement dans la page
    paddingVertical: 10, // espace en haut et en bas
    elevation: 10, // ombre Android
    shadowColor: '#000', // ombre IOS
    shadowOffset: { width: 0, height: 6 },  // ombre IOS
    shadowOpacity: 0.3, // ombre IOS
    shadowRadius: 6, // ombre IOS
  },
  contenuBouton: {
    flexDirection: 'row',
    alignItems: 'center',       // alignement vertical 
    paddingHorizontal: 15,      // marge à gauche/droite
  },
  txtBouton: {
    fontSize: 26,
    fontWeight: '600',
    flex: 1,                    // prend tout l'espace dispo entre les deux icônes
    textAlign: 'left',
    marginLeft: 10,
  },
  boutonBottomBorder: {
  borderBottomWidth: 1,          // épaisseur de la ligne
  borderBottomColor: '#CAC4D0',
},

  // Modal
  fondGris: {
    flex: 1,
    backgroundColor: '#56565670',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 25,
    width: screenWidth * 0.8,
    elevation: 20,
  },
  modalText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  btn: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#767676',
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },

  //Barre du bas
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor :'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',           // place les icônes en ligne
    justifyContent: 'space-around', // espace régulier entre les 3 icônes
    alignItems: 'center',           // aligne verticalement au centre
  },


});

export default Parametres;
