import * as functions from "firebase-functions";
import * as mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import * as admin from 'firebase-admin';

// Initialiser Firebase Admin
admin.initializeApp();

// Charger les variables d'environnement
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const getUtilisateur = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT Mail_uti, Nom_uti, Prenom_uti, Adresse_uti, Date_naissance, Lien_eportfolio_uti, Lien_github_uti, Telephone_uti,Lien_pdp_uti

      FROM utilisateur
    `);
    // Renvoie l’ensemble des etudes sous forme d’un tableau JSON
    res.status(200).json({ utilisateur: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
   }
});

export const getAdmin = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT mail_admin,nom_admin,prenom_admin, Telephone_admin, Lien_pdp_admin
      FROM admin
    `);
    // Renvoie l’ensemble des etudes sous forme d’un tableau JSON
    res.status(200).json({ admin: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
   }
});

export const updateStatutPostuler = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { mail, id_etude, statut } = req.body;

  if (!mail || !id_etude || !statut) {
    res.status(400).send("Paramètres manquants");
    return;
  }

  try {
    await pool.query(
      "UPDATE postuler SET Statut = ? WHERE Mail_uti = ? AND ID_etude = ?",
      [statut, mail, id_etude]
    );
    res.status(200).send("Statut mis à jour !");
  } catch (error) {
    console.error("Erreur MySQL :", error);
    res.status(500).send("Erreur serveur");
  }
  
});

export const getEvents = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT ID_eve, Titre_eve, Date_heure_eve_deb, Date_heure_eve_fin, Lieu_eve, Description_eve, photo_eve, nombre_place_eve, ID_type_eve, mail_admin 
      FROM Evenement
    `);
    // Renvoie l’ensemble des evenement sous forme d’un tableau JSON
    res.status(200).json({ evenement: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
   }
});

export const getInscrire = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT ID_eve, Mail_uti
      FROM inscrire
    `);
    // Renvoie l’ensemble des evenement sous forme d’un tableau JSON
    res.status(200).json({ inscrire: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
   }
});

export const getType_eve = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT ID_type_eve, Nom_type_eve
      FROM Type_evenement
    `);
    
    res.status(200).json({ type_evenement: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
   }
});

export const ajouterEvenement = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Méthode non autorisée");
    return;
  }
  const {
  Titre_eve,
  Date_heure_eve_deb,
  Date_heure_eve_fin,
  Lieu_eve, 
  Description_eve,
  photo_eve,
  nombre_place_eve,
  ID_type_eve,
  mail_admin } = req.body;

  if (!Titre_eve || !Date_heure_eve_deb || !Date_heure_eve_fin || !Lieu_eve || !Description_eve || !photo_eve || !nombre_place_eve || !ID_type_eve || !mail_admin) {
    res.status(400).send("Tous les champs sont obligatoires");
    return;
  }
  
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM Evenement") as [any[], any];
    const count = rows[0].count + 1;
    const ID_eve_cree = `EV${String(count).padStart(3, "0")}`;
    await pool.query(
      `INSERT INTO Evenement
       (ID_eve, Titre_eve, Date_heure_eve_deb, Date_heure_eve_fin, Lieu_eve, Description_eve, photo_eve, nombre_place_eve, ID_type_eve, mail_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ID_eve_cree, Titre_eve.trim(), Date_heure_eve_deb.trim(), Date_heure_eve_fin.trim(), Lieu_eve.trim(), Description_eve.trim(), photo_eve.trim(), nombre_place_eve.trim(), ID_type_eve, mail_admin.trim()]
    );
    res.status(200).send({ success: true, ID_eve_cree, message: "Événement ajouté avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'événement :", error);
    res.status(500).send("Erreur serveur");
  }
});

