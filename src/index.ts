// NPM Module 'http-php'
//
// Simple express middleware for serving PHP files.
//
// Author: UROBBYU (Robert Liapota)


import fs = require('fs')
import child = require('child_process')
import http = require('http')
import path = require('path')
import express = require('express')
import cmdEx from 'command-exists'


interface Environment {
    /**
     * For security reasons, by default CGI compiler blocks all direct executions. To execute it properly request must be redirected by server. Redirect status is the request status passed to PHP compiler. Similarly to Express, 200 is 'OK', 404 - 'Not Found' and 500 - 'Internal Server Error'.
     * 
     * **Default: `200`.**
     */
    REDIRECT_STATUS?: number | string;

    /**
     * Some web servers protect access to CGI scripts using authorization.The AUTH_TYPE variable refers to the Authorization Type that the server uses to verify users. For example, a possible value for this variable could be Basic, referring to Basic authentication. Note that not all servers support authorization.
     * 
     * **Omitted.**
     */
    AUTH_TYPE?: string;

    /**
     * CONTENT_LENGTH gives the length of the content delivered through the request as number of bytes. If the length is unknown, then the variable would be set to -1.
     * 
     * **Evaluated automatically.**
     */
    CONTENT_LENGTH?: number | string;

    /**
     * The CONTENT_TYPE variable contains the type of file that is returned by the request. For example, if a web page is requested, the CONTENT_TYPE variable would be set to the MIME type text/html.
     * 
     * **Evaluated automatically.**
     */
    CONTENT_TYPE?: string;

    /**
     * If you want to know what version of the CGI specification the server handles, then you can query the GATEWAY_INTERFACE. This variable will help to ensure you are using the right version of the specification and valid commands.
     * 
     * **Default: `CGI/1.1`.**
     */
    GATEWAY_INTERFACE?: string;

    /**
     * Set to a non-empty value if the script was queried through the HTTPS protocol.
     * 
     * **Evaluated automatically.**
     */
    HTTPS?: string;

    /**
     * All headers from the request. Must be in format: `'Some-Custom-Header': 'And some data here'`. Headers's name case does not matter.
     * 
     * **Evaluated automatically.**
     */
    [key: `HTTP_${Uppercase<string>}`]: string;

    /**
     * The PATH_INFO variable contains additional information that is seen after the CGI script name. For example, if you execute www.placeholder.com/cgi-bin/hello.pl/index.html, then the PATH_INFO for this would be the characters that come after the CGI script name or /index.html in this example.
     * 
     * **Evaluated automatically.**
     */
    PATH_INFO?: string;

    /**
     * When you type an address of a CGI script on a web browser, you usually type in a virtual path which is mapped to a physical location on the server. For example, if you go to http://www.somewebsite.com/cgi-bin/index.cgi and you query the PATH_TRANSLATED variable, you will get the actual physical path. If you are on a shared unix server, that might be /home/placeholder/public_html/cgi-bin/index.cgi.
     * 
     * **Evaluated automatically.**
     */
    PATH_TRANSLATED?: string;

    /**
     * It is common to see query information appended to a URL after the question mark. For the URL http://www.placeholder.com/cgi-bin/hello.cgi?name=Leroy&exclamation=true, requesting the QUERY_STRING would result in name=Leroy&exclamation=true being returned.
     * 
     * **Evaluated automatically.**
     */
    QUERY_STRING?: string;

    /**
     * The REMOTE_ADDR variable gives the IP address of the client computer making the request. Essentially, REMOTE_ADDR is REMOTE_HOST resolved to an IP address.
     * 
     * **Evaluated automatically.**
     */
    REMOTE_ADDR?: string;

    /**
     * Web servers constantly accept both connections and requests from clients. The REMOTE_HOST variable refers to the hostname of the client that performs the request. For example, if your web host accepts a request from webhost2.com, then REMOTE_HOST would be populated with webhost2.com.
     * 
     * **Omitted.**
     */
    REMOTE_HOST?: string;

    /**
     * The REMOTE_IDENT variable stores the user ID running the CGI script. The user ID is stored only if the ident process is running since ident returns a response containing not only user ID information, but also the name of the OS running the script.
     * 
     * **Omitted.**
     */
    REMOTE_IDENT?: string;

    /**
     * Querying the REMOTE_USER variable will give the user name information of the entity making the request. This is only valid if authentication is enabled.
     * 
     * **Omitted.**
     */
    REMOTE_USER?: string;

