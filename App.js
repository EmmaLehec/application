import { Slot } from 'expo-router';
import { UserProvider } from './context/UserContext';

export default function App() {
  return (
    <UserProvider>
      <Slot />
    </UserProvider>
  );
}
