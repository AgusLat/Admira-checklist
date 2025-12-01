// js/incidencias.js - ACTUALIZADO

import { updateChecklistStep } from "../firebase/checklist-manager.js";

// Variable para almacenar temporalmente la incidencia antes de avanzar
let pendingIncidencia = null;

/**
 * Guarda una incidencia y la marca como pendiente para el siguiente paso
 * @param {object} issue - Objeto con los datos de la incidencia
 */
export const reportIssue = async (issue) => {
  try {
    const descripcion = issue.incidencia.trim();

    if (!descripcion) {
      console.warn("⚠️ No se proporcionó descripción de incidencia");
      alert("Por favor, escribe una descripción de la incidencia.");
      return;
    }

    console.log("📋 Incidencia reportada:", descripcion);

    // Guardar la incidencia como pendiente
    pendingIncidencia = {
      seccion: issue.seccion,
      paso: issue.paso,
      descripcionIncidencia: issue.incidencia,
      descripcionPaso: issue.pasoDesc || ""
    };

  } catch (error) {
    console.error("❌ Error al guardar la incidencia:", error);
    alert("Hubo un error al guardar la incidencia. Revisa la consola.");
  }
};

/**
 * Marca un paso como completado SIN incidencia
 * @param {string} seccion - Nombre de la sección
 * @param {number} paso - Índice del paso
 * @param {string} descripcionPaso - Descripción del paso
 */
export const markStepAsOK = async (seccion, paso, descripcionPaso = "") => {
  try {
    await updateChecklistStep(seccion, paso, "OK", false, descripcionPaso);
    console.log(`✅ Paso ${paso} de ${seccion} marcado como OK`);
  } catch (error) {
    console.error("❌ Error al marcar el paso como OK:", error);
  }
};

/**
 * Verifica si hay una incidencia pendiente y la procesa
 * Si hay incidencia pendiente, actualiza el checklist con ella
 * @returns {boolean} - true si había una incidencia pendiente
 */
export const processPendingIncidencia = async () => {
  if (pendingIncidencia) {
    try {
      await updateChecklistStep(
        pendingIncidencia.seccion,
        pendingIncidencia.paso,
        pendingIncidencia.descripcionIncidencia,
        true,
        pendingIncidencia.descripcionPaso
      );
      console.log(`⚠️ Incidencia procesada para paso ${pendingIncidencia.paso} de ${pendingIncidencia.seccion}`);
      pendingIncidencia = null;
      return true;
    } catch (error) {
      console.error("❌ Error al procesar la incidencia pendiente:", error);
      return false;
    }
  }
  return false;
};

/**
 * Verifica si hay una incidencia pendiente
 * @returns {boolean}
 */
export const hasPendingIncidencia = () => {
  return pendingIncidencia !== null;
};