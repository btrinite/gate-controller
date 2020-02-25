// MQTT Local server w/o DB Storage
const mosca = require("mosca");
const EventEmitter = require('events');
const cache = require('../../services/cache')


var moscaSettings = {
    port: 1883,
    persistence:
    {
        factory:mosca.persistence.Memory
    }  
};
  
class MqttBroker extends EventEmitter {
    constructor() {
        super();
      }
 
    connect() { 
        this.server = new mosca.Server(moscaSettings, function() {
            console.log("MQTT Broker : Broker is up and running");
        })
        this.server.on("ready", () => {
            //console.log ("MQTT Stack is ready")
            this.emit('ready');    
        });
        this.server.on("clientConnected", client => {
            if (client != undefined && client.id != undefined) {
                //console.log("MQTT Broker : New connection from client :" + client.id);
                this.emit('clientConnected', client.id);    
            }
        });
        this.server.on("clientDisconnected", client => {
            if (client != undefined && client.id != undefined) {
                //console.log("MQTT Broker : New connection from client :" + client.id);
                this.emit('clientDisconnected', client.id);    
            }
        });
        this.server.on("subscribed", (topic, client) => {
            if (client != undefined && client.id != undefined) {
                //console.log("MQTT Broker : client disconnected :" + client.id);
                this.emit('subscribed', topic, client.id); 
            }
        });
        this.server.on("published", (packet, client) => {
            if (packet != undefined) {
                //console.log("MQTT Broker : New msg published :" + packet.topic + " " + packet.payload);
                this.emit('published', packet.topic, packet.payload);    
            }
        });
    };

    publish (message) {
        if (message !=undefined) {
            this.server.publish(message, function() {});
        }
    }
}
  

const mqttBroker = new MqttBroker()

module.exports = mqttBroker;