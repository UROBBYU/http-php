# HTTP ⇆ PHP Middleware

[![version](https://badgen.net/npm/v/http-php?label=version&icon=npm)](https://www.npmjs.com/package/http-php)
[![install size](https://badgen.net/packagephobia/install/http-php?color=yellow&icon=packagephobia)](https://packagephobia.com/result?p=http-php)
![types](https://badgen.net/npm/types/http-php?color=green&icon=typescript)

This module uses PHP CGI to compile file output.

## Features

- Accepts parsed request bodies;
- Returns response body, headers and error output separately;
- Supports cookies and custom headers;
- You can pass custom args as env variable.

More explanations in JSDoc.

## Installation

You can install it with [npm](https://www.npmjs.com/):

```
npm i http-php
```

You also need PHP-CGI to be already [installed](https://www.php.net/install) and preferably [configured](https://www.php.net/manual/en/faq.installation.php#faq.installation.addtopath) in the `PATH`.

## Usage

First of all, add module with:

```js
const php = require('http-php');
```

Then, create file compiler:

```js
const file_php = php('path/to/file.php');
```

or

```js
const file_php = php({
    file: 'path/to/file.php', // Path to PHP file
    php: 'php-cgi', // (Optional) Path to PHP compiler
    cwd: './', // (Optional) Current working directory
    abort: someAbortSignal, // (Optional) AbortSignal which can stop compilation process
    timeout: 500, // (Optional) In milliseconds the maximum amount of time the process is allowed to run
    env: { // (Optional) PHP Environment variables
        ARGS: JSON.stringify({
            arg1: 'Ohayo ',
            arg2: 'Sekai!'
        })
        // ... there are more variables explained in JSDoc
    }
});
```

Compiler accepts `request` and optionally `response` parameters and returns compiled php file data as a promise.

## Examples

### Full example of express server with `/path` as a PHP route:

```js
const file_php = require('http-php')({
    file: 'path/to/file.php',
    timeout: 1000,
    env: {
        REDIRECT_STATUS: 300
    }
});

require('express')
.all('/path', async (req, res, next) => {
    let { body: page } = await file_php(req).catch(next); // Returns compiler output as a string
    // Do something with page
    page = page.replace('<title>Old Title</title>', '<title>New Title</title>');
    res.send(page);
})
.listen(80);
```

You can also simplify router declaration by one-lining it:

```js
require('express')()
.all('/path', require('http-php')('path/to/file.php'))
.listen(80);
```

This shortcut is useful when you don't need to change content of the compiled page.

### It also works for basic HTTP server:

```js
require('http')
.createServer(require('http-php')('path/to/file.php'))
.listen(80);
```

*Same for HTTPS*.