const fs = require('fs');
let html = fs.readFileSync('templates/index.html', 'utf8');

const needle = `<span>Ver Boletas y Plantilla Completa</span>
                        </button>`;

const replacement = `<span>Ver Boletas y Plantilla Completa</span>
                        </button>
                    </div>
                </div>`;

if (html.includes(needle)) {
    html = html.replace(needle, replacement);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('Added missing </div></div> after button.');
} else {
    console.log('Needle not found, check exact characters.');
}
