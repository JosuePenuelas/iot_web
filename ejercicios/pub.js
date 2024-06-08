var mqtt = require("mqtt")
var cliente = mqtt.connect("mqtt://localhost")

cliente.on("connect", function(){
    cliente.publish("iot", "Clase de iot!")
})