// Template para generar el documento de checklist en Firebase
// Cada paso tendrá: { completado: false, estado: null, incidencia: null }

export const generateChecklistTemplate = (oficina) => {
  const templates = {
    santarosa: {
      sala360: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null },
        6: { completado: false, estado: null, incidencia: null }
      },
      arcade: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null },
        6: { completado: false, estado: null, incidencia: null },
        7: { completado: false, estado: null, incidencia: null },
        8: { completado: false, estado: null, incidencia: null },
        9: { completado: false, estado: null, incidencia: null },
        10: { completado: false, estado: null, incidencia: null }
      },
      cafeteria: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null },
        6: { completado: false, estado: null, incidencia: null }
      },
      garaje: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null },
        6: { completado: false, estado: null, incidencia: null },
        7: { completado: false, estado: null, incidencia: null },
        8: { completado: false, estado: null, incidencia: null }
      }
    },
    store: {
      metahuman: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null }
      },
      recepcion: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null }
      }
    },
    planetaterminator: {
      entrada: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null }
      },
      pantallas: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null },
        6: { completado: false, estado: null, incidencia: null }
      }
    },
    planetanave: {
      entrada: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null },
        6: { completado: false, estado: null, incidencia: null },
        7: { completado: false, estado: null, incidencia: null },
        8: { completado: false, estado: null, incidencia: null },
        9: { completado: false, estado: null, incidencia: null },
        10: { completado: false, estado: null, incidencia: null },
        11: { completado: false, estado: null, incidencia: null },
        12: { completado: false, estado: null, incidencia: null }
      },
      ascensor: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null }
      },
      nave: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null },
        6: { completado: false, estado: null, incidencia: null },
        7: { completado: false, estado: null, incidencia: null },
        8: { completado: false, estado: null, incidencia: null },
        9: { completado: false, estado: null, incidencia: null },
        10: { completado: false, estado: null, incidencia: null },
        11: { completado: false, estado: null, incidencia: null },
        12: { completado: false, estado: null, incidencia: null },
        13: { completado: false, estado: null, incidencia: null },
        14: { completado: false, estado: null, incidencia: null },
        15: { completado: false, estado: null, incidencia: null },
        16: { completado: false, estado: null, incidencia: null },
        17: { completado: false, estado: null, incidencia: null }
      },
      oficina: {
        0: { completado: false, estado: null, incidencia: null },
        1: { completado: false, estado: null, incidencia: null },
        2: { completado: false, estado: null, incidencia: null },
        3: { completado: false, estado: null, incidencia: null },
        4: { completado: false, estado: null, incidencia: null },
        5: { completado: false, estado: null, incidencia: null },
        6: { completado: false, estado: null, incidencia: null },
        7: { completado: false, estado: null, incidencia: null },
        8: { completado: false, estado: null, incidencia: null },
        9: { completado: false, estado: null, incidencia: null },
        10: { completado: false, estado: null, incidencia: null },
        11: { completado: false, estado: null, incidencia: null }
      }
    }
  };

  return templates[oficina] || null;
};


