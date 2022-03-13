"use strict";
// NPM Module 'http-php'
//
// Simple express middleware for serving PHP files.
//
// Author: UROBBYU (Robert Liapota)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs = require("fs");
const child = require("child_process");
const path = require("path");
const command_exists_1 = __importDefault(require("command-exists"));
const compile = (arg) => {
    let php = arg.php?.toString() ?? 'php-cgi';
    if (php !== 'php-cgi' && !path.isAbsolute(php))
        php = path.join(__dirname, php);
    const file = typeof arg === 'string' ? arg : arg.file;
    if (!command_exists_1.default.sync(php))
        throw new Error('PHP compiler path is incorrect {options->php}');
    if (!file || !fs.existsSync(file))
        throw new Error('PHP file path is incorrect {options->file | path}');
    return (req, res) => {
        return new Promise((resolve, reject) => {
            let CONTENT_TYPE = req.headers['content-type'];
            let CONTENT_LENGTH = req.headers['content-length'];
            let body = null;
            if (!req.readable && 'body' in req) {
                if (typeof req.body === 'string')
                    body = Buffer.from(req.body);
                else if (req.body instanceof Buffer)
                    body = req.body;
                else if (typeof req.body === 'object' && Object.getOwnPropertyNames(req.body).length) {
                    if (req.is('application/x-www-form-urlencoded')) {
                        body = Buffer.from(Object.entries(req.body).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&').replace(/%20/g, '+'));
                    }
                    else {
                        body = Buffer.from(JSON.stringify(req.body));
                        CONTENT_TYPE = 'application/json';
                    }
                    CONTENT_LENGTH = body.length.toString();
                }
            }
            const env = {
                SCRIPT_FILENAME: file.toString(),
                REDIRECT_STATUS: arg.env?.REDIRECT_STATUS?.toString() ?? '200',
                AUTH_TYPE: arg.env?.AUTH_TYPE,
                CONTENT_LENGTH: arg.env?.CONTENT_LENGTH?.toString() ?? CONTENT_LENGTH,
                CONTENT_TYPE: arg.env?.CONTENT_TYPE ?? CONTENT_TYPE,
                GATEWAY_INTERFACE: arg.env?.GATEWAY_INTERFACE ?? 'CGI/1.1',
                HTTPS: arg.env?.HTTPS ?? ('encrypted' in req.socket ? 'On' : undefined),
                PATH_INFO: arg.env?.PATH_INFO ?? req.url?.replace(/\?.*?/, ''),
                PATH_TRANSLATED: arg.env?.PATH_TRANSLATED ?? file.toString(),
                QUERY_STRING: req.url?.includes('?') ? req.url?.replace(/.*?\?/, '') : '',
                REMOTE_ADDR: arg.env?.REMOTE_ADDR ?? req.headers['cf-connecting-ip'] ?? req.headers.forwarded?.split(',')[0],
                REMOTE_HOST: arg.env?.REMOTE_HOST,
                REMOTE_IDENT: arg.env?.REMOTE_IDENT,
                REMOTE_USER: arg.env?.REMOTE_USER,
                REQUEST_METHOD: arg.env?.REQUEST_METHOD ?? req.method,
                SERVER_ADDR: arg.env?.SERVER_ADDR ?? req.socket.localAddress,
                SERVER_NAME: arg.env?.SERVER_NAME ?? req.headers.host,
                SERVER_PORT: arg.env?.SERVER_PORT?.toString() ?? req.socket.localPort?.toString(),
                SERVER_PROTOCOL: arg.env?.SERVER_PROTOCOL ?? ('HTTP/' + req.httpVersion),
                SERVER_SOFTWARE: arg.env?.SERVER_SOFTWARE ?? 'Express'
            };
            const headers = {};
            for (const name in req.headers) {
                let header = req.headers[name];
                if (typeof header === 'object' || header === undefined)
                    continue;
                headers['HTTP_' + name.toUpperCase().replace(/-/g, '_')] = header;
            }
            Object.assign(env, headers);
            for (const name in arg.env) {
                if (name.startsWith('HTTP_'))
                    env[name] = arg.env?.[name];
            }
            const proc = child.spawn(php, {
                cwd: arg.cwd?.toString(),
                signal: arg.abort,
                timeout: arg.timeout ?? 0,
                env
            });
            proc.stdout.setEncoding('utf-8');
            proc.on('error', reject);
            proc.stdout.once('data', (data) => {
                proc.kill();
                const raw = data.toString().replace(/\r\n/g, '\n');
                const arr = raw.match(/(.*?)\n\n(.*)/s)?.slice(1) ?? ['', ''];
                const headers = Object.fromEntries(arr[0].split('\n').map(val => val.match(/(.*?): (.*)/)?.slice(1) ?? ['err', 'Parsing failed']));
                const body = arr[1];
                if (res) {
                    if (headers['Status']) {
                        const code = +headers['Status'].split(' ')[0];
                        if (code == 500)
                            return reject(new Error('Failed to compile PHP file'));
                        res.statusCode = code;
                    }
                    res.writeHead(200, headers).end(body);
                }
                resolve({ headers, body, raw });
            });
            if (body)
                proc.stdin.write(body);
            else
                req.pipe(proc.stdin, { end: true });
        });
    };
};
module.exports = compile;