export const ajouterInscription = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { mail_uti, id_eve } = req.body;

  if (!mail_uti || !id_eve) {
    res.status(400).send("Paramètres manquants");
    return;
  }

  try {
    await pool.query(
      "INSERT INTO inscrire (ID_eve, Mail_uti) VALUES (?, ?)",
      [id_eve, mail_uti]
    );
    res.status(200).send({ success: true, message: "Inscription enregistrée." });
  } catch (error) {
    console.error("Erreur MySQL :", error);
    res.status(500).send({ success: false, message: "Erreur serveur." });
  }
});

export const getDomainesArticles = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT ID_domaine_art, Nom_domaine_art 
      FROM Domaine_article
    `);

    // Renvoie l’ensemble des domaines d'articles sous forme d’un tableau JSON
    res.status(200).json({ domaines_articles: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
  }
});

export const getFairePartie = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT ID_domaine_art, ID_art 
      FROM Faire_partie
    `);

    // Renvoie l’ensemble des liens domaines d'articles / articles sous forme d’un tableau JSON
    res.status(200).json({ faire_partie: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
  }
});

export const getArticles = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT ID_art, Titre_art, Date_publication_art, Date_maj_art, Auteur_art, Txt, mail_admin 
      FROM Article
    `);

    // Renvoie l’ensemble des articles sous forme d’un tableau JSON
    res.status(200).json({ articles: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
  }
});

export const getEtudes = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT ID_etude, Titre_etude, Description_etude, Date_heure_debut_etude, Date_heure_fin_etude, Remuneration, mail_admin 
      FROM Etude
    `);
    // Renvoie l’ensemble des etudes sous forme d’un tableau JSON
    res.status(200).json({ etudes: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
  }
  });

export const getPostuler = functions.https.onRequest(async (req, res) => {
  try {
    // Récupère toutes les colonnes que tu as listées
    const [rows] = await pool.query(`
      SELECT ID_etude, Mail_uti, Date_postulation, Statut
      FROM postuler
    `);
    // Renvoie l’ensemble des etudes sous forme d’un tableau JSON
    res.status(200).json({ postuler: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
   }
});

export const get1Admin = functions.https.onRequest(async (req, res) => {
  try {
    // Vérifie que c’est une requête POST
    if (req.method !== "POST") {
      res.status(405).send("Méthode non autorisée");
      return;
    }
    const { mail_admin} = req.body;
  // Vérifie que tous les champs obligatoires sont là
  if ( !mail_admin ) {
    res.status(400).send("Tous les champs sont obligatoires");
    return;
  }

    // Récupère  les infos de 1 admin
    const [rows] = await pool.query(
        `SELECT nom_admin, prenom_admin, Telephone_admin, Lien_pdp_admin FROM Admin WHERE mail_admin = ?`,
        [mail_admin.trim()]
      );
      if ((rows as any).length === 0) {
        res.status(404).json({ success: false, message: "Admin non trouvé" });
        return;
      }
    // Renvoie l’ensemble des infos de 1 admin sous forme d’un tableau JSON
    res.status(200).json({ admin: rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
  }
  });

export const get1Uti = functions.https.onRequest(async (req, res) => {
  try {
    // Vérifie que c’est une requête POST
    if (req.method !== "POST") {
      res.status(405).send("Méthode non autorisée");
      return;
    }
    const { Mail_uti} = req.body;
  // Vérifie que tous les champs obligatoires sont là
  if ( !Mail_uti ) {
    res.status(400).send("Tous les champs sont obligatoires");
    return;
  }

    // Récupère  les infos de 1 admin
    const [rows] = await pool.query(
        `SELECT Nom_uti, Prenom_uti, Date_naissance, Telephone_uti, Adresse_uti, Lien_eportfolio_uti, Lien_github_uti, Lien_pdp_uti FROM Utilisateur WHERE Mail_uti = ?`,
        [Mail_uti.trim()]
      );
      if ((rows as any).length === 0) {
        res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        return;
      }
    // Renvoie l’ensemble des infos de 1 utilisateur sous forme d’un tableau JSON
    res.status(200).json({ utilisateur : rows });
  } catch (err) {
    console.error("Erreur MySQL", err);
    res.status(500).send("Erreur MySQL");
  }
  });

export const updateAdmin = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { nom_admin_up, prenom_admin_up, telephone_admin_up, lien_pdp_admin_up, mail_admin } = req.body;

  if (!nom_admin_up || !prenom_admin_up || !telephone_admin_up || !mail_admin) {
    res.status(400).send("Paramètres manquants");
    return;
  }

  try {
    await pool.query(
      "UPDATE Admin SET nom_admin = ?, prenom_admin = ?, Telephone_admin = ?, Lien_pdp_admin = ? WHERE mail_admin = ?",
      [
        nom_admin_up, 
        prenom_admin_up, 
        telephone_admin_up,
        lien_pdp_admin_up,
        mail_admin
      ]
    );
    res.status(200).send("Profil admin mis à jour !");
  } catch (error) {
    console.error("Erreur MySQL :", error);
    res.status(500).send("Erreur serveur");
  }
  
});

export const updateUti = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { Nom_uti_up, Prenom_uti_up, Date_naissance_up, Telephone_uti_up, Adresse_uti_up, Lien_eportfolio_uti_up, Lien_github_uti_up, Lien_pdp_uti_up, Mail_uti } = req.body;

  if (!Nom_uti_up || !Prenom_uti_up || !Date_naissance_up || !Telephone_uti_up || !Adresse_uti_up || !Mail_uti) {
    res.status(400).send("Paramètres manquants");
    return;
  }

  try {
    await pool.query(
      "UPDATE Utilisateur SET Nom_uti = ?, Prenom_uti = ?, Date_naissance = ?, Telephone_uti = ?, Adresse_uti = ?, Lien_eportfolio_uti = ?, Lien_github_uti = ?, Lien_pdp_uti = ? WHERE Mail_uti = ?",
      [
        Nom_uti_up, 
        Prenom_uti_up, 
        Date_naissance_up,
        Telephone_uti_up,
        Adresse_uti_up,
        Lien_eportfolio_uti_up,
        Lien_github_uti_up,
        Lien_pdp_uti_up,
        Mail_uti
      ]
    );
    res.status(200).send("Profil utilisateur mis à jour !");
  } catch (error) {
    console.error("Erreur MySQL :", error);
    res.status(500).send("Erreur serveur");
  }
  
});

