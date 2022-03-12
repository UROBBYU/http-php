# Express PHP Middleware

[![version](https://badgen.net/npm/v/express-php-middleware?label=version&icon=npm)](https://www.npmjs.com/package/express-php-middleware)
[![install size](https://badgen.net/packagephobia/install/express-php-middleware?color=yellow&icon=packagephobia)](https://packagephobia.com/result?p=express-php-middleware)
![types](https://badgen.net/npm/types/express-php-middleware?color=green&icon=typescript)

This module uses PHP CGI to compile file output. It also accepts parsed request bodies and returns body with headers. Cookies and custom headers are also supported.

## Installation

You can install it with [npm](https://www.npmjs.com/):

```
npm i express-php-middleware
```

You also need PHP to be already [installed](https://www.php.net/install) and [configured](https://www.php.net/manual/en/faq.installation.php#faq.installation.addtopath) in the `PATH`.

## Usage

First of all, add module with:

```js
const php = require('express-php-middleware');
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
        REDIRECT_STATUS: 201
        // ... there are more variables explained in JSDoc
    }
});
```

Compiler accepts `request` and optionally `response` parameters and returns compiled php file data as a promise.

## Examples

### Full example of express server with `/path` as a PHP route:

```js
const express = require('express');
const app = express();
const php = require('express-php-middleware');

const file_php = php({
    file: 'path/to/file.php',
    timeout: 1000,
    env: {
        REDIRECT_STATUS: 300
    }
});

app.get('/path', async (req, res, next) => {
    let { body: page } = await file_php(req).catch(next); // Returns compiler output as a string
    // Do something with page
    page = page.replace('<title>Old Title</title>', '<title>New Title</title>');
    res.send(page);
});

app.listen(80);
```

You can also simplify router declaration by one-lining it:

```js
const express = require('express');
const app = express();

app.get('/path', require('express-php-middleware')('path/to/file.php'));

app.listen(80);
```

This shortcut is useful when you don't need to change content of the compiled page.