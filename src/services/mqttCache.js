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

}


const mqttCache = new MqttCache();
module.exports = mqttCache;
