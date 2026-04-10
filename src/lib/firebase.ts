import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Usamos o caminho relativo clássico para evitar bugs de resolução do Vite com JSON
import firebaseConfig from '../../firebase-applet-config.json'; 

// Inicializa a aplicação Firebase com as credenciais do JSON
const app = initializeApp(firebaseConfig);

// Inicializa a Base de Dados (sem o segundo argumento para usar a base padrão, evitando crashes)
export const db = getFirestore(app);

// Inicializa a Autenticação
export const auth = getAuth(app);

/* Nota: A função testConnection() foi removida pois em ambiente
  de produção ela consome leituras desnecessárias e pode atrasar 
  o carregamento da aplicação para os utilizadores finais.
*/