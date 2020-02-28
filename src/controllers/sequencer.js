const EventEmitter = require('events');
const fs = require("fs");
const { promisify } = require('util')

const readDirAsync = promisify(fs.readdir)
const readFileAsync = promisify(fs.readFile)

const gateDrivers = require('../services/gateDrivers')
const mqttBroker = require('../controllers/mqtt-broker/mqtt-broker');
const mqttCache = require('./mqttCache');

const SEQDIR="./assets/sequences/"

class Sequencer extends EventEmitter {

    constructor() {
        super();
        this.currentSerquence=0
        this.timer=null
        this.maxSequence=0
        this.availableSequences = []
        this.selectedSequence = 0
    }

    msgSeqFactory(payload) {
        var msg  =  {
          topic: `/sequence`,
          payload: JSON.stringify(payload),
          qos: 0, // 0, 1, or 2
          retain: false // or true
          };  
  
        return msg
    }

    rewindSequence() {
        this.currentSerquence=0
    }

    incSequence() {
        this.currentSerquence=(this.currentSerquence+1) % (this.maxSequence) 
    }
    sleep(ms) {
        return new Promise(resolve => this.timer=setTimeout(resolve, ms));
    }

    cancelSleep() {
        if (this.timer != null) {
            clearTimeout(this.timer)
        }
    }

    pushSequence () {
        this.emit('sequence');    
    }

    async runCurrentSequence() {
        const subset = this.availableSequences[this.selectedSequence].sequences[this.currentSerquence]
        console.log (`Running sequence ${this.currentSerquence} ${subset}`)
        for (const aStep of this.availableSequences[this.selectedSequence].subsets[subset].sequences) {
            console.log (aStep)
            switch (aStep.type) {
                case 'pause':
                    await this.sleep(aStep.delay);
                break;
                case 'figure':
                    gateDrivers.update(aStep.id, aStep.figure, aStep.anim)
                break;
                case 'nextOnTimeout':
                        await this.sleep(aStep.delay);
                        setTimeout (()=>{this.nextStep()},10);
                break;
                case 'restartOnTimeout':
                        await this.sleep(aStep.delay);
                        setTimeout (()=>{this.init()},10);
                break;

            }
        }
    }

    async init () {
        this.rewindSequence()
        this.cancelSleep()
        await this.runCurrentSequence()
    }

    async nextStep () {
        this.cancelSleep()
        this.incSequence()
        await this.runCurrentSequence()
    }

    cmd(cmd) {
        switch (cmd) {
            case 'step':
                this.nextStep();
                break;
            case 'init':
                this.init();
                break;
            case 'nextSeq':
                this.selectNextSequenceSet();
                break;
            }
    }
    async getAvailableSequences() {
        const items = await readDirAsync(SEQDIR)       
        for (var i=0; i<items.length; i++) {
            if (items[i].indexOf('.json')) {
                console.log("Sequence : Loading "+items[i]);
                const data = await readFileAsync(SEQDIR+items[i])
                this.availableSequences.push(JSON.parse(data))
            }
        }        
    }

    publish (msg) {
        if (mqttCache.checkIfAlreadySent (msg)) {
          return
        }
        mqttBroker.publish(msg)  
      }
  
    initSequence(){
        this.maxSequence=this.availableSequences[this.selectedSequence].sequences.length
        this.init()
        const payload={selectedSeq: this.availableSequences[this.selectedSequence].title}
        const message = this.msgSeqFactory(payload)
        this.publish(message)  
    }

    selectNextSequenceSet() {
        this.selectedSequence = (this.selectedSequence+1)%this.availableSequences.length;
        this.initSequence()
    }
}
const sequencer = new Sequencer();
module.exports = sequencer;

