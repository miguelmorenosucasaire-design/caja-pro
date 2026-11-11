const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const script = html.substring(scriptStart + 8, scriptEnd);

const vm = require('vm');
try {
    new vm.Script('(function() {\n' + script + '\n})();');
} catch (e) {
    console.log('Error name:', e.name);
    console.log('Error message:', e.message);
    console.log('Error stack:\n', e.stack);
}
