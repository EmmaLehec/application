import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Platform } from 'react-native';


type TypeArt = {
  Article: boolean;
  router?: any;
}

type TypeEtu = {
  Etude: boolean;
  router?: any;
}

type TypeEve = {
  Event: boolean;
  router?: any;
}

const JE_accueil = () => {
  const [Article] = useState<boolean>(true);
  const [Event] = useState<boolean>(true);
  const [Etude] = useState<boolean>(true);
  const router = useRouter();
  return (

    <View style={styles.container}>

      {/* Barre supérieure */}
      <View style={styles.topBar} />

      {/* Titre "Études" + bouton retour */}
      <View style={styles.titreWrapper}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <FontAwesome name="user" size={20} color="black" style={styles.icon} />
          <AntDesign name="arrowleft" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollViewContent}>
        <Image
          source={require('../../assets/images/autres/Logo JE.png')}
          style={{ width: 150, height: 116, marginBottom: 30 }}
        />
        <View style={styles.boutonsContainer}>
          <BoutonEvent Event={Event} router={router} />
          <BoutonArticle Article={Article} router={router} />
          <BoutonEtude Etude={Etude} router={router} />
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
    </View>
  );
};

const BoutonArticle = ({ Article, router }: TypeArt) => (
  <TouchableOpacity style={styles.boutonArt}
    onPress={() => {
      router.push('/JE_Articles');
    }}>
    <View style={styles.boutonCont}>
      <Image source={require('../../assets/images/autres/Logo article.png')} style={[styles.imageBouton, { width: 93, height: 93, marginRight: 15 }]} />
      <Text style={styles.textBouton}>Articles</Text>
    </View>
  </TouchableOpacity>
);

const BoutonEvent = ({ Event, router }: TypeEve) => (
  <TouchableOpacity style={styles.boutonEv}
    onPress={() => {
      router.push('/JE_Evenements');
    }}>
    <View style={styles.boutonCont}>
      <Image source={require('../../assets/images/autres/Logo event.png')} style={[styles.imageBouton, { width: 111, height: 111 }]} />
      <Text style={styles.textBouton}>Evènements</Text>
    </View>
  </TouchableOpacity>
);

const BoutonEtude = ({ Etude, router }: TypeEtu) => (
  <TouchableOpacity style={styles.boutonEtu}
    onPress={() => {
      router.push('/JE_Etudes');
    }}
  >
    <View style={styles.boutonCont}>
      <Image source={require('../../assets/images/autres/Logo etudes.png')} style={[styles.imageBouton, { width: 103, height: 88, marginRight: 10 }]} />
      <Text style={styles.textBouton}>Etudes</Text>
    </View>
  </TouchableOpacity>
);


const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({

  // Conteneur principal
  container: {
    flex: 1,
    position: 'relative',
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

  // Contenu du ScrollView 
  scrollViewContainer: {
    alignItems: 'center',
  },
  scrollViewContent: {
    marginTop: height * 0.13,
    marginBottom: height * 0.12,
  },

  //Bouton etude/ Article et evenement

  boutonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },

  boutonEv: {
    backgroundColor: '#4B92B7',
    height: 121,
    width: 288,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  boutonArt: {
    backgroundColor: '#437E9B',
    height: 121,
    width: 288,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,        // petit espace bord gauche
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  boutonEtu: {
    backgroundColor: '#376887',
    height: 121,
    width: 288,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,        // petit espace bord gauche
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textBouton: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  boutonCont: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBouton: {
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
  // Container des 3 icônes dans la barre du bas
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '50%',
  },
});

export default JE_accueil;
