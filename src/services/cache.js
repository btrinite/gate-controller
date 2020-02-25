var lastMessages = [];

class Cache  {

    constructor() {
    }

    checkIfAlreadySent (id, msg) {
        if ((lastMessages[id] == undefined) || (lastMessages[id].payload != msg.payload)) {
            lastMessages[id] = msg;
            return false;
        } else {
            return true;
        }
    }

    flush (id) {
        lastMessages[id] = {}
    }

    flushAll () {
        lastMessages = []
    }

    getLastPayload (id) {
        return lastMessages[id]
    }

}


const cache = new Cache();
module.exports = cache;
