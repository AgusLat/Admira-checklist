import { generateChecklistTemplate } from "../slides/slides-template.js";

// ========================================
// CONFIGURACIÓN DE EMAILJS
// ========================================
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_cd8hga8",
  TEMPLATE_ID: "template_tfbu0qd",
  PUBLIC_KEY: "AOsFjcFh572HFsomg",
};

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
 * Obtiene los datos completos del checklist para enviar por email
 * @returns {Promise<object>} - Datos del checklist con incidencias
 */
const getChecklistDataForEmail = async () => {
  try {
    const checklistId =
      currentChecklistId || localStorage.getItem("currentChecklistId");
    const collectionName = localStorage.getItem("currentChecklistCollection");

    if (!checklistId || !collectionName) {
      return null;
    }

    const db = window.db;
    const checklistRef = window.firebaseCollection(db, collectionName);
    const q = window.firebaseQuery(
      checklistRef,
      window.firebaseWhere("id", "==", checklistId)
    );

    const querySnapshot = await window.firebaseGetDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const checklistData = querySnapshot.docs[0].data();
    const checklist = checklistData.checklist;

    // Recopilar todas las incidencias
    const incidencias = [];

    for (const seccion in checklist) {
      for (const paso in checklist[seccion]) {
        const pasoData = checklist[seccion][paso];

        if (pasoData.estado === "INCIDENCIA" && pasoData.incidencia) {
          incidencias.push({
            seccion: seccion,
            paso: paso,
            descripcion: pasoData.incidencia,
            descripcionPaso: pasoData.desc || "",
          });
        }
      }
    }

    return {
      checklistId: checklistData.id,
      oficina: checklistData.oficina,
      userEmail: checklistData.usuario,
      fechaInicio: checklistData.fechaInicio,
      incidencias: incidencias,
    };
  } catch (error) {
    console.error("❌ Error al obtener datos para email:", error);
    return null;
  }
};

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
const formatearFecha = (isoDate) => {
  const fecha = new Date(isoDate);
  const opciones = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  };
  return fecha.toLocaleDateString("es-ES", opciones);
};

/**
 * Genera el HTML de las incidencias para el email
 * @param {Array} incidencias - Array de incidencias
 * @returns {string} - HTML de las incidencias
 */
const generarHTMLIncidencias = (incidencias) => {
  if (incidencias.length === 0) {
    return "";
  }

  return incidencias
    .map(
      (inc) => `
    <div style="background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ff9800; border-radius: 4px;">
      <strong style="color: #ff9800;">Sección:</strong> ${inc.seccion} - Paso ${inc.paso}<br>
      <strong style="color: #ff9800;">Descripción del paso:</strong> ${inc.descripcionPaso}<br>
      <strong style="color: #ff9800;">Incidencia:</strong> ${inc.descripcion}
    </div>
  `
    )
    .join("");
};

/**
 * Envía un email con los datos del checklist usando EmailJS
 * @param {object} checklistData - Datos del checklist
 * @param {object} stats - Estadísticas del checklist
 */
const sendChecklistEmail = async (checklistData, stats) => {
  try {
    console.log("📧 Enviando email de checklist completado via EmailJS...");

    // Verificar que EmailJS esté cargado
    if (typeof emailjs === "undefined") {
      console.error(
        "❌ EmailJS no está cargado. Asegúrate de incluir el script en index.html"
      );
      return false;
    }

    // Formatear fechas
    const fechaInicioFormatted = formatearFecha(checklistData.fechaInicio);
    const fechaFinFormatted = formatearFecha(new Date().toISOString());

    // Generar HTML de incidencias
    const detalleIncidencias = generarHTMLIncidencias(
      checklistData.incidencias
    );
    const hayIncidencias = checklistData.incidencias.length > 0;

    // Preparar los parámetros para la plantilla de EmailJS
    const templateParams = {
      oficina: checklistData.oficina.toUpperCase(),
      userEmail: checklistData.userEmail,
      checklistId: checklistData.checklistId,
      fechaInicio: fechaInicioFormatted,
      fechaFin: fechaFinFormatted,
      totalPasos: stats.total,
      completados: stats.completados,
      incidencias: stats.incidencias,
      detalleIncidencias: detalleIncidencias,
      if_incidencias: hayIncidencias ? "true" : "",
      if_no_incidencias: !hayIncidencias ? "true" : "",
    };

    console.log("📤 Enviando con parámetros:", templateParams);

    // Enviar el email usando EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log("✅ Email enviado correctamente");
      console.log("   Response:", response);
      return true;
    } else {
      console.error("❌ Error al enviar email. Status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Error en sendChecklistEmail:", error);
    // Mostrar detalles del error
    if (error.text) {
      console.error("   Mensaje de error:", error.text);
    }
    return false;
  }
};

/**
 * Marca el checklist como completado y envía email
 */
export const completeChecklist = async () => {
  const confirmar = confirm(
    "✅ ¿Confirmas que deseas completar el checklist?\n\n" +
      "Todos los pasos han sido revisados.\n" +
      "El checklist se marcará como COMPLETADO."
  );

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
      const checklistData = await getChecklistDataForEmail();

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
      // localStorage.removeItem("currentChecklistId");
      // localStorage.removeItem("currentChecklistCollection");
      // currentChecklistId = null;

      alert("🎉 ¡Checklist completado exitosamente!");
      location.reload();
    }
  } catch (error) {
    console.error("❌ Error al completar el checklist:", error);
    alert("❌ Error al completar el checklist. Revisa la consola.");

    throw error;
  }
};

/**
 * Marca el checklist como incompleto (cuando el usuario aborta)
 */
export const abortChecklist = async () => {
  try {
    const confirmar = confirm(
      "⚠️ ¿Estás seguro de que quieres abortar el checklist?\n\n" +
        "El checklist se marcará como INCOMPLETO y se cerrará.\n" +
        "Esta acción no se puede deshacer."
    );

    if (confirmar) {
      // await abortChecklist();
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
        estado: "incompleto",
        fechaAbandono: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      });

      console.log("⚠️ Checklist marcado como incompleto");

      localStorage.setItem("checklistClosed", "true");
      alert("✅ Checklist abortado correctamente");
      location.reload();
    }
  } catch (error) {
    console.error("❌ Error al abortar el checklist:", error);
    alert("❌ Error al abortar el checklist. Revisa la consola.");

    throw error;
  }
};

/**
 * Obtiene el ID del checklist actual
 */
export const getCurrentChecklistId = () => {
  return currentChecklistId || localStorage.getItem("currentChecklistId");
};

/**
 * Verificar estado del checklist
 */
export const debugChecklistStatus = () => {
  console.log("🔍 DEBUG: Estado del Checklist");
  console.log("  - currentChecklistId (variable):", currentChecklistId);
  console.log(
    "  - localStorage.currentChecklistId:",
    localStorage.getItem("currentChecklistId")
  );
  console.log(
    "  - localStorage.currentChecklistCollection:",
    localStorage.getItem("currentChecklistCollection")
  );
  console.log("  - window.db existe:", !!window.db);
  console.log(
    "  - window.firebaseCollection existe:",
    !!window.firebaseCollection
  );
  console.log("  - EmailJS cargado:", typeof emailjs !== "undefined");
};
