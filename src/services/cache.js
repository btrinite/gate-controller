var lastMessages = [];

class Cache  {

    constructor() {
    }

    checkIfAlreadySent (id, payload) {
        if (lastMessages[id] != payload) {
            lastMessages[id] = payload;
            return false;
        } else {
            return true;
        }
    }

    flush (id) {
        lastMessages[id] = ""
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
