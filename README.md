# Admira Checklist

## 📌 QR URLs

- **Store:** https://yokup.com/visitas/?oficina=store
- **Planeta Terminator:** https://yokup.com/visitas/?oficina=planetaterminator
- **Planeta Nave:** https://yokup.com/visitas/?oficina=planetanave
- **Oasis (Santa Rosa):** https://yokup.com/visitas/?oficina=santarosa
- **Big Bang / BatCueva :** https://yokup.com/visitas/?oficina=bigbang

---

## TODO: BUGS, CORRECCIONES, TESTING Y FUTURAS FEATURES

- **EMAILJS(correccion):** Cambiar direccion de envio correo de confirmacion utilizando otra cuenta de emailjs, y utilizar el template ubicado en el fichero "email-template".
- **FIREBASE(testing):** Control de acceso. Verificar acceso a la aplicación con emails @admira.com.
- **INCIDENCIAS FRECUENTES(feature):** Opción para el usuario al abrir el modal de incidencias un boton que muestre una lista de incidencias frecuentas y su solución.
- **CIERRE DE OFICINA(feature):** Opción para el usuario en el menú de navegacion para elegir entre el modo "APERTURA" o "CIERRE" de la oficina.

---

## 🆕 AGREGAR NUEVA OFICINA

### Modificar archivos del fichero slides:

- **slides.js :** Definir y exportar nueva constante de la nueva oficina con la siguiente nomenclatura

```
export const slidesNuevaOficina = {
  nombreSeccion1: {
    0: { type: "intro", desc: "Nombre de la sección 1" },
    1: {
      desc: "Descripción del paso a seguir",
      imgSrc: "./img/nombreOficina/nombreSeccion1/nombreSeccion_1.webp",
    },
    ...
    6: { type: "outro", desc: "Zona completada." },
  },
  nombreSeccion2: {
    0: { type: "intro", desc: "Nombre de la sección 2" },
    1: {
      desc: "Descripción del paso a seguir",
      imgSrc: "./img/nombreOficina/nombreSeccion2/nombreSeccion_2.webp",,
    },
    ...
    4: { type: "outro", desc: "Zona completada." },

  }
}
```

- **slides-template.js:** Agregar nueva oficina a la constante slidesMap:

```
export const slidesMap = {
  santarosa: slidesSantaRosa,
  store: slidesStore,
  planetaterminator: slidesPlanetaTerminator,
  planetanave: slidesPlanetaNave,
  //NUEVAS OFICINAS AQUÍ (IMPORTAR LAS SLIDES) :
  //"nombreoficina": slidesNombreOficina
};
```

### Agregar fotos a los pasos correspondientes

- **Fichero img:** Crear nuevo fichero con el nombre de la oficina y subficheros con el nombre de las secciones. Agregar las fotos con su nomenclatura correspondiente.

### Generar QR

**Herramienta qr-generator:**

- Agregar la oficina nueva como un nuevo objeto en "qr_data", especificar URL y elegir colores.
- Agregar el logo elegido al fichero "logos".
- Ejecutar el archivo "QR.py" y ver el resultado del QR en el fichero "qrs"

---

## MODO DEV:

- Comentar el elemento `<base href="https://yokup.com/visitas/" />` en index.html para trabajar en modo local

---

## 📷 Lista de fotos faltantes y modificaciones por oficina

---

### PLANETA TERMINATOR

#### Entrada

-Faltan fotos de los pasos:
**11**

-Modificar: Codigo de cabina??

---

### PLANETA NAVE

#### Entrada

-Faltan fotos de los pasos:
**5**

-Modificar: Agregar paso luz azul

#### Nave

-Faltan fotos de los pasos:
**1, 3, 7, 11, 12, 16**
-Modificar: Agregar paso luces azules

#### Oficina

Faltan fotos de los pasos:
**6, 7**

---

### SANTAROSA

#### Sala 360

-Modificar: Cambiar foto pc paso 1

#### Garaje

-Faltan fotos de los pasos:
**7**

---

### STORE

#### Metahuman

Faltan fotos de los pasos:
**1, 2**


