with open(r'c:\Users\MIGUEL\Downloads\recibo-ingreso.html', 'r', encoding='utf-8') as f:
    orig = f.read()

idx1 = orig.find('<div class="campo">')
print("--- ORIGIN (recibo-ingreso.html) ---")
print(orig[idx1-150:idx1+1200])

with open('templates/index.html', 'r', encoding='utf-8') as f:
    curr = f.read()

idx2 = curr.find('<div class="campo">')
print("--- CURRENT (templates/index.html) ---")
print(curr[idx2-150:idx2+1200])
