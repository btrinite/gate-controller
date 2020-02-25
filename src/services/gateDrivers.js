const fs = require("fs");
const gateDriversDescr = JSON.parse(fs.readFileSync("assets/gateDrivers.json"));
const figures = JSON.parse(fs.readFileSync("assets/figures.json"));
require ("../../assets/colors.js")
const mqttBroker = require('../controllers/mqtt-broker/mqtt-broker');
const cache = require('./cache');

global.GATE={}
global.GATE.CONNECTED="connected"
global.GATE.DISCONNECTED="disconnected"
global.GATE.SUBSCRIBED="subscribed"
global.GATE.UNSUBSCRIBED="unsubscribed"

class GateDrivers  {

    constructor() {
      this.driversState={}
      for (const [idx, drv] of gateDriversDescr.entries()) {
        this.driversState[idx] = {state:GATE.DISCONNECTED}
      }
    }

    resolveMac2ID (mac) {
      return gateDriversDescr.findIndex((aGate)=>{return (aGate.mac===mac)})
    }

    resolveId2Mac (id) {
      return gateDriversDescr.findIndex((aGate)=>{return (aGate.id===id)})
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

    msgStatusFactory(id, msg) {
      var msg  =  {
        topic: `/status}`,
        payload: ``,
        qos: 0, // 0, 1, or 2
        retain: false // or true
        };  

      for (const aGate of gateDriversDescr) {
        msg.payload.concat(`"id":"${aGate.id}","state":"${this.driversState[aGate.id]}"`)
      }
      return msg
    }

    setDriverState (mac, state) {
      const drvId = this.resolveMac2ID (mac)
      if (drvId>=0) {
        console.log (`GateDrivers : ${drvId} switched to state ${state}`)
        this.driversState[drvId].state = state
      }
      const message = this.msgStatusFactory()
      mqttBroker.publish(message)  
    }

    rePublishLast (id) {
      const msg = cache.getLastPayload(id)
      if (msg!=undefined) {
        mqttBroker.publish(msg)  
      };  
    }

    publishToGate(id, payload) {
      const msg = this.msgFactory (id, payload)
      this.publish(msg)
    }

    publish (id, msg) {
      if (cache.checkIfAlreadySent (id, msg)) {
        return
      }
      mqttBroker.publish(msg)  
    }

    update (id, figure, anim) {
      const gate = gateDriversDescr.findIndex((aGate)=>{return (aGate.id===id)})
      if (gate >=0) {
        var msg=''
        for ( const [idx, fig] of figures[figure].segments.entries() ) {
          msg = msg.concat(`${idx},${segment2color[fig].r},${segment2color[fig].g},${segment2color[fig].b},255,${anim2value[anim]};`)
        }
        this.publishToGate(id, msg)
      }
    }
}

const gateDrivers = new GateDrivers();
module.exports = gateDrivers;

