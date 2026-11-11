import zipfile
import xml.etree.ElementTree as ET
import os

path = r'c:\Users\MIGUEL\Downloads\CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm'
print(f"File exists: {os.path.exists(path)}, size: {os.path.getsize(path)} bytes")

with zipfile.ZipFile(path, 'r') as z:
    wb_xml = z.read('xl/workbook.xml')
    root = ET.fromstring(wb_xml)
    namespaces = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    sheets = root.findall('.//main:sheet', namespaces)
    print("\n--- SHEETS IN WORKBOOK ---")
    sheet_info = []
    for s in sheets:
        name = s.attrib.get('name')
        sheet_id = s.attrib.get('sheetId')
        r_id = s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        print(f"Sheet ID: {sheet_id}, rId: {r_id}, Name: '{name}'")
        sheet_info.append({'name': name, 'id': sheet_id, 'rId': r_id})

    # Read shared strings if available
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        sst_xml = z.read('xl/sharedStrings.xml')
        sst_root = ET.fromstring(sst_xml)
        for si in sst_root.findall('.//main:si', namespaces):
            t = si.find('.//main:t', namespaces)
            shared_strings.append(t.text if t is not None and t.text is not None else '')
    print(f"\nTotal shared strings: {len(shared_strings)}")
