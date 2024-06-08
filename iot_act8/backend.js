const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt'); // Importa la librería MQTT
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

var sensor1 = 0;
var sliderVal = 0;

// Configura la conexión MQTT
const mqttClient = mqtt.connect('mqtt://192.168.0.102'); // Reemplaza 'mqtt-broker-address' con la dirección de tu broker MQTT

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  // Maneja mensajes enviados por el cliente WebSocket
  ws.on('message', (message) => {
    console.log(`Mensaje recibido desde el cliente WebSocket: ${message}`);
    const messageString = String(message); // Convertir a cadena explícitamente
    const [identifier, value] = messageString.split(':');
    if (identifier === "sensor1") {
      sensor1 = value;
    } else if (identifier === "Slider") {
      sliderVal = value;
      mqttClient.publish("control_servoMotor", sliderVal); // Publica el valor del slider a MQTT
    }
  });

  // Maneja la desconexión del cliente WebSocket
  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Manejo de mensajes recibidos desde MQTT
mqttClient.on('message', (topic, message) => {
  console.log(`Mensaje MQTT recibido en el tema ${topic}: ${message}`);

  // Procesa los mensajes MQTT recibidos y realiza acciones según el tema
  if (topic === 'sensor1' && sensor1 == 1) {
    // Acción cuando se recibe datos del sensor #1
    const sensorData = parseInt(message);
    sendDataToMongoDB(sensorData);
  } else if (topic === 'sensor2') {
    // Acción cuando se recibe datos del sensor #2
    sendSensor2ValueToClient(message);
  } else if (topic === 'sensor3') {
    // Acción cuando se recibe datos del sensor #3
    handleSensor3Value(message);
  }
});

// Conecta el cliente MQTT al broker
mqttClient.on('connect', () => {
  console.log('Conexión MQTT establecida');

  // Suscribe el cliente MQTT a los temas relevantes
  mqttClient.subscribe('sensor1');
  mqttClient.subscribe('sensor2');
  mqttClient.subscribe('sensor3');
  mqttClient.publish("control_servoMotor", sliderVal);
});

// Función para enviar datos del sensor #1 a MongoDB
async function sendDataToMongoDB(data) {
  try {
    // Conectarse a la base de datos MongoDB
    const client = new MongoClient('mongodb+srv://josuepenuelas:vMAAaHM1AqborwBo@iot.rfsuris.mongodb.net/?retryWrites=true&w=majority&appName=iot');
    await client.connect();
    console.log('Conexión a MongoDB Atlas establecida');

    // Seleccionar la base de datos y la colección
    const db = client.db('iot');
    const collection = db.collection('datos_sensor1');

    // Insertar los datos en la colección
    const result = await collection.insertOne({ sensor1: data });
    console.log('Datos del sensor #1 insertados en MongoDB:', result);

    // Cerrar la conexión con MongoDB
    await client.close();
  } catch (error) {
    console.error('Error al insertar datos en MongoDB:', error);
  }
}

// Función para enviar el valor del sensor #2 al cliente WebSocket
function sendSensor2ValueToClient(value) {
  // Envía el valor al cliente WebSocket
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`sensor2: ${value}`);
    }
  });
}

// Función para manejar el valor del sensor #3 y activar el LED
function handleSensor3Value(value) {
  if (parseInt(value) > 40) { // Reemplaza 'threshold' con el valor límite
    // Activar el LED
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`sensor3: ${1}`);
      }
    });
  } else {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`sensor3: ${0}`);
      }
    });
  }
}

// Inicia el servidor HTTP
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
