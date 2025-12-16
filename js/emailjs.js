// ========================================
// CONFIGURACIÓN DE EMAILJS
// ========================================
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_cd8hga8",
  TEMPLATE_ID: "template_tfbu0qd",
  PUBLIC_KEY: "AOsFjcFh572HFsomg",
};

/**
 * Obtiene los datos completos del checklist para enviar por email
 * @returns {Promise<object>} - Datos del checklist con incidencias
 */
export const getChecklistDataForEmail = async (currentChecklistId) => {
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
export const sendChecklistEmail = async (checklistData, stats) => {
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
