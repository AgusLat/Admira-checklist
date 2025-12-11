import {
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { auth, provider } from "../../firebase/firebaseConfig.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

    // Mantener el parámetro de la URL
    const params = new URLSearchParams(window.location.search);
    const oficina = params.get("oficina") || "store";
    localStorage.setItem("oficinaParam", oficina);
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
