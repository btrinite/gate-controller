class Brightness  {


    constructor() {
        this.defaultBrightness=200
    }

    getDefaultBrightness() {
        return this.defaultBrightness    
    }

    setDefaultBrightness(newDefaultBrightrness) {
        this.defaultBrightness=newDefaultBrightrness
    }

}

const brightness = new Brightness();
module.exports = brightness;
