import re, os, subprocess, fitz, base64
from PIL import Image

# Read minedu_barras.png and convert to base64
with open('public/img/minedu_barras.png', 'rb') as f:
    b64_minedu = base64.b64encode(f.read()).decode('utf-8')

with open('public/img/escudo_recibo_ingreso.png', 'rb') as f:
    b64_escudo = base64.b64encode(f.read()).decode('utf-8')

# Read test_print_page.html
with open('scratch/test_print_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace inline <svg ...> with <img src="data:image/png;base64,..." ...>
old_svg_pattern = r'<svg viewBox="0 0 92 46" aria-hidden="true">[\s\S]*?</svg>'
replacement = f'<img src="data:image/png;base64,{b64_minedu}" alt="Ministerio de Educación" class="logo-minedu-nitido">'
html = re.sub(old_svg_pattern, replacement, html)

# Also replace escudo with base64 so we can see both in local file
html = html.replace('src="/public/img/escudo_recibo_ingreso.png"', f'src="data:image/png;base64,{b64_escudo}"')

with open('scratch/test_print_page_with_img.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated html written with Base64')

# Now run msedge --headless to print PDF
edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
html_path = os.path.abspath('scratch/test_print_page_with_img.html')
pdf_path = os.path.abspath('scratch/test_output_with_img.pdf')

subprocess.run([edge, '--headless', '--disable-gpu', f'--print-to-pdf={pdf_path}', html_path], check=True)
print('PDF printed:', pdf_path)

# Verify with PyMuPDF
doc = fitz.open(pdf_path)
print('Page count:', len(doc))
page = doc[0]
pix = page.get_pixmap(dpi=150)
pix.save('scratch/pdf_page_with_img.png')

# Inspect blue pixels in header crop
im = Image.open('scratch/pdf_page_with_img.png').convert('RGB')
crop1 = im.crop((50, 40, 350, 160))
crop1.save('scratch/crop1_with_img.png')

blue_count = 0
w, h = crop1.size
for x in range(w):
    for y in range(h):
        r, g, b = crop1.getpixel((x, y))
        if b > 140 and b > r + 30:
            blue_count += 1

print('Blue pixels in crop1 (minedu logo area):', blue_count)
