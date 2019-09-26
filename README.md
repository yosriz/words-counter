# Words Counter

### Install

Redis is required for using the service.


Installing 

`npm install`

Launching server

`npm start`

Run tests

`npm test`

### Examples

Count a raw string as input:

`curl -d '{ "rawString": "bla bla bla" }' -H "Content-Type: application/json" -X POST http://localhost:3000/counter`

Count file with file as input:

`curl -d '{ "filepath": "path to file" }' -H "Content-Type: application/json" -X POST http://localhost:3000/counter`

Count file with url as input:

`curl -d '{ "url": "some url" }' -H "Content-Type: application/json" -X POST http://localhost:3000/counter`

Get appearances number:

`curl http://localhost:3000/stats\?word\=bla`

