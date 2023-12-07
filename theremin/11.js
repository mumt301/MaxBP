"use strict";

var oscillator;  //  We make the oscillator object as global
var reverb;  //  We make the reverb effect object as global
var autotune = false;  //  we set autotune to false by default
const userGestureEvents = [
    'click',
    'contextmenu',
    'auxclick',
    'dblclick',
    'mousedown',
    'mouseup',
    'pointerup',
    'touchend',
    'keydown',
    'keyup',
];

var userInteraction = false;
const unlockAudio = (e) => {
    console.log("EVENT : "+e);
    userGestureEvents.forEach(eventName => {
        userInteraction = true;
        document.removeEventListener(eventName, unlockAudio);
    });
};


// Turn theremin on
function thereminOn(oscillator) {
    oscillator.play();
    // console.log("USER INTERACTION : "+userInteraction);
    if( userInteraction == false ) { window.alert("Please click on the page before playing so the browser can enable audio playback."); }
}

// Control the theremin
function thereminControl(e, oscillator, theremin) {
    let x = e.offsetX;
    let y = e.offsetY;
    // console.log(x, y);

    let minFrequency = 220.0;
    let maxFrequency = 880.0;
    let freqRange = maxFrequency - minFrequency;
    let thereminFreq = minFrequency + (x / theremin.clientWidth) * freqRange;
    let thereminFreqRound = thereminFreq.toFixed(2);
    let thereminVolume = 1.0 - (y / theremin.clientHeight);

    if( autotune ) {
        var midiNote = Math.floor( frequencyToMidi(thereminFreq) );
        thereminFreq = midiToFrequency(midiNote, 440);
    }
    oscillator.frequency = thereminFreq;
    var frequency = document.querySelector('#frequency .info');
    frequency.innerHTML = thereminFreqRound;

    oscillator.volume = thereminVolume;
    var volumeElement = document.querySelector('#volume .info');
    var volumeValue = Math.round( thereminVolume * 10 );
    volumeElement.innerHTML = volumeValue;

    var noteNameFromFrequency = noteFromFrequency(thereminFreq, true);
    var noteName = document.querySelector('#note-name .info');
    noteName.innerHTML = noteNameFromFrequency;
}

// Turn theremin off
function thereminOff(oscillator) {
    oscillator.stop();
}

//  Runs a new instance of Oscillator when we change options
function startNewOscillator(waveType) {
    // Instantiate a sine wave with pizzicato.js
    oscillator = new Pizzicato.Sound({
        source: 'wave',
        options: {
            type: waveType,
            frequency: 220
        }
    });    
}

function startEffect(effectType) {
    reverb = new Pizzicato.Effects.Reverb({
        time: 1,
        decay: 0.8,
        reverse: true,
        mix: 0.5
    });
    oscillator.addEffect(reverb);
}



function runAfterLoadingPage() {
    startNewOscillator('sine');

    userGestureEvents.forEach(eventName => {
        document.addEventListener(eventName, unlockAudio);
    });
        
    // Get the theremin div from the html
    const theremin = document.getElementById("thereminZone");


    // Theremin plays when the mouse enters the theremin div
    theremin.addEventListener("mouseenter", function () {
        thereminOn(oscillator);
    });
    // Theremin is controlled while the mouse is inside the theremin div
    theremin.addEventListener("mousemove", function (e) {
        thereminControl(e, oscillator, theremin);
    });    
    // Theremin stops when the mouse leaves the theremin div
    theremin.addEventListener("mouseleave", function () {
        thereminOff(oscillator);
    });


    //  Detects if NOTE checkbox changes
    let chromatic = document.getElementById("autotune");
    chromatic.addEventListener( "change", () => {
        if ( chromatic.checked ) {
            autotune = true;
        } else {
            autotune = false;
        }
     });


    //  Detects if wave type radio changes
    //  If so we restart our Oscillator accordingly
    var waves = document.querySelectorAll('input[type=radio][name="wave-type"]');
    waves.forEach(radio => 
        radio.addEventListener('change', () => 
            startNewOscillator(radio.value)
        )
    );

    //  Detects if REVERB checkbox changes
    let effect = document.getElementById("reverb");
    effect.addEventListener( "change", () => {
        const selectedWaveType = document.querySelector('input[type=radio][name="wave-type"]:checked').value;

        if ( effect.checked ) {
            startEffect('reverb')
        } else {
            oscillator.removeEffect(reverb)
        }
     });

}

window.onload = runAfterLoadingPage;
