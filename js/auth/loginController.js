import {
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, provider } from "../../firebase/firebaseConfig.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getOficina } from "../nav-menu-controller.js";

export const loginUser = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    const autorizado = await isAuthorizedUser(email);
    if (!autorizado) {
      alert("Acceso denegado: usuario no autorizado.");
      signOut(auth);
      return;
    }

    // Guardar email
    localStorage.setItem("userEmail", email);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error al iniciar sesión");
  }
};

export const isAuthorizedUser = async (email) => {
  if (email.endsWith("@admira.com")) return true;

  const ref = doc(db, "usuarios_autorizados", email);
  const snap = await getDoc(ref);
  return snap.exists() && snap.data().activo === true;
};

export const logoutUser = async (e) => {
  e.preventDefault();
  const oficina = getOficina();
  //VERIFICAR SI HAY UN CHECKLIST ABIERTO Y BORRARLO DE FIREBASE SI NO ESTA COMPLETADO
  await signOut(auth);
  localStorage.clear();
  window.location.href = `index.html?oficina=${oficina}`;
};
