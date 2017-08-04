// @flow

require('newrelic');
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
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(coordinates));
        break;
      case '/api/v1/pictures':
        const filePath = path.resolve(__dirname, 'static');
        res.setHeader('Access-Control-Allow-Origin', '*');
        fs.readdir(filePath, (err, files) => {
          res.end(JSON.stringify(files.map(file => `static/${file}`)));
        });
        break;
      default:
        if (url.match(/\.(png|jpg)$/)) {
          const filePath = path.join(__dirname, url);
          fs.stat(filePath, (error, stat) => {
            if (error) {
              res.statusCode = 404;
              res.end('not found');
              return;
            }
            res.writeHead(200, {
              'Content-Type': mime.lookup(filePath),
              'Content-Length': `${stat.size}`,
              'Access-Control-Allow-Origin': '*'
            });
            fs.createReadStream(filePath).pipe(res);
          });
        } else {
          res.statusCode = 204;
          res.end('not allowed');
        }
    }
  })
  .listen(process.env.PORT || '3000', err => {
    if (err) console.log(err);
    console.log('server running at %s', process.env.PORT || 3000);
  });
