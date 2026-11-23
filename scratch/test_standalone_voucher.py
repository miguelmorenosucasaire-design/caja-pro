import re, os, subprocess, fitz, base64
from PIL import Image

with open('public/img/minedu_barras.png', 'rb') as f:
    b64_minedu = base64.b64encode(f.read()).decode('utf-8')

with open('public/img/escudo_recibo_ingreso.png', 'rb') as f:
    b64_escudo = base64.b64encode(f.read()).decode('utf-8')

with open('templates/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract styles from index.html
style_match = re.search(r'<style>([\s\S]*?)</style>', text)
styles = style_match.group(1) if style_match else ''

# Extract contenedor-impresion-factura
cont_match = re.search(r'(<div id="contenedor-impresion-factura"[\s\S]*?</div>\s*</div>\s*</div>)', text)
# Or find the opening and closing of #contenedor-impresion-factura
start_idx = text.find('id="contenedor-impresion-factura"')
div_start = text.rfind('<div', 0, start_idx)

# Let's extract the full voucher section
end_idx = text.find('<!-- MODAL: PREVISUALIZADOR PDF', div_start)
voucher_html = text[div_start:end_idx]

# Replace inline SVG with Base64 img
old_svg_pattern = r'<svg viewBox="0 0 92 46" aria-hidden="true">[\s\S]*?</svg>'
replacement = f'<img src="data:image/png;base64,{b64_minedu}" alt="Ministerio de Educación" class="logo-minedu-nitido">'
voucher_html = re.sub(old_svg_pattern, replacement, voucher_html)

# Replace escudo with Base64 img
voucher_html = voucher_html.replace('src="/public/img/escudo_recibo_ingreso.png"', f'src="data:image/png;base64,{b64_escudo}"')

standalone_html = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{styles}
body {{
    margin: 0;
    padding: 0;
    background: #fff;
}}
#contenedor-impresion-factura {{
    display: flex !important;
}}
</style>
</head>
<body class="generando-pdf-oficial">
{voucher_html}
</body>
</html>'''

with open('scratch/voucher_standalone.html', 'w', encoding='utf-8') as f:
    f.write(standalone_html)

print('Saved scratch/voucher_standalone.html')

# Print PDF with Edge
edge = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
html_path = os.path.abspath('scratch/voucher_standalone.html')
pdf_path = os.path.abspath('scratch/voucher_standalone.pdf')

subprocess.run([edge, '--headless', '--disable-gpu', f'--print-to-pdf={pdf_path}', html_path], check=True)
print('PDF printed successfully!')

doc = fitz.open(pdf_path)
print('Page count:', len(doc))
page = doc[0]
pix = page.get_pixmap(dpi=150)
pix.save('scratch/voucher_standalone.png')
print('Page image saved, size:', pix.width, pix.height)

im = Image.open('scratch/voucher_standalone.png').convert('RGB')
# Look at voucher 1 header (top left)
# Let's crop x: 50 to 250, y: 30 to 180
crop_logo1 = im.crop((50, 30, 250, 180))
crop_logo1.save('scratch/crop_logo1.png')

blue_pixels = 0
for x in range(crop_logo1.width):
    for y in range(crop_logo1.height):
        r, g, b = crop_logo1.getpixel((x, y))
        # Blue in bars is #1f5aa6 -> r=31, g=90, b=166
        if b > 120 and b > r + 40 and g > 60:
            blue_pixels += 1

print('Blue pixels in Minedu logo:', blue_pixels)
