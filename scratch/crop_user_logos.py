from PIL import Image

im = Image.open(r"C:\Users\MIGUEL\.gemini\antigravity\brain\5821ddea-af78-49ad-96d0-1a882b4589e0\.user_uploaded\media_1794709379092_bdbb08c6.png")
# The receipt has minedu logo top left, cetpro top right
w, h = im.size
print("Receipt size:", w, h)

# Crop CETPRO logo on right
cetpro_crop = im.crop((w - 110, 10, w - 10, 115))
cetpro_crop.save("scratch/cetpro_sample.png")

# Crop MINEDU logo on left
minedu_crop = im.crop((10, 10, 140, 115))
minedu_crop.save("scratch/minedu_sample.png")

print("Saved logo samples from user's receipt")
