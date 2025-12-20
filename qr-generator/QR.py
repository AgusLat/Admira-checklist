
import qrcode
from PIL import Image
import os

# 📁 Crear carpeta de salida si no existe
output_folder = "qrs"
os.makedirs(output_folder, exist_ok=True)

# 🎨 Diccionario de URLs con estilos personalizados
qr_data = {
    # "Oficina_Terminator": {
    #     "url": "https://yokup.com/visitas/?oficina=planetaterminator",
    #     "color": "black",
    #     "background": "red",
    #     "logo": "logos/t800.png",   # opcional
    # },
    #  "Oficina_Oasis": {
    #      "url": "https://yokup.com/visitas/?oficina=santarosa",
    #      "color": "#2054FF",
    #      "background": "black",
    #      "logo": "logos/ghost.webp",     # opcional
    #  },
    #  "Oficina_Store": {
    #      "url": "https://yokup.com/visitas/?oficina=store",
    #      "color": "white",
    #      "background": "#6F6F6F",
    #      "logo": "logos/sneaker.webp",               
    #  },
    #  "Oficina_Nave": {
    #      "url": "https://yokup.com/visitas/?oficina=planetanave",
    #      "color": "#CD2E2E",
    #      "background": "#171717",
    #      "logo": "logos/rebel.png",               
    #  },
      "Nuevo_QR": {
          "url": "https://yokup.com/visitas/?oficina=nuevaoficina",
          "color": "#CD2E2E",
          "background": "#171717",
          "logo": "logos/nuevaoficina.png",               
      },
}

# Ruta absoluta del script (por si ejecutas desde otra carpeta)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ⚙️ Generar cada QR
for nombre, info in qr_data.items():
    url = info["url"]
    fill_color = info.get("color", "black")
    back_color = info.get("background", "white")
    logo_rel = info.get("logo")
    logo_path = os.path.join(SCRIPT_DIR, logo_rel) if logo_rel else None

    # 🧱 Crear QR base
    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # 🖼️ Generar imagen del QR (en RGB)
    img_qr = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGB")

    # 🔘 Agregar logo si existe
    if logo_path and os.path.exists(logo_path):
        print(f"🖼️ Usando logo para {nombre}: {logo_path}")

        # Abrimos el logo con soporte de alpha si lo tiene
        logo = Image.open(logo_path)

        # Aseguramos que tiene un tamaño razonable (25% del ancho del QR)
        qr_width, qr_height = img_qr.size
        logo_max_size = qr_width // 3  # logo = 1/4 del ancho del QR

        # Convertimos a RGBA para obtener el canal alfa si existe
        logo = logo.convert("RGBA")
        logo.thumbnail((logo_max_size, logo_max_size), Image.LANCZOS)

        # Separar canales para usar el alfa como máscara
        r, g, b, a = logo.split()
        logo_rgb = Image.merge("RGB", (r, g, b))
        mask = a  # canal alfa

        # Posición centrada
        logo_w, logo_h = logo_rgb.size
        pos = (
            (qr_width - logo_w) // 2,
            (qr_height - logo_h) // 2
        )

        # Pegamos respetando transparencia (PNG)
        img_qr.paste(logo_rgb, pos, mask)

    else:
        if logo_rel:
            print(f"⚠️ No se encontró el logo '{logo_rel}' para {nombre}")

    # 💾 Guardar el archivo en la carpeta
    output_path = os.path.join(output_folder, f"{nombre}.png")
    img_qr.save(output_path)
    print(f"✅ QR generado: {output_path}")

print("\n🎉 ¡Todos los QR se han generado correctamente!")