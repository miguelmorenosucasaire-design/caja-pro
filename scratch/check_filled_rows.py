import zipfile
import xml.etree.ElementTree as ET
import sys

sys.stdout.reconfigure(encoding='utf-8')

path = r'c:\Users\MIGUEL\Downloads\CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm'

with zipfile.ZipFile(path, 'r') as z:
    wb_rels_xml = z.read('xl/_rels/workbook.xml.rels')
    rels_root = ET.fromstring(wb_rels_xml)
    r_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in rels_root.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')}

    wb_xml = z.read('xl/workbook.xml')
    wb_root = ET.fromstring(wb_xml)
    namespaces = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    sheets = wb_root.findall('.//main:sheet', namespaces)

    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        sst_xml = z.read('xl/sharedStrings.xml')
        sst_root = ET.fromstring(sst_xml)
        for si in sst_root.findall('.//main:si', namespaces):
            t_elems = si.findall('.//main:t', namespaces)
            shared_strings.append("".join([t.text or "" for t in t_elems]))

    for s in sheets:
        name = s.attrib['name']
        rid = s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        target = r_map[rid]
        if not target.startswith('xl/'):
            target = 'xl/' + target
        
        sheet_xml = z.read(target)
        s_root = ET.fromstring(sheet_xml)
        rows = s_root.findall('.//main:row', namespaces)
        
        non_empty_rows = 0
        sample = None
        for row in rows[5:]: # After header
            cells = row.findall('main:c', namespaces)
            has_val = False
            vals = []
            for c in cells:
                v = c.find('main:v', namespaces)
                t = c.attrib.get('t')
                if v is not None and v.text and v.text.strip():
                    val = v.text
                    if t == 's':
                        idx = int(v.text)
                        val = shared_strings[idx] if idx < len(shared_strings) else v.text
                    vals.append(f"{c.attrib.get('r')}:{val}")
                    has_val = True
            if has_val:
                non_empty_rows += 1
                if sample is None:
                    sample = " | ".join(vals[:6])
        print(f"Sheet '{name}': {non_empty_rows} filled data rows. Sample: {sample}")
