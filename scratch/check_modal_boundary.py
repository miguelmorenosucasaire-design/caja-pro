import re

with open('templates/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. REEMPLAZO DEL MODAL COMPLETO (DESDE COLUMNA IZQUIERDA HASTA CIERRE DEL MODAL)
marker_start = '<!-- COLUMNA IZQUIERDA (lg:col-span-7 xl:col-span-7): FORMULARIO -->'
marker_end = '<!-- ======================================================== -->\n                <!-- MODAL 3.1: CREAR NUEVA SECCIÓN / GRUPO                   -->'

idx_start = content.find(marker_start)
idx_end = content.find(marker_end)

if idx_start == -1 or idx_end == -1:
    print(f"Error: Markers not found! idx_start={idx_start}, idx_end={idx_end}")
    exit(1)

# We want to replace from marker_start up to right before marker_end (leaving the 2 closing divs of modal)
modal_part = content[idx_start:idx_end]
# Find the end of modal-nuevo-movimiento (the closing divs before marker_end)
closing_pattern = '</div>\n            </div>\n        </div>\n    </div>'
close_pos = content.rfind('</div>\n            </div>\n        </div>\n    </div>', idx_start, idx_end)
if close_pos == -1:
    # let's look for how the modal ends before marker_end
    sub = content[idx_end-150:idx_end]
    print("Near end:", repr(sub))

print("Found start:", idx_start)