export const ajouterArticleComplet = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Méthode non autorisée");
    return;
  }

  const {
    Titre_art,
    Date_publication_art,
    Date_maj_art,
    Auteur_art,
    Txt,
    mail_admin,
    ID_domaine_art
  } = req.body;

  // Vérifie que tous les champs obligatoires sont là
  if (
    !Titre_art || !Date_publication_art ||
    !Date_maj_art || !Auteur_art || !Txt || !ID_domaine_art
  ) {
    res.status(400).send("Tous les champs sont obligatoires");
    return;
  }

  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM Article") as [any[], any];
  const count = rows[0].count + 1;


  // Étape 1 : générer l'ID_article
  const ID_art_genere = `A${String(count).padStart(3, "0")}`;
  // Étape 2 : insérer l'article
    await pool.query(
      `INSERT INTO Article
      (ID_art, Titre_art, Date_publication_art, Date_maj_art, Auteur_art, Txt, mail_admin)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ID_art_genere,
        Titre_art.trim(),
        Date_publication_art.trim(),
        Date_maj_art,
        Auteur_art,
        Txt.trim(),
        mail_admin.trim()
      ]
    );
    // Étape 3 : insérer dans faire_partie (relation domaine-article)
    await pool.query(
      `INSERT INTO faire_partie
      (ID_domaine_art, ID_art)
      VALUES (?, ?)`,
      [
        ID_domaine_art,
        ID_art_genere
      ]
    );
  res.status(200).send({ success: true, ID_art_genere, ID_domaine_art, message: "Article et relation domaine-article ajoutés avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'article ou de la relation :", error);
    res.status(500).send("Erreur serveur");
  }
});

export const ajouterDomaineArticle = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Méthode non autorisée");
    return;
  }

  const {
    Nom_domaine_art
  } = req.body;

  // Vérifie que tous les champs obligatoires sont là
  if (
    !Nom_domaine_art
  ) {
    res.status(400).send("Tous les champs sont obligatoires");
    return;
  }

  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM Domaine_article") as [any[], any];
  const count = rows[0].count + 1;


  // Étape 1 : générer l'ID_domaine_art
  const ID_domaine_art_genere = `D${String(count).padStart(2, "0")}`;

  // Étape 2 : insérer dans Domaine_article
    await pool.query(
      `INSERT INTO Domaine_article
      (ID_domaine_art, Nom_domaine_art)
      VALUES (?, ?)`,
      [
        ID_domaine_art_genere,
        Nom_domaine_art.trim()
      ]
    );

  res.status(200).send({ success: true, ID_domaine_art_genere, message: "Domaine d'article ajouté avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout du domaine d'article :", error);
    res.status(500).send("Erreur serveur");
  }
});

export const ajouterEtude = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Méthode non autorisée");
    return;
  }

  const {
    Titre_etude,
    Description_etude,
    Date_heure_debut_etude,
    Date_heure_fin_etude,
    Remuneration,
    mail_admin
  } = req.body;

  // Vérifie que tous les champs obligatoires sont là
  if (
     !Titre_etude || !Description_etude ||
    !Date_heure_debut_etude || !Date_heure_fin_etude ||
    !Remuneration || !mail_admin
  ) {
    res.status(400).send("Tous les champs sont obligatoires");
    return;
  }

try {
  // Étape 1 : compter les études existantes
  const [rows] = await pool.query("SELECT COUNT(*) as count FROM Etude") as [any[], any];
  const count = rows[0].count + 1;


  // Étape 2 : générer l'ID_etude
  const ID_etude = `ET${String(count).padStart(3, "0")}`;

  // Étape 3 : insérer dans la base
  await pool.query(
    `INSERT INTO Etude
     (ID_etude, Titre_etude, Description_etude, Date_heure_debut_etude, Date_heure_fin_etude, Remuneration, mail_admin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      ID_etude, // ← ici tu ajoutes l'ID que tu viens de générer
      Titre_etude.trim(),
      Description_etude.trim(),
      Date_heure_debut_etude,
      Date_heure_fin_etude,
      Remuneration.trim(),
      mail_admin.trim()
    ]
  );

  // Étape 4 : envoyer une réponse avec l'ID généré (utile si tu veux l’afficher dans le front)
  res.status(200).send({ success: true, ID_etude, message: "Étude ajoutée avec succès" });

} catch (error) {
  console.error("Erreur lors de l'ajout de l'étude :", error);
  res.status(500).send("Erreur serveur");
}

});

