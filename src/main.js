require('dotenv').config()
const mqttBroker = require('./controllers/mqtt-broker/mqtt-broker');
const sequencer = require('./controllers/sequencer')
const gateDrivers  = require('./services/gateDrivers')

mqttBroker.on ('clientConnected', (client_id) => {
  console.log ("New MQTT connection from "+client_id);
  gateDrivers.setDriverState(client_id, GATE.CONNECTED)
})

mqttBroker.on ('subscribed', (topic, client_id) => {
  console.log (`New MQTT subscription to topic ${topic} from client ${client_id}`);
  gateDrivers.setDriverState(client_id, GATE.SUBSCRIBED)
  gateDrivers.rePublishLast(client_id)
})

mqttBroker.on ('clientDisconnected', (client_id) => {
  console.log ("Lost MQTT connection for "+client_id);
  gateDrivers.setDriverState(client_id, GATE.DISCONNECTED)
})

mqttBroker.on ('unsubscribed', (topic, client_id) => {
  console.log (`MQTT subscription to topic ${topic} lost for ${client_id}`);
  gateDrivers.setDriverState(client_id, GATE.UNSUBSCRIBED)
})


mqttBroker.on ('published', (topic, payload) => {
  var topicTokens = topic.split('/');
  switch (topicTokens[1]) {
    case 'status':
        console.log ("SYS: Rx event status from "+topicTokens[2])
        console.log (payload.toString());
        break;
    case 'cmd':
        console.log ("SYS: Rx event cmd from "+topicTokens[2])
        console.log (payload.toString());
        const cmd = JSON.parse(payload)
        sequencer.cmd(cmd.cmd)
        break;
    }
})

mqttBroker.on ('ready', () => {
  console.log ("Starting sequencer")
  sequencer.init();
  await sequencer.getAvailableSequences();
  sequencer.initSequence();
});

mqttBroker.connect();
