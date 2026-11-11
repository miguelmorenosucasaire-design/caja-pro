import win32com.client
import os
import sys

current_dir = os.path.abspath(os.getcwd())
xlsx_path = os.path.join(current_dir, "Gestion_Caja_Institucion.xlsx")
xlsm_path = os.path.join(current_dir, "Gestion_Caja_Institucion_Automatica.xlsm")
macro_path = os.path.join(current_dir, "macro_vba.txt")

if not os.path.exists(xlsx_path):
    print("No se encontró el archivo base xlsx.")
    sys.exit(1)

with open(macro_path, "r", encoding="utf-8") as f:
    macro_code = f.read()

try:
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False
except Exception as e:
    print("Error iniciando Excel via COM:", e)
    sys.exit(1)

try:
    wb = excel.Workbooks.Open(xlsx_path)
    
    # Agregar un módulo estándar (1) al proyecto VBA
    xlmodule = wb.VBProject.VBComponents.Add(1)
    xlmodule.Name = "MacroCaja"
    xlmodule.CodeModule.AddFromString(macro_code)
    
    # Guardar como XLSM (52 = xlOpenXMLWorkbookMacroEnabled)
    wb.SaveAs(xlsm_path, FileFormat=52)
    print("¡Éxito! Archivo generado:", xlsm_path)
except Exception as e:
    print(f"Error procesando el workbook: {e}")
finally:
    try:
        wb.Close(SaveChanges=False)
    except:
        pass
    excel.Quit()
