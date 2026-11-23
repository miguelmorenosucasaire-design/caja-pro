const os = require('os');
const ifaces = os.networkInterfaces();
const ips = [];
for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            ips.push({ name, address: iface.address });
        }
    }
}
console.log('Local IPs:', JSON.stringify(ips, null, 2));
