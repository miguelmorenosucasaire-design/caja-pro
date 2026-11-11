import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Create workbook
wb = openpyxl.Workbook()

# Define styles
header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
header_font = Font(color="FFFFFF", bold=True)
border_side = Side(border_style="thin", color="000000")
border = Border(left=border_side, right=border_side, top=border_side, bottom=border_side)
align_center = Alignment(horizontal="center", vertical="center")

def apply_header_style(sheet, row=1):
    for cell in sheet[row]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = align_center
        cell.border = border

# 1. Base de Datos / Movimientos (Caja)
ws_caja = wb.active
ws_caja.title = "Caja_Movimientos"
caja_headers = ["ID", "Fecha", "Tipo", "Estado", "Rol", "Nombre", "Carrera", "Concepto", "Monto", "Fecha Vencimiento", "Días para Vencer"]
ws_caja.append(caja_headers)
apply_header_style(ws_caja)

# Set column widths
ws_caja.column_dimensions['B'].width = 15
ws_caja.column_dimensions['C'].width = 15
ws_caja.column_dimensions['D'].width = 15
ws_caja.column_dimensions['E'].width = 15
ws_caja.column_dimensions['F'].width = 30
ws_caja.column_dimensions['G'].width = 20
ws_caja.column_dimensions['H'].width = 25
ws_caja.column_dimensions['I'].width = 15
ws_caja.column_dimensions['J'].width = 20
ws_caja.column_dimensions['K'].width = 20

# Add some dummy data
import datetime
today = datetime.date.today()
ws_caja.append([1, today, "Ingreso", "Pagado", "Estudiante", "Juan Perez", "Ingeniería", "Matrícula", 500, "", ""])
ws_caja.append([2, today, "Ingreso", "Pendiente", "Estudiante", "Maria Lopez", "Medicina", "Mensualidad", 300, today + datetime.timedelta(days=10), "=(J3-TODAY())"])
ws_caja.append([3, today, "Egreso", "Pagado", "Profesor", "Carlos Gomez", "Matemáticas", "Pago Salario", 1500, "", ""])
ws_caja.append([4, today - datetime.timedelta(days=5), "Ingreso", "Pendiente", "Estudiante", "Luis Diaz", "Derecho", "Mensualidad", 300, today + datetime.timedelta(days=-2), "=(J5-TODAY())"])

# 2. Deudores
ws_deudores = wb.create_sheet("Deudores")
ws_deudores.append(["ID", "Fecha", "Nombre", "Carrera", "Concepto", "Monto", "Fecha Vencimiento", "Días Vencidos", "Estado"])
apply_header_style(ws_deudores)
ws_deudores.column_dimensions['C'].width = 30
ws_deudores.column_dimensions['D'].width = 20
ws_deudores.column_dimensions['E'].width = 25
ws_deudores.column_dimensions['G'].width = 20
ws_deudores.column_dimensions['H'].width = 15

# 3. Resumen Anual (Dashboard)
ws_dashboard = wb.create_sheet("Resumen_Anual")
ws_dashboard.append(["Mes", "Ingresos", "Egresos", "Saldo Mensual", "Deuda Pendiente"])
apply_header_style(ws_dashboard)

meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
for i, mes in enumerate(meses):
    mes_num = i + 1
    # Formulate using SUMIFS based on month
    row = i + 2
    ingresos_formula = f'=SUMIFS(Caja_Movimientos!I:I, Caja_Movimientos!C:C, "Ingreso", Caja_Movimientos!D:D, "Pagado", Caja_Movimientos!B:B, ">="&DATE(YEAR(TODAY()),{mes_num},1), Caja_Movimientos!B:B, "<="&EOMONTH(DATE(YEAR(TODAY()),{mes_num},1),0))'
    egresos_formula = f'=SUMIFS(Caja_Movimientos!I:I, Caja_Movimientos!C:C, "Egreso", Caja_Movimientos!B:B, ">="&DATE(YEAR(TODAY()),{mes_num},1), Caja_Movimientos!B:B, "<="&EOMONTH(DATE(YEAR(TODAY()),{mes_num},1),0))'
    saldo_formula = f'=B{row}-C{row}'
    deuda_formula = f'=SUMIFS(Caja_Movimientos!I:I, Caja_Movimientos!C:C, "Ingreso", Caja_Movimientos!D:D, "Pendiente", Caja_Movimientos!B:B, ">="&DATE(YEAR(TODAY()),{mes_num},1), Caja_Movimientos!B:B, "<="&EOMONTH(DATE(YEAR(TODAY()),{mes_num},1),0))'
    ws_dashboard.append([mes, ingresos_formula, egresos_formula, saldo_formula, deuda_formula])

ws_dashboard.column_dimensions['A'].width = 15
ws_dashboard.column_dimensions['B'].width = 20
ws_dashboard.column_dimensions['C'].width = 20
ws_dashboard.column_dimensions['D'].width = 20
ws_dashboard.column_dimensions['E'].width = 20

# 4. Formulario de Ingreso (Para la Macro)
ws_form = wb.create_sheet("Ingresar_Registro", 0)
ws_form.append(["FORMULARIO DE INGRESO DE MOVIMIENTO"])
ws_form.merge_cells('A1:B1')
ws_form['A1'].font = Font(size=14, bold=True, color="FFFFFF")
ws_form['A1'].fill = PatternFill(start_color="203764", end_color="203764", fill_type="solid")
ws_form['A1'].alignment = align_center

fields = ["Fecha:", "Tipo (Ingreso/Egreso):", "Estado (Pagado/Pendiente):", "Rol (Estudiante/Profesor):", "Nombre:", "Carrera:", "Concepto:", "Monto:", "Fecha Vencimiento (Si Pendiente):"]
for i, field in enumerate(fields):
    row = i + 3
    ws_form.cell(row=row, column=1, value=field).font = Font(bold=True)
    ws_form.cell(row=row, column=2).border = border
    ws_form.cell(row=row, column=2).fill = PatternFill(start_color="D9E1F2", end_color="D9E1F2", fill_type="solid")

ws_form.column_dimensions['A'].width = 35
ws_form.column_dimensions['B'].width = 30

ws_form.cell(row=13, column=1, value="* Una vez llenado, ejecuta la macro 'GuardarMovimiento'")
ws_form.cell(row=13, column=1).font = Font(italic=True, color="FF0000")

# Save workbook
wb.save("Gestion_Caja_Institucion.xlsx")
print("Excel template created successfully!")
