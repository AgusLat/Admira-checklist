import { generateChecklistTemplate } from "../slides/slides-template.js";
import { getChecklistDataForEmail, sendChecklistEmail } from "./emailjs.js";

// Variable global para almacenar el ID del checklist actual
let currentChecklistId = null;
// Tiempo límite para considerar un checklist como abandonado (en milisegundos)
const ABANDON_DAYS = 7;
const ABANDON_MS = ABANDON_DAYS * 24 * 60 * 60 * 1000;

/**
 * Devuelve el nombre de la colección para una oficina
 * @param {string} oficina - Nombre de la oficina
 */
const getChecklistCollectionName = (oficina) => {
  const oficinaFinal = oficina || localStorage.getItem("oficinaParam");

  if (!oficinaFinal) return null;

  return `checklist_${oficinaFinal.toLowerCase()}`;
};

/**
 * Limpia checklists antiguos en estado "en_progreso"
 */
export const cleanupOldChecklists = async () => {
  const collectionName = getChecklistCollectionName();

  if (!collectionName) {
    console.warn("⚠️ No hay colección activa para limpieza");
    return;
  }

  const db = window.db;
  const now = Date.now();
  const currentChecklistId = localStorage.getItem("currentChecklistId");

  const checklistRef = window.firebaseCollection(db, collectionName);

  const q = window.firebaseQuery(
    checklistRef,
    window.firebaseWhere("estado", "==", "en_progreso")
  );

  const snapshot = await window.firebaseGetDocs(q);

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (!data.fechaActualizacion) continue;

    if (data.id === currentChecklistId) continue;

    const lastUpdate = new Date(data.fechaActualizacion).getTime();

    if (now - lastUpdate > ABANDON_MS) {
      const nowISO = new Date().toISOString();

      await window.firebaseUpdateDoc(doc.ref, {
        estado: "abortado",
        fechaFin: nowISO,
        fechaActualizacion: nowISO,
      });

      console.log(
        `🧹 Checklist ${data.id} abortado por antigüedad (${collectionName})`
      );
    }
  }
};

/**
 * Crea un nuevo documento de checklist en Firebase en ensureChecklist
 * @param {string} oficina - Nombre de la oficina
 * @param {string} userEmail - Email del usuario
 * @param {object} slidesData - Objeto con todas las slides de la oficina para obtener descripciones
 * @returns {Promise<string>} - ID del documento creado
 */
