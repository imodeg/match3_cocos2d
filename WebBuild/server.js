var express = require('express');
var app = express();
var path = require('path');

app.use(require('express').static(__dirname + '/'));

app.get('/', function (req, res)
{
  //res.sendFile('index.html');
  res.sendFile('index.html', {root: __dirname});
});

app.listen(3000, function ()
{
  console.log('Start server!');
});
