const https = require('https');
const fs = require('fs');

const url = 'https://release.solana.com/v1.18.15/solana-install-init-x86_64-pc-windows-msvc.exe';
const file = fs.createWriteStream('solana-install-init.exe');

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed.');
  });
}).on('error', (err) => {
  fs.unlink('solana-install-init.exe');
  console.error('Error downloading:', err.message);
});
