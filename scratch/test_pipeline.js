const fs = require('fs');

console.log('--- REBUILD PIPELINE TEST ---');
fs.copyFileSync('templates/index.html.bak', 'templates/index.html');
console.log('1. Copied index.html.bak to index.html. Size:', fs.statSync('templates/index.html').size);

require('./apply_new_sections.js');
console.log('2. apply_new_sections applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_header_update.js');
console.log('3. apply_header_update applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_section_grupos_update.js');
console.log('4. apply_section_grupos_update applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_full_13_grupos_ui.js');
console.log('5. apply_full_13_grupos_ui applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_javascript_updates.js');
console.log('6. apply_javascript_updates applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_frontend_updates.js');
console.log('7. apply_frontend_updates applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_carreras_frontend.js');
console.log('8. apply_carreras_frontend applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_unified_sidebar.js');
console.log('9. apply_unified_sidebar applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_design_and_reassignment.js');
console.log('10. apply_design_and_reassignment applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_cyber_styling.js');
console.log('11. apply_cyber_styling applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_docentes_ui.js');
console.log('12. apply_docentes_ui applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_clean_icons.js');
console.log('13. apply_clean_icons applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_final_cleanups.js');
console.log('14. apply_final_cleanups applied. Size:', fs.statSync('templates/index.html').size);

require('./replace_sin_mov.js');
console.log('15. replace_sin_mov applied. Size:', fs.statSync('templates/index.html').size);

require('./apply_backup_feature.js');
console.log('16. apply_backup_feature applied. Size:', fs.statSync('templates/index.html').size);

require('./update_html_stats.js');
console.log('17. update_html_stats applied. Size:', fs.statSync('templates/index.html').size);