    /**
     * The REQUEST_METHOD variable gives the type of HTTP request completed, which includes values like GET, POST, and PUT.
     * 
     * **Evaluated automatically.**
     */
    REQUEST_METHOD?: string;

    /**
     * The IP address of the server under which the current script is executing.
     * 
     * **Evaluated automatically.**
     */
    SERVER_ADDR?: string;

    /**
     * The SERVER_NAME variable gives the full name of your server. For example, if you query for this variable, the result will be the website’s domain name.
     * 
     * **Evaluated automatically.**
     */
    SERVER_NAME?: string;

    /**
     * The port of the server under which the current script is executing.
     * 
     * **Evaluated automatically.**
     */
    SERVER_PORT?: number | string;

    /**
     * You can find out what protocol a server is using to handle requests. For example, if the server you are working with uses the HTTP protocol it will return a string like “HTTP/1.1”, which means that the server is using HTTP version 1.1. Basically, the string returned is in the format protocol/version.
     * 
     * **Evaluated automatically.**
     */
    SERVER_PROTOCOL?: string;

    /**
     * The SERVER_SOFTWARE environment variable contains the name and version of the software running on the web server. For example, if you output the value of this variable and you are running a version of Apache, you may get something similar to the following: `Apache 2.4.25`
     * 
     * **Default: `Express`.**
     */
    SERVER_SOFTWARE?: string;
}

type Options = {
    /**
     * Environment variables that will be passed to the PHP compiler. Some of them are just description of request, others are special arguments which dictate compiler's behavior.
     * 
     * All the necessary information is calculated automatically, so there is no need to change anything.
     * 
     * *But compiler will obviously prefer your input to automatically generated.*
     */
    env?: Environment;

    /**
     * Path to the PHP file which will be passed to compiler.
     * 
     * **You must specify it.**
     */
    file: fs.PathLike;

    /**
     * Path to the PHP compiler.
     * 
     * *Can be absolute, execution relative or PATH relative.*
     * 
     * **Default: `php-cgi`.**
     */
    php?: fs.PathLike;

    /**
     * Current working directory of the compiler process.
     */
    cwd?: fs.PathLike;

    /**
     * Allows aborting the compiler process using an AbortSignal.
     */
    abort?: AbortSignal;

    /**
     * In milliseconds the maximum amount of time the process is allowed to run.
     * 
     * *By default there is no limit.*
     */
    timeout?: number;
}

/**
 * Response from the PHP compiler.
 */
type PHPData = {
    /**
     * All HTTP headers.
     * 
     * *The 'Status' header automatically appears when the compiler detects an error.*
     * 
     * ### Example:
     * ```json
     * {
     *    "X-Powered-By": "PHP/8.1.2",
     *    "Content-type": "text/html; charset=UTF-8"
     * }
     * ```
     */
    headers: {
        [title: string]: string
    },

    /**
     * Response body.
     * 
     * ### Example:
     * ```html
     * <html>
     * <body>Some text here</body>
     * </html>
     * ```
     */
    body: string,

    /**
     * Raw response from the compiler. Looks like headers + body, separated by empty line.
     * 
     * ### Example:
     * ```html
     * X-Powered-By: PHP/8.1.2
     * Content-type: text/html; charset=UTF-8
     * 
     * <html>
     * <body>Some text here</body>
     * </html>
     * ```
     */
    raw: string,

    /**
     * Error stream output. Can contain some debug data even if no error was thrown.
     * 
     * ### Example with debug data:
     * ```
     * Xdebug: [Step Debug] Time-out connecting to debugging client, waited: 200 ms. Tried: localhost:9003 (through xdebug.client_host/xdebug.client_port) :-(
     * ```
     * 
     * ### Example with error data:
     * ```
     * PHP Fatal error:  Uncaught Error: Undefined constant "itDoesNotExist" in D:\Some\path\here.php:1
     * Stack trace:
     * #0 {main}
     *   thrown in D:\Some\path\here.php on line 1
     * ```
     */
    err: string
}

interface Execute {
    /**
     * Request handler.
     * 
     * ### Example:
     * ```js
     * const php_cmd = require('http-php');
     * const file_php = php_cmd('path/to/file.php');
     * 
     * app.all('/path', async (req, res) => {
     *    let { body: page } = await file_php(req);
     *    // Do something with page
     *    res.send(page);
     * });
     * ```
     * 
     * If `res` parameter is passed, will automatically respond with generated data.
     * 
     * ### Example:
     * ```js
     * app.all('/path', require('http-php')('path/to/file.php'));
     * ```
     */
    (/** - Request object. */ request: http.IncomingMessage, /** - Response object. */ response?: http.ServerResponse): Promise<PHPData>;

