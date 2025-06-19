import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState,useEffect } from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserContext } from "../../context/UserContext";
import { auth } from "../../firebaseConfig";





const IntervConnexion = () => {
  const [email, setEmail] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');
  const [MDPVisible, setMDPVisible] = useState<boolean>(false);
  const router=useRouter();
  const { refresh } = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null); // Pour gérer les erreurs

    useFocusEffect(
      React.useCallback(() => {
        // Réinitialise tous les champs quand la page est affichée
        setEmail('');
        setMotDePasse('');
        setMDPVisible(false);
        
      }, [])
    );


  
    const context = useContext(UserContext);

    if (!context) throw new Error("Connexion doit être utilisé dans un UserProvider");

    const {setUserMail} = context;
  
    // État pour stocker les études récupérées depuis l'API

  const handleLogin = async () => {
  const cleanedEmail = (email || '').trim().toLowerCase();
  const cleanedMDP = (motDePasse || '').trim();

  if (!cleanedEmail.includes("@")) {
    alert("Veuillez entrer un email valide.");
    return;
  }

  if (cleanedMDP === '') {
    alert("Veuillez entrer un mot de passe.");
    return;
  }



  try {

    const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, cleanedMDP);
    const token = await userCredential.user.getIdToken();

    console.log("Token JWT Firebase :", token);
    setUserMail(cleanedEmail);
    router.push('/Intervenant_Accueil');
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      alert("Aucun compte trouvé avec cet email.");
    } else if (error.code === 'auth/wrong-password') {
      alert("Mot de passe incorrect.");
    } else {
      alert("Erreur de connexion : " + error.message);
    }
  }
};

  
  return (
        <View style={{ flex: 1 }}>
          <View style={styles.Bar_du_haut}></View>
    <View style={styles.conteneur}>
      <View style={styles.cercle}>
        <Text style={styles.je}>Intervenant</Text>
      </View>

      <Text style={styles.titre}>Connexion à un compte existant</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.caseTexte}
        placeholder="username@example.fr"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Mot de passe</Text>
      <View style={styles.caseMDP}>
        <TextInput
          style={styles.zoneTexte}
          secureTextEntry={!MDPVisible}
          value={motDePasse}
          onChangeText={setMotDePasse}
        />
        <TouchableOpacity onPress={() => setMDPVisible(!MDPVisible)}>
          <Ionicons name={MDPVisible ? 'eye' : 'eye-off'} size={20} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.bouton} onPress= {handleLogin}>
        <Text style={styles.texteBouton}>Continuer</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => 
        {router.push('/Intervenant_Creation');
        console.log('Création compte')}}>
        <Text style={styles.lien}>Création d’un compte</Text>
      </TouchableOpacity>

      <View style={styles.bottomBar}>
        <TouchableOpacity
        onPress={() => 
        {router.push('/');
        console.log('Accueil_principale')}}>
          <FontAwesome name="user" size={28} color="black" style={styles.icon} />
        </TouchableOpacity>
      </View>
      
    </View>
  </View>

  );
};


const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#D2E3ED',
    alignItems: 'center',
    padding: 20,
  },
    Bar_du_haut: {
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.06,
    backgroundColor: 'white',
  },
  cercle: {
    width: 212,
    height: 100,
    borderRadius: 30,
    borderWidth: 8,
    borderColor: '#4B92B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  je: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 30,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  caseTexte: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '100%',
    fontSize: 16,
  },
  caseMDP: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    width: '100%',
    fontSize: 16,
    marginBottom: 10,
  },
  zoneTexte: {
    flex: 1,
    paddingVertical: 12,
  },
  bouton: {
    backgroundColor: '#4B92B7',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  texteBouton: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  lien: {
    marginTop: 20,
    textDecorationLine: 'underline',
    color: 'black',
    fontSize: 14,
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

export default IntervConnexion;
