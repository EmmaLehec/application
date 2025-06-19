import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image,Dimensions,Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TextInput, Modal } from 'react-native';



type Typo = {
  JE: boolean;
  Intervenant: boolean;
  router?: any;
  handleAdmin?: () => void;
};



const Accueil_Principal = () => {
  const [JE] = useState<boolean>(true);
  const [Intervenant] = useState<boolean>(true);
  const router = useRouter();

   // états pour le mot de passe
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const handleAdmin = () => {
    setShowPwdModal(true);        // ⬅️ ouvre le modal
  };



  return (
        <View style={{ flex: 1 }}>
      {/* Barre supérieure */}
             <View style={styles.topBar} />
    
    <View style={styles.container}>
      <Text style={styles.titre}>Bienvenue sur l’appli de la JE</Text>
      <Image
        source={require('../../assets/images/autres/Logo_blog.png')}
        style={{ width: 167, height: 25, marginTop: 80, marginBottom: 80 }}
      />
      <View style={styles.boutonsContainer}>
  <BoutonJE JE={JE} router={router} Intervenant={false} handleAdmin={handleAdmin} />
  <BoutonInterv Intervenant={Intervenant} router={router} JE={false} />
</View>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => {
            router.push('/');
           
          }}
        >
          <FontAwesome name="user" size={28} color="black" style={styles.icon}/>
        </TouchableOpacity>
      </View>
    </View>

    <Modal
  visible={showPwdModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowPwdModal(false)}
>
  <View style={modalStyles.overlay}>
    <View style={modalStyles.box}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
        Mot de passe admin
      </Text>

      <TextInput
        value={passwordInput}
        onChangeText={setPasswordInput}
        placeholder=""
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: '#aaa',
          borderRadius: 5,
          padding: 8,
          marginBottom: 15,
        }}
      />

      <TouchableOpacity
        onPress={() => {
          if (passwordInput === 'dragonfly') {
            setShowPwdModal(false);
            setPasswordInput('');
            router.push('/JE_Creation');
          } else {
            Alert.alert('Erreur', 'Mot de passe incorrect.');
            setPasswordInput('');
          }
        }}
        style={{
          backgroundColor: '#4B92B7',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
          alignSelf: 'flex-end',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );

};
const BoutonJE = ({ JE, router, Intervenant, handleAdmin }: Typo) => (
  <TouchableOpacity
    style={styles.boutonJE}
    onPress={handleAdmin} 
  >
    <Image source={require('../../assets/images/autres/Logo JE.png')} style={{ width: 150, height: 116 }} />
    <Text style={styles.textBoutonJE}>JE</Text>
  </TouchableOpacity>
);


const BoutonInterv = ({ Intervenant, router, JE }: Typo) => (
  <TouchableOpacity
    style={styles.boutonIntervenant}
      onPress={() => {
        router.push('/Intervenant_Creation');
      }}
  >
    <Image source={require('../../assets/images/autres/Bonhomme.png')} style={{ width: 108, height: 127 }} />
    <Text style={styles.textBoutonInterv}>Intervenant</Text>
  </TouchableOpacity>
  
);

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
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
  titre: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 100,
  },
  boutonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  boutonJE: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    height: 170,
    width: 170,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 10,
  },
  boutonIntervenant: {
    backgroundColor: '#4B92B7',
    alignItems: 'center',
    justifyContent: 'center',
    height: 170,
    width: 170,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 10,
  },
  textBoutonJE: {
    color: '#4B92B7',
    fontSize: 20,
  },
  textBoutonInterv: {
    color: '#FFFFFF',
    fontSize: 20,
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
    alignItems:'center',
  },
      icon: {
    marginTop: height * 0.015,
  },

});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
});



export default Accueil_Principal;