export const createChecklistDocument = async (oficina, userEmail) => {
  try {
    const db = window.db;
    const now = new Date();
    const collectionName = getChecklistCollectionName(oficina);
    const checklistId = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(
      2,
      "0"
    )}_${now.getTime()}`;

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
      estado: "en_progreso",
      checklist: template,
    };

    const checklistRef = window.firebaseCollection(db, collectionName);
    await window.firebaseAddDoc(checklistRef, checklistData);

    // Guardar el ID y la colección en localStorage
    localStorage.setItem("currentChecklistId", checklistId);
    localStorage.setItem("currentChecklistCollection", collectionName);
    currentChecklistId = checklistId;

    console.log("✅ Checklist creado con ID:", checklistId);
    console.log("✅ Colección:", collectionName);
    console.log("✅ Guardado en localStorage");

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
 * @param {string} descripcionPaso - Descripción del paso desde las slides
 */
export const updateChecklistStep = async (
  seccion,
  paso,
  estado,
  tieneIncidencia = false,
  descripcionPaso = ""
) => {
  try {
    const checklistId =
      currentChecklistId || localStorage.getItem("currentChecklistId");
    const collectionName = localStorage.getItem("currentChecklistCollection");

    if (!checklistId || !collectionName) {
      console.error(
        "❌ No hay un checklist activo o no se conoce la colección"
      );
      console.error(
        "   localStorage.currentChecklistId:",
        localStorage.getItem("currentChecklistId")
      );
      console.error(
        "   localStorage.currentChecklistCollection:",
        localStorage.getItem("currentChecklistCollection")
      );
      return;
    }

    const db = window.db;

    if (!db) {
      console.error("❌ window.db no está inicializado");
      return;
    }

    const checklistRef = window.firebaseCollection(db, collectionName);
    const q = window.firebaseQuery(
      checklistRef,
      window.firebaseWhere("id", "==", checklistId)
    );

    const querySnapshot = await window.firebaseGetDocs(q);

    if (querySnapshot.empty) {
      console.error("❌ No se encontró el documento del checklist");
      return;
    }

    const docRef = querySnapshot.docs[0].ref;
    const currentData = querySnapshot.docs[0].data();

    // Actualizar el paso específico
    const updatedChecklist = { ...currentData.checklist };

    if (!updatedChecklist[seccion]) {
      console.error(`❌ La sección "${seccion}" no existe en el checklist`);
      return;
    }

    if (updatedChecklist[seccion][paso] === undefined) {
      console.error(`❌ El paso ${paso} no existe en la sección "${seccion}"`);
      return;
    }

    if (tieneIncidencia) {
      updatedChecklist[seccion][paso] = {
        incidencia: estado,
        desc: descripcionPaso,
        estado: "INCIDENCIA",
      };
    } else {
      updatedChecklist[seccion][paso] = {
        incidencia: null,
        desc: descripcionPaso,
        estado: "COMPLETADO",
      };
    }

    // Actualizar el documento en Firebase
    await window.firebaseUpdateDoc(docRef, {
      checklist: updatedChecklist,
      fechaActualizacion: new Date().toISOString(),
    });

    console.log(
      `✅ Paso ${paso} de ${seccion} actualizado:`,
      tieneIncidencia ? `INCIDENCIA: ${estado}` : "COMPLETADO"
    );
  } catch (error) {
    console.error("❌ Error al actualizar el paso del checklist:", error);
    throw error;
  }
};

/**
 * Verifica si todos los pasos del checklist están completados
 * @returns {Promise<object>} - { isComplete: boolean, stats: { total, completados, incidencias, noCompletados } }
 */
export const isChecklistComplete = async () => {
  try {
    const checklistId =
      currentChecklistId || localStorage.getItem("currentChecklistId");
    const collectionName = localStorage.getItem("currentChecklistCollection");

    if (!checklistId || !collectionName) {
      console.error("❌ No hay un checklist activo");
      return { isComplete: false, stats: null };
    }

    const db = window.db;
    const checklistRef = window.firebaseCollection(db, collectionName);
    const q = window.firebaseQuery(
      checklistRef,
      window.firebaseWhere("id", "==", checklistId)
    );

    const querySnapshot = await window.firebaseGetDocs(q);

    if (querySnapshot.empty) {
      console.error("❌ No se encontró el documento del checklist");
      return { isComplete: false, stats: null };
    }

    const checklistData = querySnapshot.docs[0].data();
    const checklist = checklistData.checklist;

    // Contar estadísticas
    let totalPasos = 0;
    let completados = 0;
    let incidencias = 0;
    let noCompletados = 0;
    let porSeccion = {};

    // Iterar por todas las secciones y pasos
    for (const seccion in checklist) {
      if (!porSeccion[seccion]) {
        porSeccion[seccion] = {
          total: 0,
          completados: 0,
          incidencias: 0,
        };
      }

      for (const paso in checklist[seccion]) {
        totalPasos++;
        porSeccion[seccion].total++;

        const estadoPaso = checklist[seccion][paso].estado;

        if (estadoPaso === "COMPLETADO") {
          completados++;
          porSeccion[seccion].completados++;
        } else if (estadoPaso === "INCIDENCIA") {
          incidencias++;
          porSeccion[seccion].incidencias++;
        } else if (estadoPaso === "NO COMPLETADO") {
          noCompletados++;
        }
      }
    }

    const isComplete = noCompletados === 0 && totalPasos > 0;

    // console.log("📊 Estado del checklist:");
    // console.log(`   Total pasos: ${totalPasos}`);
    // console.log(`   ✅ Completados: ${completados}`);
    // console.log(`   ⚠️  Incidencias: ${incidencias}`);
    // console.log(`   ⏸️  No completados: ${noCompletados}`);
    // console.log(
    //   `   ${isComplete ? "✅ CHECKLIST COMPLETO" : "⏳ CHECKLIST INCOMPLETO"}`
    // );

    return {
      isComplete,
      stats: {
        total: totalPasos,
        completados,
        incidencias,
        noCompletados,
        porSeccion,
      },
    };
  } catch (error) {
    console.error("❌ Error al verificar el checklist:", error);
    return { isComplete: false, stats: null };
  }
};

/**
 * Marca el checklist como completado y envía email
 */
export const completeChecklist = async (event) => {
  const completeBtn = event.currentTarget;

  // 🔒 bloquear botones INMEDIATAMENTE
  completeBtn.disabled = true;
  completeBtn.classList.add("disabled");

  const abortBtn = document.getElementById("abortChecklistBtn");
  if (abortBtn) {
    abortBtn.disabled = true;
    abortBtn.classList.add("disabled");
  }

  const confirmar = confirm(
    "✅ ¿Confirmas que deseas completar el checklist?\n\n" +
      "Todos los pasos han sido revisados.\n" +
      "El checklist se marcará como COMPLETADO."
  );

  // Si cancela, re-habilitamos
  if (!confirmar) {
    completeBtn.disabled = false;
    completeBtn.classList.remove("disabled");

    if (abortBtn) {
      abortBtn.disabled = false;
      abortBtn.classList.remove("disabled");
    }
    return;
  }

  try {
    if (confirmar) {
      const checklistId =
        currentChecklistId || localStorage.getItem("currentChecklistId");
      const collectionName = localStorage.getItem("currentChecklistCollection");

      if (!checklistId || !collectionName) {
        console.error("❌ No hay un checklist activo");
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
        console.error("❌ No se encontró el documento del checklist");
        return;
      }

      const docRef = querySnapshot.docs[0].ref;

      // Actualizar el estado en Firebase
      await window.firebaseUpdateDoc(docRef, {
        estado: "completado",
        fechaFin: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      });

      console.log("✅ Checklist marcado como completado");

      // Obtener datos para el email
      const { stats } = await isChecklistComplete();
      const checklistData = await getChecklistDataForEmail(currentChecklistId);

      // Enviar email usando EmailJS
      if (checklistData && stats) {
        const emailEnviado = await sendChecklistEmail(checklistData, stats);

        if (emailEnviado) {
          console.log("✅ Email de confirmación enviado correctamente");
        } else {
          console.warn(
            "⚠️ Checklist completado pero hubo un problema al enviar el email"
          );
          // Mostrar alerta al usuario
          alert(
            "✅ Checklist completado\n\n⚠️ Hubo un problema al enviar el email de confirmación.\nPor favor, verifica la consola para más detalles."
          );
        }
      }

      // Limpiar el localStorage
      localStorage.setItem("checklistClosed", "true");
      localStorage.removeItem("checkListMode");

      alert("🎉 ¡Checklist completado exitosamente!");
      location.reload();
    }
  } catch (error) {
    console.error("❌ Error al completar el checklist:", error);

    completeBtn.disabled = false;
    completeBtn.classList.remove("disabled");

    if (abortBtn) {
      abortBtn.disabled = false;
      abortBtn.classList.remove("disabled");
    }
    alert("❌ Error al completar el checklist. Revisa la consola.");

    throw error;
  }
};

/**
 * Marca el checklist como incompleto
 */
export const abortChecklist = async () => {
  try {
    const confirmar = confirm(
      "⚠️ ¿Estás seguro de que quieres abortar el checklist?\n\n" +
        "El checklist se marcará como INCOMPLETO y se cerrará.\n" +
        "Esta acción no se puede deshacer."
    );

    if (confirmar) {
      const checklistId =
        currentChecklistId || localStorage.getItem("currentChecklistId");
      const collectionName = localStorage.getItem("currentChecklistCollection");

      if (!checklistId || !collectionName) {
        console.error("❌ No hay un checklist activo");
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
        console.error("❌ No se encontró el documento del checklist");
        return;
      }

      const docRef = querySnapshot.docs[0].ref;

      await window.firebaseUpdateDoc(docRef, {
        estado: "abortado",
        fechaFin: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      });

      console.log("⚠️ Checklist marcado como incompleto");

      localStorage.setItem("checklistClosed", "true");
      localStorage.removeItem("currentChecklistId");
      localStorage.removeItem("currentChecklistCollection");
      localStorage.removeItem("checkListMode");
      alert("✅ Checklist abortado correctamente");
      location.reload();
    }
  } catch (error) {
    console.error("❌ Error al abortar el checklist:", error);
    alert("❌ Error al abortar el checklist. Revisa la consola.");

    throw error;
  }
};
