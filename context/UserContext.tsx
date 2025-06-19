import React, { createContext, useState } from 'react';

type UserContextType = {
  userMail: string | null;
  setUserMail: (mail: string | null) => void;

  // Ajout pour création de compte
  mailCreation: string | null;
  setMailCreation: (mail: string | null) => void;
  mdpCreation: string | null;
  setMdpCreation: (mdp: string | null) => void;

};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [userMail, setUserMail] = useState<string | null>(null);

  // États pour inscription
  const [mailCreation, setMailCreation] = useState<string | null>(null);
  const [mdpCreation, setMdpCreation] = useState<string | null>(null);



  return (
    <UserContext.Provider value={{

      userMail, setUserMail,
      mailCreation, setMailCreation,
      mdpCreation, setMdpCreation,

    }}>
      {children}
    </UserContext.Provider>
  );
};
