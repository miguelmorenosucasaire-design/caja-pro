const { DatabaseSync } = require('node:sqlite');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('Testing excel sync with updated groups...');
const server = require('./server.js');
