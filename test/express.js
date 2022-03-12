console.log('\x1b[32mExpress Test:\n');

require('express')()
.all('/', require('..')('test/test.php'))
.listen(80);

require('./http')();