    /**
     * Synchronous version of request handler.
     */
    sync: (/** - Request object. */ request: http.IncomingMessage, /** - Response object. */ response?: http.ServerResponse) => PHPData;
}

type Compile = {
    /**
     * Creates a PHP compiler process.
     * 
     * ### Example #1:
     * ```js
     * const php_cmd = require('http-php');
     * const file_php = php_cmd('path/to/file.php');
     * 
     * app.all('/path', async (req, res) => {
     *    let { body: page } = await file_php(req);
     *    // Do something with page
     *    res.send(page);
     * });
     * ```
     * 
     * ### Example #2:
     * ```js
     * app.all('/path', require('http-php')('path/to/file.php'));
     * ```
     */
    (/** - Path to the PHP file which will be passed to compiler. */ path: string): Execute;

    /**
     * Creates a PHP compiler process.
     * 
     * ### Example #1:
     * ```js
     * const php_cmd = require('http-php');
     * const file_php = php_cmd({
     *    file: 'path/to/file.php',
     *    cwd: 'other/directory/',
     *    env: {
     *       REDIRECT_STATUS: 201
     *    }
     * });
     * 
     * app.all('/path', async (req, res) => {
     *    let { body: page } = await file_php(req);
     *    // Do something with page
     *    res.send(page);
     * });
     * ```
     * 
     * ### Example #2:
     * ```js
     * app.all('/path', require('http-php')({ file: 'path/to/file.php' }));
     * ```
     */
    (/** - Compilation options. `file` property must be specified. */ options: Options): Execute;
}


