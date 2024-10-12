const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', '@duckdb', 'duckdb-wasm', 'dist');
const targetDir = path.join(__dirname, '..', 'public');

const filesToCopy = [
  'duckdb-browser-mvp.worker.js',
  'duckdb-browser-eh.worker.js',
  'duckdb-mvp.wasm',
  'duckdb-eh.wasm',
];

filesToCopy.forEach(file => {
  fs.copyFile(path.join(sourceDir, file), path.join(targetDir, file), (err) => {
    if (err) throw err;
    console.log(`${file} was copied to public/`);
  });
});