export const ajouterPostuler = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { mail, id_etude } = req.body;

  if (!mail || !id_etude) {
    res.status(400).send("Paramètres manquants");
    return;
  }

  try {
    await pool.query(
      "INSERT INTO postuler (ID_etude, Mail_uti, Date_postulation, Statut) VALUES (?, ?, ?, 'En attente')",
      [id_etude, mail, new Date()]
    );
    res.status(200).send({ success: true, message: "Postulation enregistrée." });
  } catch (error) {
    console.error("Erreur MySQL :", error);
    res.status(500).send({ success: false, message: "Erreur serveur." });
  }
});

export const ajouterAdmin = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Méthode non autorisée");
    return;
  }

  const {
    mail_admin, 
    nom_admin,
    prenom_admin,
    Telephone_admin,
    Lien_pdp_admin  
  } = req.body;

  // Vérifie que tous les champs obligatoires sont là
  if (
     !mail_admin || !nom_admin || !prenom_admin || !Telephone_admin 
  ) {
    res.status(400).send("Tous les champs sont obligatoires");
    return;
  }

try {
  await pool.query(
    `INSERT INTO admin
     (mail_admin,nom_admin,prenom_admin, Telephone_admin, Lien_pdp_admin)
     VALUES (?, ?, ?, ?, ?)`,
    [
    mail_admin.trim(),
    nom_admin.trim(),
    prenom_admin.trim(),
    Telephone_admin.trim(), 
    Lien_pdp_admin      
    ]
  );

  res.status(200).send({ success: true, mail_admin, message: "Admin ajoutée avec succès" });
} catch (error) {
  console.error("Erreur lors de l'ajout de l'admin :", error);
  res.status(500).send("Erreur serveur");
}

});

