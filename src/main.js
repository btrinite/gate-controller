require('dotenv').config()
const mqttBroker = require('./controllers/mqtt-broker/mqtt-broker');
const sequencer = require('./controllers/sequencer')

mqttBroker.on ('clientConnected', (client_id) => {
  console.log ("New MQTT connection from "+resolveLed.resolveStripId2Name(client_id));
  gateDrivers.setDriverState(client_id, GATE.CONNECTED)
})

mqttBroker.on ('subscribed', (topic, client_id) => {
  console.log (`New MQTT subscription to topic ${topic} from client ${resolveLed.resolveStripId2Name(client_id)}`);
  gateDrivers.setDriverState(client_id, GATE.SUBSCRIBED)
})

mqttBroker.on ('clientDisconnected', (client_id) => {
  console.log ("Lost MQTT connection for "+resolveLed.resolveStripId2Name(client_id));
  gateDrivers.setDriverState(client_id, GATE.DISCONNECTED)
})

mqttBroker.on ('unsubscribed', (topic, client_id) => {
  console.log (`MQTT subscription to topic ${topic} lost for ${resolveLed.resolveStripId2Name(client_id)}`);
  gateDrivers.setDriverState(client_id, GATE.UNSUBSCRIBED)
})


mqttBroker.on ('published', (topic, payload) => {
  var topicTokens = topic.split('/');
  switch (topicTokens[1]) {
    case 'status':
        console.log ("SYS: Rx event status from "+resolveLed.resolveStripId2Name(topicTokens[2]))
        console.log (payload.toString());
        break;
  }
})

mqttBroker.on ('ready', () => {
  console.log ("Starting sequencer")
  sequencer.init();
});

mqttBroker.connect();
