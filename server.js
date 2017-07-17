// @flow

const server = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const pipe = (...fns) => val => fns.reduce((prevValue, fn) => fn(prevValue), val);
const plusRate = rate => x => x + rate;
const multipleBy = ratio => value => ratio * value;

server
  .createServer((req, res) => {
    const { url } = req;
    console.log(url);
    switch (url) {
      case '/api/v1/items':
        const coordinates = {
          width: pipe(multipleBy(10), plusRate(1), Math.floor)(Math.random()),
          height: pipe(multipleBy(10), plusRate(5), Math.floor)(Math.random())
        };
        res.end(JSON.stringify(coordinates));
        break;
      case '/pictures':
        fs.createReadStream(path.join('index.html')).pipe(res);
        break;
      default:
        if (url.includes('jpg') || url.includes('png')) {
          res.setHeader('Content-type', mime.lookup(path.join(__dirname, url)));
          fs.createReadStream(path.join(__dirname, url)).pipe(res);
        } else {
          res.statusCode = 204;
          res.end('not allowed');
        }
    }
  })
  .listen(process.env.PORT || 3000, err => {
    if (err) console.log(err);
    console.log('server running at %s', process.env.PORT || 3000);
  });
