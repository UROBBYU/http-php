/// <reference types="node" />


import fs = require('fs');
import express = require('express');


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
     * Just like CONTENT_TYPE provides the data or MIME type that is delivered, the HTTP_ACCEPT lists all the possible MIME types that a client making the request can accept. The list of types is separated by commas.
     *
     * **Evaluated automatically.**
     */
    HTTP_ACCEPT?: string;
    /**
     * Contents of the Accept-Charset: header from the current request, if there is one.
     *
     * Example: 'iso-8859-1,*,utf-8'.
     *
     * **Evaluated automatically.**
     */
    HTTP_ACCEPT_CHARSET?: string;
    /**
     * Contents of the Accept-Encoding: header from the current request, if there is one.
     *
     * Example: 'gzip'.
     *
     * **Evaluated automatically.**
     */
    HTTP_ACCEPT_ENCODING?: string;
    /**
     * The address of the page (if any) which referred the user agent to the current page. This is set by the user agent.
     *
     * **Evaluated automatically.**
     */
    HTTP_REFERER?: string;
    /**
     * The HTTP_USER_AGENT gives the name of the program that a client uses to send the request. For example, if a user executes a CGI script from Mozilla Firefox, the HTTP_USER_AGENT would indicate that the user made a request to the web server through Firefox.
     *
     * **Evaluated automatically.**
     */
    HTTP_USER_AGENT?: string;
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
};


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
        [title: string]: string;
    };
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
    body: string;
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
    raw: string;
};


type Execute = {
    /**
     * Request handler.
     *
     * ### Example:
     * ```js
     * const php_cmd = require('express-php-middleware');
     * const file_php = php_cmd('path/to/file.php');
     *
     * app.get('/path', async (req, res) => {
     *    let { body: page } = await file_php(req);
     *    // Do something with page
     *    res.send(page);
     * });
     * ```
     */
    (/** - Express' request object. */ request: express.Request): Promise<PHPData>;
    /**
     * If `res` parameter is passed, will automatically respond with `text/html` generated from request.
     *
     * ### Example:
     * ```js
     * app.post('/path', require('express-php-middleware')('path/to/file.php'));
     * ```
     */
    (/** - Express' request object. */ request: express.Request, /** - Express' response object. */ response: express.Response): Promise<PHPData>;
};


type Compile = {
    /**
     * Creates a PHP compiler process.
     *
     * ### Example #1:
     * ```js
     * const php_cmd = require('express-php-middleware');
     * const file_php = php_cmd('path/to/file.php');
     *
     * app.get('/path', async (req, res) => {
     *    let { body: page } = await file_php(req);
     *    // Do something with page
     *    res.send(page);
     * });
     * ```
     *
     * ### Example #2:
     * ```js
     * app.post('/path', require('express-php-middleware')('path/to/file.php'));
     * ```
     */
    (/** - Path to the PHP file which will be passed to compiler. */ path: string): Execute;
    /**
     * Creates a PHP compiler process.
     *
     * ### Example #1:
     * ```js
     * const php_cmd = require('express-php-middleware');
     * const file_php = php_cmd({
     *    file: 'path/to/file.php',
     *    cwd: 'other/directory/',
     *    env: {
     *       REDIRECT_STATUS: 201
     *    }
     * });
     *
     * app.get('/path', async (req, res) => {
     *    let { body: page } = await file_php(req);
     *    // Do something with page
     *    res.send(page);
     * });
     * ```
     *
     * ### Example #2:
     * ```js
     * app.post('/path', require('express-php-middleware')({ file: 'path/to/file.php' }));
     * ```
     */
    (/** - Compilation options. `file` property must be specified. */ options: Options): Execute;
};


declare const compile: Compile;


export = compile;
