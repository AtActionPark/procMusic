var tempo = 250
var rootNotes = {
	'A': 440,
	'A#':466.16,
	'B':493.88,
	'C':523.36,
	'C#':554.37,
	'D':587.33,
	'D#':622.25,
	'E':659.25,
	'F':698.46,
	'F#':739.99,
	'G':783.99,
	'G#':830.61
}
var cursor = 0;
var max = 1
var pause = false;

$(document).ready(function(){
	//scale(rootNote,minOctave.maxOctave)    
	var scale1= generateMinorScale('C',5,6)
	var scale2= generateMinorScale('C',3,5)
	var scale3= generateShitScale('C',1,3)

	//sequence(length,scale,addNoteProba,silenceProba,density)
	var seq1 = new Sequence(16,scale1,0.1,0.1,0.5)
	var seq2 = new Sequence(16,scale2,0.4,0,0.8)
	var seq3 = new Sequence(4,scale3,0,0.2,1)


	var instr1 = new Instrument(
		new AudioContext,
		[[0,'sine'],[5,'sine']], //oscillators (detune,wave)
		0.8, //attack peak level
		0.5, //sustain level
		50.0, //attack
		100.0, //decay
		50.0) //release
	var instr2 = new Instrument(
		new AudioContext,
		[[0,'square'],[5,'sawtooth'],[-5,'sine']], //oscillators (detune,wave)
		0.5, //attack peak level
		0.2, //sustain level
		50.0, //attack
		100.0, //decay
		50.0) //release
	var instr3 = new Instrument(
		new AudioContext,
		[[0,'sawtooth'],[5,'sine']], //oscillators (detune,wave)
		0.6, //attack peak level
		0.2, //sustain level
		50.0, //attack
		100.0, //decay
		50.0) //release

	var command1 = [instr1,seq1]
	var command2 = [instr2,seq2]
	var command3 = [instr3,seq3]

	
	var commandList = [command1,command2,command3]

	loop(commandList)
	

	$('#instrument').mousedown(function(){
		pause = !pause
		//instr1.addVoice(150)
	})

	$('#instrument').mouseup(function(){
		//instr1.stopVoice(150)
	})

	
});

function loop(commandList){
	for(var i = 0;i<commandList.length;i++){
		max = lcm(max,commandList[i][1].sequence.length)
	}
	setInterval(function(){play(commandList)}, tempo);
}

function play(commandList){
	if(pause)
		return
	$('#instrument').html(cursor+1)
	for(var i = 0;i<commandList.length;i++){
		var played = {}
		var instr = commandList[i][0]
		var Sequence = commandList[i][1]
		var sequence = Sequence.sequence
		var notes = Sequence.scale

		var c = cursor 
		while(c>sequence.length-1){
			c-=sequence.length
		}
		sequence[c].forEach(function(n){
			n.forEach(function(m){
				var freq = notes[m];
		    	if(freq && !played[notes[m]]) {
		        	playNote(instr,freq,sequence[c][0][1]*tempo-20);
		        	played[notes[m]] = true;
		    	}
			})
    	})  
	}
    cursor += 1;
    if(cursor>=max)
    	cursor=0
}

function playNote(instr,note,duration){
	instr.addVoice(note)
	setTimeout(function(){
		instr.stopVoice(note)
	},duration)
}

function generateAllNotesScale(lowOctave,highOctave){
	return extendScale(rootNotes, lowOctave,highOctave)
}
function generateMajorScale(rootNote, lowOctave,highOctave){
	var scale = {};

	scale[rootNote] = rootNotes[rootNote]
	scale[getNextNote(rootNote,2)] = rootNotes[getNextNote(rootNote,2)]
	scale[getNextNote(rootNote,4)] = rootNotes[getNextNote(rootNote,4)]
	scale[getNextNote(rootNote,5)] = rootNotes[getNextNote(rootNote,5)]
	scale[getNextNote(rootNote,7)] = rootNotes[getNextNote(rootNote,7)]
	scale[getNextNote(rootNote,9)] = rootNotes[getNextNote(rootNote,9)]
	scale[getNextNote(rootNote,11)] = rootNotes[getNextNote(rootNote,11)]

	return extendScale(scale, lowOctave,highOctave);
}

function generateMinorScale(rootNote, lowOctave,highOctave){
	var scale = {};

	scale[rootNote] = rootNotes[rootNote]
	scale[getNextNote(rootNote,2)] = rootNotes[getNextNote(rootNote,2)]
	scale[getNextNote(rootNote,3)] = rootNotes[getNextNote(rootNote,3)]
	scale[getNextNote(rootNote,5)] = rootNotes[getNextNote(rootNote,5)]
	scale[getNextNote(rootNote,7)] = rootNotes[getNextNote(rootNote,7)]
	scale[getNextNote(rootNote,8)] = rootNotes[getNextNote(rootNote,8)]
	scale[getNextNote(rootNote,10)] = rootNotes[getNextNote(rootNote,10)]

	return extendScale(scale, lowOctave,highOctave);
}

