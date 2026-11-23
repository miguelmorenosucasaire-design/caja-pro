from PIL import Image, ImageFilter
import numpy as np
from collections import deque
import os
import shutil

src_path = r'C:/Users/MIGUEL/.gemini/antigravity/brain/5821ddea-af78-49ad-96d0-1a882b4589e0/.user_uploaded/media_1794801113911_d263888c.jpg'
dest_dir = 'public/img'
backup_dir = 'public/img/backup_logos'

os.makedirs(dest_dir, exist_ok=True)
os.makedirs(backup_dir, exist_ok=True)

# 0. Backup existing files if they exist
targets = [
    'logo_institucion.jpg',
    'logo_cetpro_hd.png',
    'logo_cetpro_hd.jpg',
    'escudo_recibo_ingreso.png',
    'escudo_recibo_azul.png'
]
for t in targets:
    cur = os.path.join(dest_dir, t)
    if os.path.exists(cur):
        shutil.copy2(cur, os.path.join(backup_dir, t))
print('Backups created in', backup_dir)

# Save pristine original
shutil.copy2(src_path, os.path.join(dest_dir, 'logo_oficial_subido.jpg'))

# Load and prepare images
im_orig = Image.open(src_path).convert('RGB')
w_orig, h_orig = im_orig.size
print('Original dimensions:', w_orig, h_orig)

# Upscale slightly with Lanczos for ultra-HD detail: 731 x 1024
im_hd = im_orig.resize((731, 1024), Image.Resampling.LANCZOS)
arr = np.array(im_hd)
h_hd, w_hd, _ = arr.shape

# Exterior flood fill mask to remove off-white background
bg_mask = np.zeros((h_hd, w_hd), dtype=bool)
q = deque()

for y in range(h_hd):
    for x in [0, w_hd-1]:
        if np.all(arr[y, x] >= 226):
            bg_mask[y, x] = True
            q.append((y, x))

for x in range(w_hd):
    for y in [0, h_hd-1]:
        if not bg_mask[y, x] and np.all(arr[y, x] >= 226):
            bg_mask[y, x] = True
            q.append((y, x))

while q:
    cy, cx = q.popleft()
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        ny, nx = cy + dy, cx + dx
        if 0 <= ny < h_hd and 0 <= nx < w_hd and not bg_mask[ny, nx]:
            pixel = arr[ny, nx]
            if np.all(pixel >= 232) or (np.all(pixel >= 218) and np.std(pixel) < 6):
                bg_mask[ny, nx] = True
                q.append((ny, nx))

# 1. White background JPEG (logo_institucion.jpg & logo_cetpro_hd.jpg)
arr_white = arr.copy()
arr_white[bg_mask] = [255, 255, 255]
im_white = Image.fromarray(arr_white)
p_inst = os.path.join(dest_dir, 'logo_institucion.jpg')
p_cet_jpg = os.path.join(dest_dir, 'logo_cetpro_hd.jpg')
im_white.save(p_inst, quality=98)
im_white.save(p_cet_jpg, quality=98)
print('Saved', p_inst, 'size:', os.path.getsize(p_inst))
print('Saved', p_cet_jpg, 'size:', os.path.getsize(p_cet_jpg))

# 2. Transparent PNG (logo_cetpro_hd.png)
alpha = (~bg_mask).astype(np.uint8) * 255
alpha_im = Image.fromarray(alpha, mode='L').filter(ImageFilter.GaussianBlur(radius=0.8))
alpha_arr = np.array(alpha_im)
alpha_arr[~bg_mask & (alpha_arr < 245)] = 255

arr_rgba = np.dstack((arr_white, alpha_arr))
im_rgba = Image.fromarray(arr_rgba, mode='RGBA')
p_cet_png = os.path.join(dest_dir, 'logo_cetpro_hd.png')
im_rgba.save(p_cet_png)
print('Saved', p_cet_png, 'size:', os.path.getsize(p_cet_png))

# 3. Escudo recibo (escudo_recibo_ingreso.png)
im_escudo = im_rgba.resize((380, 532), Image.Resampling.LANCZOS)
p_esc = os.path.join(dest_dir, 'escudo_recibo_ingreso.png')
im_escudo.save(p_esc)
print('Saved', p_esc, 'size:', os.path.getsize(p_esc))

# 4. Escudo azul (escudo_recibo_azul.png)
escudo_arr = np.array(im_escudo)
gray = 0.299 * escudo_arr[:, :, 0] + 0.587 * escudo_arr[:, :, 1] + 0.114 * escudo_arr[:, :, 2]
blue_r = (gray / 255.0) * 31 + (255 - gray) / 255.0 * 200
blue_g = (gray / 255.0) * 90 + (255 - gray) / 255.0 * 215
blue_b = (gray / 255.0) * 166 + (255 - gray) / 255.0 * 240
escudo_blue = np.dstack((
    np.clip(blue_r, 0, 255).astype(np.uint8),
    np.clip(blue_g, 0, 255).astype(np.uint8),
    np.clip(blue_b, 0, 255).astype(np.uint8),
    escudo_arr[:, :, 3]
))
p_esc_blue = os.path.join(dest_dir, 'escudo_recibo_azul.png')
Image.fromarray(escudo_blue, mode='RGBA').save(p_esc_blue)
print('Saved', p_esc_blue, 'size:', os.path.getsize(p_esc_blue))

# 5. Favicon (favicon.png)
p_fav = os.path.join(dest_dir, 'favicon.png')
im_rgba.resize((128, 128), Image.Resampling.LANCZOS).save(p_fav)
print('Saved', p_fav, 'size:', os.path.getsize(p_fav))

print('ALL OFFICIAL LOGOS DEPLOYED SUCCESSFULLY!')
