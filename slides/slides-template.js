import {
  slidesSantaRosa,
  slidesStore,
  slidesPlanetaTerminator,
  slidesPlanetaNave,
} from "./slides.js";

// Mapeo de oficinas a sus slides correspondientes
export const slidesMap = {
  santarosa: slidesSantaRosa,
  store: slidesStore,
  planetaterminator: slidesPlanetaTerminator,
  planetanave: slidesPlanetaNave,
  //NUEVAS OFICINAS AQUÍ (IMPORTAR LAS SLIDES) :
  //"nombreoficina": slidesNombreOficina
};

/**
 * Genera el template del checklist basándose en las slides
 * OMITE los pasos tipo "intro" y "outro"
 */
export const generateChecklistTemplate = (oficina) => {
  const oficinaNormalizada = oficina.toLowerCase();
  const slidesOficina = slidesMap[oficinaNormalizada];

  if (!slidesOficina) {
    console.error(`No se encontraron slides para la oficina: ${oficina}`);
    return null;
  }

  const template = {};

  // Iterar por cada sección (ej: sala360, arcade, etc.)
  for (const [seccionNombre, seccionSlides] of Object.entries(slidesOficina)) {
    template[seccionNombre] = {};

    // Iterar por cada slide de la sección
    for (const [indice, slide] of Object.entries(seccionSlides)) {
      const idx = parseInt(indice);

      // OMITIR slides tipo "intro" y "outro"
      if (slide.type === "intro" || slide.type === "outro") {
        console.log(
          `⏭️  Omitiendo paso ${idx} de ${seccionNombre} (tipo: ${slide.type})`
        );
        continue;
      }

      // Crear la entrada del template con la nueva estructura
      template[seccionNombre][idx] = {
        incidencia: null,
        desc: slide.desc || "",
        estado: "NO COMPLETADO",
      };
    }
  }

  console.log("✅ Template generado para", oficina, ":", template);
  return template;
};
