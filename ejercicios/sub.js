var mqtt = require("mqtt")
var cliente = mqtt.connect("mqtt://127.0.0.1")

cliente.on("connect", function(){
    cliente.subscribe("casa")
})

cliente.on("message", function(tema, dato){
    console.log(dato.toString())
    //cliente.end()
})