function dateToSerial(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return Math.round((date - epoch) / (24 * 3600 * 1000));
}

function serialToDate(serial) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + serial * 24 * 3600 * 1000);
    return d.toISOString().split('T')[0];
}

console.log('46083 ->', serialToDate(46083));
console.log('2026-01-12 ->', dateToSerial('2026-01-12'));
console.log('2026-03-02 ->', dateToSerial('2026-03-02'));
console.log('2026-09-15 ->', dateToSerial('2026-09-15'));