const compile: Compile = (arg: string | Options) => {
    let php = (<Options>arg).php?.toString() ?? 'php-cgi'
    if (php !== 'php-cgi' && !path.isAbsolute(php)) php = path.join(__dirname, php)

    const file = typeof arg === 'string' ? arg : arg.file

    if (!cmdEx.sync(php)) throw new Error('PHP compiler path is incorrect {options->php}')

    if (!file || !fs.existsSync(file)) throw new Error('PHP file path is incorrect {options->file | path}')

    const prepArg = (req: http.IncomingMessage | express.Request) => {
        let CONTENT_TYPE = <string>req.headers['content-type']
        let CONTENT_LENGTH = <string>req.headers['content-length']
        let input: (Buffer | null) = null
        if (!req.readable && 'body' in req) {
            if (typeof req.body === 'string') input = Buffer.from(req.body)
            else if (req.body instanceof Buffer) input = req.body
            else if (typeof req.body === 'object' && Object.getOwnPropertyNames(req.body).length) {
                if (req.is('application/x-www-form-urlencoded')) {
                    input = Buffer.from(Object.entries(req.body).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(<number | string>v)).join('&').replace(/%20/g, '+'))
                } else {
                    input = Buffer.from(JSON.stringify(req.body))
                    CONTENT_TYPE = 'application/json'
                }
                CONTENT_LENGTH = input.length.toString()
            }
        }

        const env = {
            SCRIPT_FILENAME: file.toString(),
            REDIRECT_STATUS: (<Options>arg).env?.REDIRECT_STATUS?.toString() ?? '200',
            AUTH_TYPE: (<Options>arg).env?.AUTH_TYPE,
            CONTENT_LENGTH: (<Options>arg).env?.CONTENT_LENGTH?.toString() ?? CONTENT_LENGTH,
            CONTENT_TYPE: (<Options>arg).env?.CONTENT_TYPE ?? CONTENT_TYPE,
            GATEWAY_INTERFACE: (<Options>arg).env?.GATEWAY_INTERFACE ?? 'CGI/1.1',
            HTTPS: (<Options>arg).env?.HTTPS ?? ('encrypted' in req.socket ? 'On' : undefined),
            PATH_INFO: (<Options>arg).env?.PATH_INFO ?? req.url?.replace(/\?.*?/, ''),
            PATH_TRANSLATED: (<Options>arg).env?.PATH_TRANSLATED ?? file.toString(),
            QUERY_STRING: req.url?.includes('?') ? req.url?.replace(/.*?\?/, '') : '',
            REMOTE_ADDR: (<Options>arg).env?.REMOTE_ADDR ?? <string>req.headers['cf-connecting-ip'] ?? req.headers.forwarded?.split(',')[0],
            REMOTE_HOST: (<Options>arg).env?.REMOTE_HOST,
            REMOTE_IDENT: (<Options>arg).env?.REMOTE_IDENT,
            REMOTE_USER: (<Options>arg).env?.REMOTE_USER,
            REQUEST_METHOD: (<Options>arg).env?.REQUEST_METHOD ?? req.method,
            SERVER_ADDR: (<Options>arg).env?.SERVER_ADDR ?? req.socket.localAddress,
            SERVER_NAME: (<Options>arg).env?.SERVER_NAME ?? req.headers.host,
            SERVER_PORT: (<Options>arg).env?.SERVER_PORT?.toString() ?? req.socket.localPort?.toString(),
            SERVER_PROTOCOL: (<Options>arg).env?.SERVER_PROTOCOL ?? ('HTTP/' + req.httpVersion),
            SERVER_SOFTWARE: (<Options>arg).env?.SERVER_SOFTWARE ?? 'Express'
        }

        const headers: {[i:string]:string} = {}

        for (const name in req.headers) {
            let header = req.headers[name]

            if (typeof header === 'object' || header === undefined) continue

            headers['HTTP_' + name.toUpperCase().replace(/-/g, '_')] = header
        }

        Object.assign(env, headers)

        for (const name in (<Options>arg).env) {
            if (name.startsWith('HTTP_')) env[<'HTTPS'>name] = (<Options>arg).env?.[<'HTTPS'>name]
        }

        return {
            env,
            input
        }
    }

    const exec: Execute = (req: http.IncomingMessage, res?: http.ServerResponse): Promise<PHPData> => {
        const { env, input } = prepArg(req)
        
        return new Promise((resolve, reject) => {
            const errBufferList: Buffer[] = []
            const outBufferList: Buffer[] = []

            const proc = child.spawn(php, {
                cwd: (<Options>arg).cwd?.toString(),
                signal: (<Options>arg).abort,
                timeout: (<Options>arg).timeout ?? 0,
                env
            })

            proc.on('error', reject)
            
            proc.stderr.setEncoding('utf8')
            proc.stdout.setEncoding('utf8')

            proc.stderr.on('data', (data: Buffer) => errBufferList.push(Buffer.from(data)))
            proc.stdout.once('end', () => {
                const err = Buffer.concat(outBufferList).toString().replace(/\r\n/g, '\n')

                proc.stdout.on('data', (data: Buffer) => outBufferList.push(Buffer.from(data)))
                proc.stdout.once('end', () => {
                    proc.kill()
                    const raw = Buffer.concat(outBufferList).toString().replace(/\r\n/g, '\n')
                    const arr = raw.match(/(.*?)\n\n(.*)/s)?.slice(1) ?? ['', '']
                    const headers = Object.fromEntries(arr[0].split('\n').map(val => val.match(/(.*?): (.*)/)?.slice(1) ?? ['err', 'Parsing failed']))
                    const body = arr[1]
                    if (res) {
                        if (headers['Status']) {
                            const code = +headers['Status'].split(' ')[0]
                            if (code == 500) return reject(new Error('Failed to compile PHP file', {
                                cause: new Error(err)
                            }))
                            res.statusCode = code
                        }
                        res.writeHead(200, headers).end(body)
                    }
                    resolve({ headers, body, raw, err })
                })
            })
            
            if (input) proc.stdin.write(input)
            else req.pipe(proc.stdin, { end: true })
        })
    }

    exec.sync = (req: http.IncomingMessage, res?: http.ServerResponse): PHPData => {
        const { env, input } = prepArg(req)

        const proc = child.spawnSync(php, {
            cwd: (<Options>arg).cwd?.toString(),
            signal: (<Options>arg).abort,
            timeout: (<Options>arg).timeout ?? 0,
            env,
            encoding: 'utf8',
            input: <Buffer>input
        })

        if (proc.error) throw new Error('Failed to compile PHP file', {
            cause: proc.error
        })

        const err = proc.stderr.toString().replace(/\r\n/g, '\n')
        const raw = proc.stdout.toString().replace(/\r\n/g, '\n')
        const arr = raw.match(/(.*?)\n\n(.*)/s)?.slice(1) ?? ['', '']
        const headers = Object.fromEntries(arr[0].split('\n').map(val => val.match(/(.*?): (.*)/)?.slice(1) ?? ['err', 'Parsing failed']))
        const body = arr[1]
        if (res) {
            if (headers['Status']) {
                const code = +headers['Status'].split(' ')[0]
                if (code == 500) throw new Error('Failed to compile PHP file')
                res.statusCode = code
            }
            res.writeHead(200, headers).end(body)
        }

        return { headers, body, raw, err }
    }

    return exec
}


export = compile