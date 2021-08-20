var fs = require('fs');
var n = 0;
try {
    n = +(''+fs.readFileSync('./public/version.txt')).trim();
    if (isNaN(n)) {
        n = 0;
    }
} catch (e){
    console.error(e)
}
fs.writeFileSync('./public/version.txt', '' + (n+1))