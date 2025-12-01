import { generateChecklistTemplate } from "../slides/slides-template.js";

// Variable global para almacenar el ID del checklist actual
let currentChecklistId = null;


/**
 * Devuelve el nombre de la colección para una oficina
 * @param {string} oficina - Nombre de la oficina
 */
const getChecklistCollectionName = (oficina) => {
  return `checklist_${oficina.toLowerCase()}`;
};


/**
 * Crea un nuevo documento de checklist en Firebase al hacer login
 * @param {string} oficina - Nombre de la oficina
 * @param {string} userEmail - Email del usuario
 * @returns {Promise<string>} - ID del documento creado
 */
export const createChecklistDocument = async (oficina, userEmail) => {
  try {
    const db = window.db;
    const now = new Date();
    const collectionName = getChecklistCollectionName(oficina);
    const checklistId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${now.getTime()}`;
    
    const template = generateChecklistTemplate(oficina);
    
    if (!template) {
      throw new Error(`No se encontró template para la oficina: ${oficina}`);
    }

    const checklistData = {
      id: checklistId,
      oficina: oficina,
      usuario: userEmail,
      fechaInicio: now.toISOString(),
      fechaActualizacion: now.toISOString(),
      estado: "en_progreso", // en_progreso, completado, incompleto
      checklist: template
    };

    
    const checklistRef = window.firebaseCollection(db, collectionName);
    await window.firebaseAddDoc(checklistRef, checklistData);
 

    // Guardar el ID y la coleccion en localStorage para usarlo durante la sesión
    localStorage.setItem("currentChecklistId", checklistId);
    localStorage.setItem("currentChecklistCollection", collectionName);
    currentChecklistId = checklistId;

    console.log("✅ Checklist creado con ID:", checklistId);
    return checklistId;
  } catch (error) {
    console.error("❌ Error al crear el checklist:", error);
    throw error;
  }
};

/**
 * Actualiza un paso del checklist en Firebase
 * @param {string} seccion - Nombre de la sección (ej: "sala360")
 * @param {number} paso - Índice del paso
 * @param {string} estado - "OK" o descripción de incidencia
 * @param {boolean} tieneIncidencia - Si el paso tiene incidencia
 */
export const updateChecklistStep = async (seccion, paso, estado, tieneIncidencia = false) => {
  try {
    const checklistId = currentChecklistId || localStorage.getItem("currentChecklistId");
    const collectionName = localStorage.getItem("currentChecklistCollection");
    
    if (!checklistId || !collectionName) {
      console.error("No hay un checklist activo o no se conoce la colección");
      return;
    }

    const db = window.db;
    const checklistRef = window.firebaseCollection(db, collectionName);
    const q = window.firebaseQuery(
      checklistRef,
      window.firebaseWhere("id", "==", checklistId)
    );
    
    const querySnapshot = await window.firebaseGetDocs(q);
    
    if (querySnapshot.empty) {
      console.error("No se encontró el documento del checklist");
      return;
    }

    const docRef = querySnapshot.docs[0].ref;
    const currentData = querySnapshot.docs[0].data();

    // Actualizar el paso específico
    const updatedChecklist = { ...currentData.checklist };
    if (updatedChecklist[seccion] && updatedChecklist[seccion][paso]) {
      const currentStep = updatedChecklist[seccion][paso];

      if (tieneIncidencia) {
        // 📌 Caso con incidencia: solo texto en 'incidencia'
        updatedChecklist[seccion][paso] = {
          ...currentStep,
          completado: false,
          estado: null,
          incidencia: estado        // ← aquí usamos el 3er parámetro como texto de incidencia
        };
      } else {
        // ✅ Caso OK: sin incidencia
        updatedChecklist[seccion][paso] = {
          ...currentStep,
          completado: true,
          estado: estado,           // normalmente "OK"
          incidencia: null
        };
      }
    }

    // Actualizar el documento en Firebase
    await window.firebaseUpdateDoc(docRef, {
      checklist: updatedChecklist,
      fechaActualizacion: new Date().toISOString()
    });

    console.log(
      `✅ Paso ${paso} de ${seccion} actualizado:`,
      tieneIncidencia ? "INCIDENCIA (con texto en 'incidencia')" : estado
    );
  } catch (error) {
    console.error("❌ Error al actualizar el paso del checklist:", error);
    throw error;
  }
};


/**
 * Marca el checklist como completado
 */
export const completeChecklist = async () => {
  try {
    const checklistId = currentChecklistId || localStorage.getItem("currentChecklistId");
    const collectionName = localStorage.getItem("currentChecklistCollection");
    
    if (!checklistId || !collectionName) {
      console.error("No hay un checklist activo");
      return;
    }

    const db = window.db;
    const checklistRef = window.firebaseCollection(db, collectionName);
    const q = window.firebaseQuery(
      checklistRef,
      window.firebaseWhere("id", "==", checklistId)
    );
    
    const querySnapshot = await window.firebaseGetDocs(q);
    
    if (querySnapshot.empty) {
      console.error("No se encontró el documento del checklist");
      return;
    }

    const docRef = querySnapshot.docs[0].ref;

    await window.firebaseUpdateDoc(docRef, {
      estado: "completado",
      fechaFin: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    });

    console.log("✅ Checklist marcado como completado");
    
    // Limpiar el ID del localStorage
    localStorage.removeItem("currentChecklistId");
    localStorage.removeItem("currentChecklistCollection");
    currentChecklistId = null;
  } catch (error) {
    console.error("❌ Error al completar el checklist:", error);
    throw error;
  }
};

/**
 * Marca el checklist como incompleto (cuando el usuario aborta)
 */
export const abortChecklist = async () => {
  try {
    const checklistId = currentChecklistId || localStorage.getItem("currentChecklistId");
    const collectionName = localStorage.getItem("currentChecklistCollection");
    
    if (!checklistId) {
      console.error("No hay un checklist activo");
      return;
    }

    const db = window.db;
    const checklistRef = window.firebaseCollection(db, collectionName);
    const q = window.firebaseQuery(
      checklistRef,
      window.firebaseWhere("id", "==", checklistId)
    );
    
    const querySnapshot = await window.firebaseGetDocs(q);
    
    if (querySnapshot.empty) {
      console.error("No se encontró el documento del checklist");
      return;
    }

    const docRef = querySnapshot.docs[0].ref;

    await window.firebaseUpdateDoc(docRef, {
      estado: "incompleto",
      fechaAbandono: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    });

    console.log("⚠️ Checklist marcado como incompleto");
    
    // Limpiar el ID del localStorage
    localStorage.removeItem("currentChecklistId");
    currentChecklistId = null;
  } catch (error) {
    console.error("❌ Error al abortar el checklist:", error);
    throw error;
  }
};

/**
 * Obtiene el ID del checklist actual
 */
export const getCurrentChecklistId = () => {
  return currentChecklistId || localStorage.getItem("currentChecklistId");
};