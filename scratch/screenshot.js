const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const out = path.resolve('public/img/minedu_barras_oficial.png');

const res = spawnSync(edge, [
  '--headless',
  '--disable-gpu',
  '--default-background-color=00000000',
  '--window-size=368,184',
  '--screenshot=' + out,
  'http://127.0.0.1:5000/public/test_logo.html'
]);

console.log('Out exists?', fs.existsSync(out));
if (fs.existsSync(out)) {
  console.log('File size:', fs.statSync(out).size);
} else {
  console.log('Error:', res.stderr ? res.stderr.toString() : '');
}