export const updateArticle = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { Txt, ID_art} = req.body;
  const ajd = new Date();

  if (!Txt) {
    res.status(400).send("Paramètres manquants");
    return;
  }

  try {
    await pool.query(
      "UPDATE Article SET Txt = ?, Date_maj_art = ? WHERE ID_art = ?",
      [
        Txt, 
        ajd, 
        ID_art
      ]
    );
    res.status(200).send("Article mis à jour !");
  } catch (error) {
    console.error("Erreur MySQL :", error);
    res.status(500).send("Erreur serveur");
  }
  
});

export const ajouterUtilisateur = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Méthode non autorisée");
    return;
  }

  const {
    Mail_uti,
    Nom_uti,
    Prenom_uti,
    Adresse_uti,
    Date_naissance,
    Lien_eportfolio_uti,
    Lien_github_uti,
    Telephone_uti,
    Lien_pdp_uti
  } = req.body;

  // Vérifie que tous les champs obligatoires sont là
  if (
     !Mail_uti || !Nom_uti || !Prenom_uti || !Adresse_uti || !Date_naissance || !Telephone_uti
  ) {
    res.status(400).send("Tous les champs sont obligatoires");
    return;
  }

try {
  await pool.query(
    `INSERT INTO utilisateur
     (Mail_uti,Nom_uti,Prenom_uti,Adresse_uti,Date_naissance,Lien_eportfolio_uti,Lien_github_uti,Telephone_uti,Lien_pdp_uti)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
    Mail_uti.trim(),
    Nom_uti.trim(),
    Prenom_uti.trim(),
    Adresse_uti.trim(),
    Date_naissance.trim(),
    Lien_eportfolio_uti ? Lien_eportfolio_uti.trim() : null,
    Lien_github_uti ? Lien_github_uti.trim() : null,
    Telephone_uti.trim(),
    Lien_pdp_uti ? Lien_pdp_uti.trim() : null
    ]
  );

  res.status(200).send({ success: true, Mail_uti, message: "Utilisateur ajoutée avec succès" });
} catch (error) {
  console.error("Erreur lors de l'ajout de l'utilisateur :", error);
  res.status(500).send("Erreur serveur");
}

});

export const supprimerUtilisateur = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, message: "Méthode non autorisée" });
      return;
    }

    const { Mail_uti } = req.body;

    if (!Mail_uti) {
      res.status(400).json({ success: false, message: "Tous les champs sont obligatoires" });
      return;
    }

    // Étape 1 : Récupérer l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(Mail_uti.trim());
    const uid = userRecord.uid;

    // Étape 2 : Supprimer les données dans la bdd
    await pool.query(`DELETE FROM Consulter WHERE Mail_uti = ?`, [Mail_uti.trim()]);
    await pool.query(`DELETE FROM Postuler WHERE Mail_uti = ?`, [Mail_uti.trim()]);
    await pool.query(`DELETE FROM Inscrire WHERE Mail_uti = ?`, [Mail_uti.trim()]);
    await pool.query(`DELETE FROM Utilisateur WHERE Mail_uti = ?`, [Mail_uti.trim()]);

    // Étape 3 : Supprimer le compte Firebase Auth
    await admin.auth().deleteUser(uid);

    res.status(200).json({ success: true, Mail_uti, message: "Utilisateur supprimé dans la DB et dans Firebase Auth." });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du profil utilisateur :", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur",
    });
  }
});
