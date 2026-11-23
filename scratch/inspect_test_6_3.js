const fs = require('fs');
const lines = fs.readFileSync('tests/test_nuevos_requerimientos_usuario_turn.js', 'utf8').split('\n');
for (let i = 110; i < 125; i++) {
  console.log(i + 1, ':', lines[i]);
}