function generateShitScale(rootNote, lowOctave,highOctave){
	var scale = {};

	scale[rootNote] = rootNotes[rootNote]
	scale[getNextNote(rootNote,1)] = rootNotes[getNextNote(rootNote,1)]
	scale[getNextNote(rootNote,5)] = rootNotes[getNextNote(rootNote,5)]

	return extendScale(scale, lowOctave,highOctave);
}

function getNextNote(note,offset){
	var notes = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#']
	var indexOfNote = notes.indexOf(note)
	var newIndex = indexOfNote+offset 
	if(newIndex>11)
		newIndex-=12
	return notes[newIndex]
}

function extendScale(scale, lowOctave,highOctave){
	var notes = {}
	for (var prop in scale){
		for(var octave = lowOctave; octave<highOctave;octave++){
			notes[prop+octave] = rootNotes[prop]*Math.pow(2,(octave-4));
		}
	}
	return notes;
}




var Sequence = function(length,scale,addNoteProba,silenceProba,density){
	this.length = length;
	this.scale = scale;
	this.addNoteProba = addNoteProba;
	this.silenceProba = silenceProba;
	this.density = density;
	this.sequence;
	this.generateRandom()
}

Sequence.prototype.generateRandom = function(){
	var seq = new Array(this.length);
	for(var i = 0;i<this.length;i++){
		seq[i] = [['-',1]]
	}

	for(var i = 0;i<this.length;i++){
		var n = []
		var l = getNoteLength2(this.length,this.density,i,true)
		n.push([pickRandomProperty(this.scale),l])
		if(Math.random()<this.addNoteProba)
			n.push([pickRandomProperty(this.scale),l])
		if(Math.random()<this.addNoteProba/2)
			n.push([pickRandomProperty(this.scale),l])

		if(Math.random()>this.silenceProba)
			seq[i] = n
		i+= l-1
	}
	this.sequence = seq;
	console.log(seq)
}

getNoteLength = function(barLength,density,step,cut){
	density = 1-density
	var l = Math.floor(Math.random()*density*(barLength-1))+1
	return cut? Math.min(l,barLength-step) :l
}

getNoteLength2 = function(barLength,density,step,cut){
	density = 1-density
	var min = Math.pow(density,2)*(barLength-1) +1
	var max = Math.pow(density,1/1.2)*(barLength-1) +1
	var l = Math.floor(Math.random()*max+min)
	return cut? Math.min(l,barLength-step) :l
}




var Instrument = function(context,osc,peakLevel,sustainLevel,attackTime,decayTime,releaseTime){
	this.voices = {}

	this.context = context;
	this.osc = osc;
	this.peakLevel = peakLevel;
	this.sustainLevel = sustainLevel;
	this.attackTime = attackTime;
	this.decayTime = decayTime;
	this.releaseTime = releaseTime;	
}

Instrument.prototype.addVoice = function(freq){
	if(this.voice && this.voice[freq])
		this.voice[freq].stop()
	this.voices[freq] = new Voice(
		this.context,
		freq,this.osc,
		this.peakLevel,
		this.sustainLevel,
		this.attackTime,
		this.decayTime,
		this.releaseTime)
	this.voices[freq].start()
}

Instrument.prototype.stopVoice = function(freq){
	this.voices[freq].stop();
	delete this.voices[freq]
}


function Voice(context,frequency,osc,peakLevel,sustainLevel,attackTime,decayTime,releaseTime){
  this.context = context
  this.frequency = frequency;
  this.osc = osc;
  this.peakLevel = peakLevel;
  this.sustainLevel = sustainLevel;
  this.attackTime = attackTime;
  this.decayTime = decayTime;
  this.releaseTime = releaseTime;

  this.oscillators = [];

  this.gainNode = context.createGain();
  this.gainNode.gain.value = 0;
};

Voice.prototype.start = function() {
	var self = this;
	this.osc.forEach(function(o){
		var o = self.createOsc(self.frequency+o[0],o[1])
		o.start(0)
	})

	this.gainNode.connect(this.context.destination);

    this.gainNode.gain.setValueAtTime(0,this.context.currentTime );
    this.gainNode.gain.linearRampToValueAtTime(this.peakLevel, this.context.currentTime + this.attackTime/1000)
    this.gainNode.gain.linearRampToValueAtTime(this.sustainLevel, this.context.currentTime + this.attackTime/1000 + this.decayTime/1000) 
};

Voice.prototype.stop = function() {
	var currentTime = this.context.currentTime;
	var releaseTime = this.releaseTime/1000;

	this.gainNode.gain.setValueAtTime(this.sustainLevel,currentTime );
	this.gainNode.gain.linearRampToValueAtTime(0,currentTime + releaseTime );
	this.oscillators.forEach(function(oscillator) {
		oscillator.stop(currentTime + releaseTime);
	});
};

Voice.prototype.createOsc = function(freq,wave){
	var osc = this.context.createOscillator();
	osc.type = wave;
	osc.frequency.value = freq;
	osc.connect(this.gainNode);
	this.oscillators.push(osc);
	return osc
}



//Helpers
function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

//greatest common denominator
function gcd(a,b){
	while(b != 0){
		t = b;
		b = a%b
		a=t
	}
	return a;
}

//least common multiplier
function lcm(a,b){
	return a*b/gcd(a,b)
}




