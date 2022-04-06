const http = require('http');

module.exports = () => http.request({
    path: '/?key1=1',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': 6,
        'Cookie': 'key3=3',
        'Key': 4
    }
})
.on('error', err => console.error('There was an error:\n' + err.message))
.once('response', res => 
    res.on('data', data => {
        data = data.toString()
        
        const cG = data.includes('1'),
            cP = data.includes('2'),
            cC = data.includes('3'),
            cH = data.includes('4');
        
        console.log(
             `Query String Check: ${cG ? '✔' : '❌'}
            \rPost Data Check: ${cP ? '✔' : '❌'}
            \rCookie Check: ${cC ? '✔' : '❌'}
            \rCustom Header Check: ${cH ? '✔' : '❌'}\x1b[0m`)

        process.exit()
    })
)
.write('key2=2');

if (require.main === module) {
    console.log('\x1b[32mHTTP Test:\n');

    require('http')
    .createServer(require('..')('test/test.php'))
    .listen(80);

    module.exports();
}