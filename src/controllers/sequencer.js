const EventEmitter = require('events');
const fs = require("fs");

const sequence = JSON.parse(fs.readFileSync("assets/sequences/sequence.json"));
const gateDrivers = require('../services/gateDrivers')
const SEQDIR="./assets/sequences/"

class Sequencer extends EventEmitter {

    constructor() {
        super();
        this.currentSerquence=0
        this.timer=null
        this.maxSequence=sequence.sequences.length
        this.availableSequences = []
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
        const subset = sequence.sequences[this.currentSerquence]
        console.log (`Running sequence ${this.currentSerquence} ${subset}`)
        for (const aStep of sequence.subsets[subset].sequences) {
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
            }
    }
    getAvailableSequences() {
        fs.readdir(SEQDIR, (err, items) => {         
            for (var i=0; i<items.length; i++) {
                if (items[i].indexOf('.json')) {
                    console.log("Sequence : Loading "+items[i]);
                    fs.readFile(SEQDIR+items[i], (err, data) => {
                        this.availableSequences.push(JSON.parse(data))
                    })
                }
            }        
        })
    }

    selectSequences() {
    }
}
const sequencer = new Sequencer();
module.exports = sequencer;

