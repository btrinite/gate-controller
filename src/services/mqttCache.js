//Message cache, per client and per topics

var lastMessages = [];

class MqttCache  {

    constructor() {
    }

    checkIfAlreadySent (clientId, msg) {
        if (lastMessages[id] == undefined){
            lastMessages[id]=[]
        }
        if (lastMessages[id][msg.topic] == undefined || (lastMessages[id][msg.topic].payload != msg.payload)) {
            lastMessages[id][msg.topic] = msg;
            return false;
        } else {
            return true;
        }
    }

    flushTopic (id, topic) {
        lastMessages[id][topic] = {}
    }

    flushCLient (id) {
        for (topic of lastMessages[id])
        {
            this.flushTopic(id, topic)
        }
    }


    flushAll () {
        for (client of lastMessages[id]) {
            this.flushCLient(client)
        }     
    }

    getLastPayload (id, topic) {
        return lastMessages[id][topic]
    }

}


const mqttCache = new MqttCache();
module.exports = mqttCache;
