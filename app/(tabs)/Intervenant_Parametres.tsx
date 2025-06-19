import { FontAwesome, AntDesign } from '@expo/vector-icons'; // Import d’icônes
import { useRouter } from 'expo-router'; //Import pour naviguer entre pages
import React, { useState, useContext } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, TextInput, View } from 'react-native';
import { UserContext } from "../../context/UserContext";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const IP_LOCAL = '10.226.42.55';  // Remplace par ton IP locale
const URL_Supprimer_Uti = `http://${IP_LOCAL}:5001/application-5c3f8/us-central1/supprimerUtilisateur`;

//Dimensions écran
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;


const Parametres = () => {
  const router = useRouter();
  const [modalConfirmationVisible, setModalConfirmationVisible] = useState(false);
  const [modalMdpVisible, setModalMdpVisible] = useState(false);
  const [motDePasseEntre, setMotDePasse] = useState('');
  const context = useContext(UserContext);
  if (!context) throw new Error("La page Parametres doit être utilisé dans un UserProvider");
  const { userMail } = context;

  // Ouvre le modal1
  const handleDelete = () => {
    setModalConfirmationVisible(true);
  };

  // Ferme le modal1 (bouton Non)
  const handleNo = () => {
    setModalConfirmationVisible(false);
  };

  //Ferme le modal1 et ouvre le modal2 (bouton Oui)
  const handleYes = () => {
    setModalConfirmationVisible(false);        // Ferme le 1er modal
    setModalMdpVisible(true);      // Ouvre le 2nd
  };

  //Supprime le profil
  const validerSuppression = async () => {
    if (!motDePasseEntre.trim()) return alert("Mot de passe ?");
    if (!userMail) return alert("Email introuvable.");
    try {
 
    const user = auth.currentUser!;
    const cred = EmailAuthProvider.credential(userMail, motDePasseEntre);
    await reauthenticateWithCredential(user, cred);


    const res = await fetch(URL_Supprimer_Uti, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Mail_uti: userMail, Mdp_uti_entre: motDePasseEntre }),
    });
    const db = await res.json();
    if (!res.ok || !db.success) throw new Error(db.message);

    /** 4️⃣  Bye ! */
    alert("Compte définitivement supprimé.");
    router.push("/");
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Erreur lors de la suppression.");
  }
  };

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
      <TouchableOpacity onPress={() => router.push('/Intervenant_Modifier_le_profil')} style={[styles.bouton, styles.boutonBottomBorder]}>
        <View style={styles.contenuBouton}>
          <FontAwesome name="user-o" size={28} color="black" />
          <Text style={styles.txtBouton}>Modifier le profil</Text>
          <FontAwesome name="angle-right" size={28} color="black" />
        </View>
      </TouchableOpacity>

      {/* Bouton Supprimer le profil */}
      <TouchableOpacity onPress={handleDelete} style={styles.bouton}>
        <View style={styles.contenuBouton}>
          <FontAwesome name="trash-o" size={28} color="black" />
          <Text style={styles.txtBouton}>Supprimer le profil</Text>
        </View>
      </TouchableOpacity>

      {/* Modal de confirmation suppression */}
      <Modal
        visible={modalConfirmationVisible}
        transparent={true}
        onRequestClose={handleNo}
      >
        <View style={styles.fondGris}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Êtes-vous sûr(e) de vouloir supprimer ce profil ?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, { marginRight: 15 }]} onPress={handleYes}>
                <Text style={styles.btnText}>Oui</Text>
                <FontAwesome name="frown-o" size={28} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleNo}>
                <Text style={styles.btnText}>Non</Text>
                <FontAwesome name="smile-o" size={28} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de mdp entré */}
      <Modal
        visible={modalMdpVisible}
        transparent={true}
        onRequestClose={() => setModalMdpVisible(false)}
      >
        <View style={styles.fondGris}>
          <View style={styles.modalContainer}>

            {/* Croix pour fermer */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 10, right: 10 }}
              onPress={() => { setModalMdpVisible(false); setMotDePasse(''); }}
            >
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.modalText}>Entrez votre mot de passe pour confirmer :</Text>

            {/* Champ texte mot de passe */}
            <View style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 8,
              marginBottom: 20,
            }}>
              <TextInput
                placeholder="Mot de passe"
                secureTextEntry
                value={motDePasseEntre}
                onChangeText={setMotDePasse}
                style={{ fontSize: 18 }}
              />
            </View>

            {/* Bouton Valider */}
            <TouchableOpacity onPress={validerSuppression} style={{ alignSelf: 'center', marginTop: 10 }}>
              <Text style={{ color: '#007BFF', fontSize: 18, fontWeight: '600' }}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Données */}
      <View style={[styles.bandeauSousTitre, { marginTop: 20 }]}>
        <Text style={styles.SousTitre}>Données</Text>
      </View>

      {/* Bouton Historique */}
      <TouchableOpacity onPress={() => router.push('/Intervenant_Historique')} style={[styles.bouton, styles.boutonBottomBorder]}>
        <View style={styles.contenuBouton}>
          <AntDesign name="clockcircleo" size={28} color="black" />
          <Text style={styles.txtBouton}>Historique</Text>
          <FontAwesome name="angle-right" size={28} color="black" />
        </View>
      </TouchableOpacity>

      {/* Bouton Recrutement */}
      <TouchableOpacity onPress={() => router.push('/Intervenant_Recrutement')} style={styles.bouton}>
        <View style={styles.contenuBouton}>
          <AntDesign name="search1" size={28} color="black" />
          <Text style={styles.txtBouton}>Recrutement</Text>
          <FontAwesome name="angle-right" size={28} color="black" />
        </View>
      </TouchableOpacity>

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
  bandeauSousTitre: {
    alignItems: 'flex-start',
    paddingLeft: screenWidth * 0.05,
    marginBottom: 10, //espace après le bandeau
  },
  SousTitre: {
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',           // place les icônes en ligne
    justifyContent: 'space-around', // espace régulier entre les 3 icônes
    alignItems: 'center',           // aligne verticalement au centre
  },


});

export default Parametres;
