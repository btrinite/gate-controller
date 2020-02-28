const mqttBroker = require('../controllers/mqtt-broker/mqtt-broker');

//Message cache, per topics
var lastMessages = [];

class MqttCache  {

    constructor() {
    }

    checkIfAlreadySent (msg) {
        if (lastMessages[msg.topic] == undefined ||  (lastMessages[msg.topic].payload != msg.payload)) {
            lastMessages[msg.topic] = msg;
            return false;
        } else {
            return true;
        }
    }

    flushTopic (topic) {
        lastMessages[topic] = {}
    }

    flushAll () {
        for (topic of lastMessages) {
            this.flushTopic(topic)
        }     
    }

    getLastPayload (topic) {
        return lastMessages[topic]
    }


    rePublishLast (topic) {
        const msg = this.getLastPayload(topic)
        if (msg!=undefined) {
            mqttBroker.publish(msg)  
        };
    }

}


const mqttCache = new MqttCache();
module.exports = mqttCache;
