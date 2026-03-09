import os
from PIL import Image

root_folder = "./img"

for folder, subfolders, files in os.walk(root_folder):
    for file in files:
        if file.lower().endswith(".jpeg"):
            jpg_path = os.path.join(folder, file)
            webp_path = os.path.join(folder, file.rsplit(".", 1)[0] + ".webp")

            try:
                # Convertir a WebP
                img = Image.open(jpg_path).convert("RGB")
                img.save(webp_path, "WEBP", quality=90)

                # Borrar JPG original
                os.remove(jpg_path)

                print(f"{file} -> convertido a WEBP y borrado el JPG")
            except Exception as e:
                print(f"Error con {jpg_path}: {e}")
