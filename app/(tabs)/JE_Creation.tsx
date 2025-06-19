import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useContext, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../../context/UserContext';
import { auth } from '../../firebaseConfig'; // ou ton chemin exact


const IP_LOCAL = '10.15.137.55';
const URL_UTILISATEUR = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/getUtilisateur`;

const PageCreaJE = () => {
  const [email, setEmail] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');
  const [confirmMDP, setConfirmMDP] = useState<string>('');
  const [MDPVisible, setMDPVisible] = useState<boolean>(false);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const router=useRouter();
  const context = useContext(UserContext);
  if (!context) throw new Error("UserContext must be used within a UserProvider");

  
      useFocusEffect(
        React.useCallback(() => {
          // Réinitialise tous les champs quand la page est affichée
          setEmail('');
          setMotDePasse('');
          setMDPVisible(false);
          setConfirmMDP('');
          setConfirmVisible(false);
        }, [])
      );
  

const { setMailCreation, setMdpCreation } = context;

const handlecontinuer = async () => {
  if (!email || !motDePasse || !confirmMDP) {
    alert('Merci de remplir tous les champs.');
    return;
  }

  if (!email.includes('@')) {
    alert("L'adresse e-mail n'est pas valide.");
    return;
  }

  if (motDePasse.length<6) {
    alert('Veuillez rentrer un mot de passe supérieur à 6 caractères');
    return;
  }
  
  if (motDePasse !== confirmMDP) {
    alert('Les mots de passe ne correspondent pas.');
    return;
  }

  try {
    const res = await fetch(URL_UTILISATEUR);
    if (!res.ok) throw new Error('Erreur réseau');
    const data = await res.json();

    const emailExiste = data.utilisateur.some(
      (u: any) => u.Mail_uti.toLowerCase() === email.toLowerCase()
    );

    if (emailExiste) {
      alert('Cet email est déjà utilisé.');
      return;
    }
  } catch (err) {
    console.error(err);
    alert('Impossible de vérifier l’email, réessaie plus tard.');
    return;
  }

  try {

    await createUserWithEmailAndPassword(auth, email, motDePasse);
  } catch (error: any) {
    console.error('Erreur création Firebase Auth:', error);
    alert(`Erreur lors de la création du compte : ${error.message}`);
    return;
  }

  // Passage des infos dans le contexte
  setMailCreation(email);
  setMdpCreation(motDePasse);

  router.push('/JE_Creation_bis');
};


  return (
    <View style={{ flex: 1 }}>
      <View style={styles.Bar_du_haut}></View>
      <ScrollView contentContainerStyle={styles.conteneur}>
        <View style={styles.cercle}>
          <Text style={styles.je}>JE</Text>
        </View>

        <Text style={styles.titre}>Création d’un compte</Text>

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

        <Text style={styles.label}>Confirmation du mot de passe</Text>
        <View style={styles.caseMDP}>
          <TextInput
            style={styles.zoneTexte}
            secureTextEntry={!confirmVisible}
            value={confirmMDP}
            onChangeText={setConfirmMDP}
          />
          <TouchableOpacity onPress={() => setConfirmVisible(!confirmVisible)}>
            <Ionicons name={confirmVisible ? 'eye' : 'eye-off'} size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bouton}
        onPress={handlecontinuer}>     
          <Text style={styles.texteBouton}>Continuer</Text>
        </TouchableOpacity>

        <TouchableOpacity
        onPress={() => 
        {router.push('/JE_Connexion');}}>
          <Text style={styles.lien}>Connexion à un compte existant</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
        onPress={() => 
        {router.push('/');}}>
          <FontAwesome name="user" size={28} color="black" style={styles.icon}  />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');



const styles = StyleSheet.create({
   conteneur: {
    flexGrow: 1,
    backgroundColor: '#D2E3ED',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100, // espace pour la bottomBar
  },
    Bar_du_haut: {
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.06,
    backgroundColor: 'white',
  },
      icon: {
    marginTop: height * 0.015,
  },

  cercle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#4B92B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
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
    alignSelf: 'flex-start',
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
});

export default PageCreaJE ;
