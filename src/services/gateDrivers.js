const fs = require("fs");
const gateDriversDescr = JSON.parse(fs.readFileSync("assets/gateDrivers.json"));
const figures = JSON.parse(fs.readFileSync("assets/figures.json"));
require ("../../assets/colors.js")
const mqttBroker = require('../controllers/mqtt-broker/mqtt-broker');
const ledCache = require('./led-cache');

global.GATE={}
global.GATE.CONNECTED="connected"
global.GATE.DISCONNECTED="disconnected"
global.GATE.SUBSCRIBED="subscribed"
global.GATE.UNSUBSCRIBED="unsubscribed"

class GateDrivers  {

    constructor() {
      this.driversState={}
      for (const drv of gateDriversDescr) {
        this.driversState[drv.id] = {state:GATE.DISCONNECTED}
      }
    }

    resolveMac2ID (mac) {
      return gateDriversDescr.findIndex((aGate)=>{return (aGate.mac===mac)})
    }

    resolveId2Mac (id) {
      return gateDriversDescr.findIndex((aGate)=>{return (aGate.id===id)})
    }

    setDriverState (mac, state) {
      const drvId = this.resolveMac2ID (mac)
      if (drvId>=0) {
        this.driversState[drvId].state = state
      }
    }

    msgFactory(id, msg) {
      var idx = this.resolveId2Mac(id)
      if (idx>=0) {
        return {
          topic: `/${gateDriversDescr[idx].mac}`,
          payload: msg,
          qos: 0, // 0, 1, or 2
          retain: false // or true
          };  
      } else {
        return undefined
      }
    }

    rePublishLast (id) {
      const payload = ledCache.getLastPayload(id)
      if (payload!=undefined) {
        const message = this.msgFactory (id, payload)
        mqttBroker.publish(message)  
      };  
    }

    publish(id, payload) {
      if (ledCache.checkIfAlreadySent (id, payload)) {
        return
      }            
      const message = this.msgFactory (id, payload)
      mqttBroker.publish(message)  
    }

    update (id, figure, anim) {
      const gate = gateDriversDescr.findIndex((aGate)=>{return (aGate.id===id)})
      if (gate >=0) {
        for ( const [idx, fig] of figures[figure].segments.entries() ) {
          const msg = `${idx},${segment2color[fig].r},${segment2color[fig].g},${segment2color[fig].b},255,${anim2value[anim]}`
          this.publish(id, msg)
        }
      }
    }
}

const gateDrivers = new GateDrivers();
module.exports = gateDrivers;

