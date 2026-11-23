const fs = require('fs');

const html = `
<!DOCTYPE html>
<html>
<head>
<style>
.outlined {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 28px;
  font-weight: 900;
  color: #ffffff;
  -webkit-text-stroke: 1.2px #26467d;
  letter-spacing: 0.5px;
}
.solid {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 28px;
  font-weight: 900;
  color: #26467d;
  letter-spacing: 0.5px;
}
</style>
</head>
<body>
<div class="outlined">MINISTERIO DE EDUCACIÓN</div>
<div class="solid">MINISTERIO DE EDUCACIÓN</div>
</body>
</html>
`;
fs.writeFileSync('scratch/test_outline.html', html);
console.log('Saved scratch/test_outline.html');
