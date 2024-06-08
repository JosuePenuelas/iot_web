const express = require("express");
const app = express();
const WebsocketServer = require("ws").Server;


/**Websocket**/
let ws_server = new WebsocketServer({ port: 40150 });
ws_server.on("connection", function (ws, req) {
  console.log("Cliente conectado: ", req.socket.remoteAddress);

  //  Mensajes
  ws.on("message", (data) => {
    const msg = JSON.parse(data);
   
    console.log(msg);
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

/**Servidor**/
app.listen(8080, () => {
  console.log("Servidor en: 8080");
});
app.use(express.static("public"));
//  Ruteo
app.use((req, res) => {
  res.sendFile("./frontsend.html", { root: __dirname });
});


//  Function para recivir del Cliente html
function actualizarLED(value) {
  ws_server.clients.forEach((client) => {
    
    const Estructura = {
      clave: "RadonBtn",
      valor: Estado_Click,
    };
    
    console.log("Send message: ", JSON.stringify(Estructura));
  });
}

