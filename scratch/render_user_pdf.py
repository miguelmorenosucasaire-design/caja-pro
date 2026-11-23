import fitz # PyMuPDF

pdf_path = r"C:\Users\MIGUEL\.gemini\antigravity\brain\5821ddea-af78-49ad-96d0-1a882b4589e0\.user_uploaded\media_1795188589595_44ac50c9.pdf"
doc = fitz.open(pdf_path)

print("Page count:", len(doc))
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    out_path = f"scratch/pdf_page_{i+1}.png"
    pix.save(out_path)
    print(f"Saved page {i+1} to {out_path} ({pix.width}x{pix.height})")

    # Also inspect images embedded in the page
    image_list = page.get_images(full=True)
    print(f"Page {i+1} has {len(image_list)} embedded images:")
    for img_idx, img in enumerate(image_list):
        xref = img[0]
        base_image = doc.extract_image(xref)
        print(f"  Img {img_idx}: ext={base_image['ext']}, width={base_image['width']}, height={base_image['height']}")
