const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Clase del IoT')
})

app.listen(3000)