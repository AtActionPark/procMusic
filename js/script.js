var tempo = 150
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
var pause = true;
var commandList;

var maxOscNumber = 4
var minAttackLevel = 0.2;
var maxAttackLevel = 1;
var minSustainLevel = 0.2;
var maxSustainLevel = 1;
var minAttackTime = 1;
var maxAttackTime = 1000;
var minDecayTime = 1;
var maxDecayTime = 1000;
var minReleaseTime = 1;
var maxReleaseTime = 1000;
var maxDetune = 5;
var seqPow2 = false;


$(document).ready(function(){
	seed = 100*Math.random()
	seed = 93.86953479189187
	$('#seed').html(seed)

	//scale(rootNote,minOctave.maxOctave)    
	var scale1= generateNaturalMinorScale('C',5,6)
	var scale2= randomScale('C',3,5)
	var scale3= generateShitScale('C',1,3)

	//sequence(length,scale,addNoteProba,silenceProba,density)
	var seq1 = new Sequence(16,scale1,0.2,0.1,0.5)
	var seq2 = new Sequence(32,scale2,0.4,0.2,0.8)
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

	var root = pickRandomProperty(rootNotes)
	scale1 = randomScale(root)
	scale2 = randomScale(root)
	scale3 = randomScale(root)
	seq1 = randomSequence(scale1,true)
	seq2 = randomSequence(scale2,true)
	seq3 = randomSequence(scale3,true)
	instr1 = randomInstrument(maxDetune)
	instr2 = randomInstrument(maxDetune)
	instr3 = randomInstrument(maxDetune)

	var command1 = new Command(instr1,seq1)
	var command2 = new Command(instr2,seq2)
	var command3 = new Command(instr3,seq3)

	
	commandList = [command1,command2,command3]
	console.log(commandList)

	$('#instrument').mousedown(function(){
		pause = !pause
		loop(commandList)
	})
});

function newSong(){
	seed = 100*Math.random()
	$('#seed').html(seed)
	max = 1
	cursor = 0;
	for(var i = 0;i<commandList.length;i++){
		commandList[i].kill()
	}
	commandList = []
	var root = pickRandomProperty(rootNotes)
	scale1 = randomScale(root)
	scale2 = randomScale(root)
	scale3 = randomScale(root)
	seq1 = randomSequence(scale1,seqPow2)
	seq2 = randomSequence(scale2,seqPow2)
	seq3 = randomSequence(scale3,seqPow2)
	instr1 = randomInstrument(maxDetune)
	instr2 = randomInstrument(maxDetune)
	instr3 = randomInstrument(maxDetune)

	var command1 = new Command(instr1,seq1)
	var command2 = new Command(instr2,seq2)
	var command3 = new Command(instr3,seq3)

	commandList = [command1,command2,command3]
	loop(commandList)
}

function loop(commandList){
	for(var i = 0;i<commandList.length;i++){
		max = lcm(max,commandList[i].sequence.s.length)
	}
	setInterval(function(){play(commandList)}, tempo);
}

function play(commandList){
	if(pause)
		return
	$('#instrument').html(cursor+1 + ' / ' + max)
	for(var i = 0;i<commandList.length;i++){
		var played = {}
		var instr = commandList[i].instrument
		var Sequence = commandList[i].sequence
		var sequence = Sequence.s
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




function randomInstrument(detune){
	var oscNb = getRandomInt(1,maxOscNumber)
	var osc = []
	for(var i = 0;i<oscNb;i++){
		osc.push([getRandomInt(-detune,detune),getRandomWave()])
	}
	return  new Instrument(
		new AudioContext,
		osc, //oscillators (detune,wave)
		getRandomFloat(minAttackLevel,maxAttackLevel), //attack peak level
		getRandomFloat(minSustainLevel,maxSustainLevel), //sustain level
		getRandomFloat(minAttackTime,maxAttackTime), //attack
		getRandomFloat(minDecayTime,maxDecayTime), //decay
		getRandomFloat(minReleaseTime,maxReleaseTime)) //release
}
function randomSequence(scale, pow2){
	if (pow2)
		return new Sequence(getRandomPow2(),scale,rand(),rand(),rand())
	return new Sequence(getRandomInt(2,32),scale,rand(),rand(),rand())
}
function randomScale(root,min,max){
	var minOctave = getRandomInt(1,6);
	var maxOctave = minOctave + getRandomInt(1,7)
	maxOctave = maxOctave>7 ? 7 : maxOctave

	if(min)
		minOctave = min
	if(max)
		maxOctave = max

	var x = getRandomInt(0,12)

	switch(x){
		case 0:
			return generateChromaticScale(root,minOctave,maxOctave);
			break;
		case 1:
			return generateMajorScale(root,minOctave,maxOctave);
			break;
		case 2:
			return generateNaturalMinorScale(root,minOctave,maxOctave);
			break;
		case 3:
			return generateHarmonicMinorScale(root,minOctave,maxOctave);
			break;
		case 4:
			return generateMelodicMinorScale(root,minOctave,maxOctave);
			break;
		case 5:
			return generateDorianScale(root,minOctave,maxOctave);
			break;
		case 6:
			return generatePhrygianScale(root,minOctave,maxOctave);
			break;
		case 7:
			return generateLydianScale(root,minOctave,maxOctave);
			break;
		case 8:
			return generateMixolydianScale(root,minOctave,maxOctave);
			break;
		case 9:
			return generateLocrianScale(root,minOctave,maxOctave);
			break;
		case 10:
			return generateMinorPentatonicScale(root,minOctave,maxOctave);
			break;
		case 10:
			return generateMajorPentatonicScale(root,minOctave,maxOctave);
			break;
		case 11:
			return generateVScale(root,minOctave,maxOctave);
			break;
		case 12:
			return generateShitScale(root,minOctave,maxOctave);
			break;
		default:
			break;
	}
}


function generateScale(intervals,rootNote, lowOctave,highOctave){
	var scale = {};
	scale[rootNote] = rootNotes[rootNote]
	for(var i =0;i<intervals.length;i++)
		scale[getNextNote(rootNote,intervals[i])] = rootNotes[getNextNote(rootNote,intervals[i])]
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



var Command = function(instrument,sequence){
	this.instrument = instrument;
	this.sequence = sequence;
}
Command.prototype.kill = function(){
	this.instrument.kill()
}


var Sequence = function(length,scale,addNoteProba,silenceProba,density){
	this.length = length;
	this.scale = scale;
	this.addNoteProba = addNoteProba;
	this.silenceProba = silenceProba;
	this.density = density;
	this.s;
	this.generateRandom()
}
Sequence.prototype.generateRandom = function(){
	//create new empty sequence
	var seq = new Array(this.length);
	for(var i = 0;i<this.length;i++){
		seq[i] = [['-',1]]
	}

	//for each sequence step
	for(var i = 0;i<this.length;i++){
		//skip notes depending on silence probability
		if(rand()<this.silenceProba)
			continue;
		//create array of all notes this step 
		var n = []
		//chose length of notes
		var l = getNoteLength2(this.length,this.density,i,true)
		//push random note of length lto array
		n.push([pickRandomProperty(this.scale),l])

		//and maybe push some more
		if(rand()<this.addNoteProba)
			n.push([pickRandomProperty(this.scale),l])
		if(rand()<this.addNoteProba/2)
			n.push([pickRandomProperty(this.scale),l])
		//push notes to suquence[step]
		seq[i] = n
		//change index to start new note at the end of next one
		i+= l-1
	}
	this.s = seq;
	//console.log(seq)
}

getNoteLength = function(barLength,density,step,cut){
	density = 1-density
	var l = Math.floor(rand()*density*(barLength-1))+1
	return cut? Math.min(l,barLength-step) :l
}
getNoteLength2 = function(barLength,density,step,cut){
	density = 1-density
	var min = Math.pow(density,10)*(barLength-1) +1
	var max = Math.pow(density,1/1.2)*(barLength-1) +1
	var l = Math.floor(rand()*max+min)
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
			freq,
			this.osc,
			this.peakLevel,
			this.sustainLevel,
			this.attackTime,
			this.decayTime,
			this.releaseTime)
		this.voices[freq].start()
}
Instrument.prototype.stopVoice = function(freq){
	if(!this.context)
		return
	this.voices[freq].stop();
}

Instrument.prototype.kill = function(){
	for(var i = 0;i<this.voices.length;i++){
		this.voices[i].stop();
		delete this.voices[i]
	}
	this.context.close()
	this.context = null;
	this.voices = []
}



function Voice(context,frequency,osc,peakLevel,sustainLevel,attackTime,decayTime,releaseTime){
  if(!context)
	return
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
	if(!this.context)
		return
	var self = this;
	this.osc.forEach(function(o){
		var osc = self.createOsc(self.frequency,o[1])
		osc.detune.value = o[0]
		osc.start(0)
	})

	this.gainNode.connect(this.context.destination);

    this.gainNode.gain.setValueAtTime(0,this.context.currentTime );
    this.gainNode.gain.linearRampToValueAtTime(this.peakLevel, this.context.currentTime + this.attackTime/1000)
    this.gainNode.gain.linearRampToValueAtTime(this.sustainLevel, this.context.currentTime + this.attackTime/1000 + this.decayTime/1000) 
};
Voice.prototype.stop = function() {
	if(!this.context)
		return
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
        if (rand() < 1/++count)
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

function getRandomFloat(a,b){
	return rand()*(b-a) +a
}

function getRandomInt(a,b){
	return Math.floor(rand()*(b - a + 1)) + a;
}

function getRandomPow2(a,b){
	return Math.pow(2,getRandomInt(1,5))
}

function getRandomWave(){
	var x = rand();
	if(x<0.25)
		return 'sine'
	else if (x <0.5)
		return 'square'
	else if (x <0.75)
		return 'sawtooth'
	else 
		return 'triangle'
}




// Establish the parameters of the generator
var m = 25,
    // a - 1 should be divisible by m's prime factors
    a = 11,
    // c and m should be co-prime
    c = 17;
// Setting the seed
var seed = 0;
var rand = function() {
  // define the recurrence relationship
  seed = (a * seed + c) % m;
  // return an integer
  // Could return a float in (0, 1) by dividing by m
  return seed/m;
};






function generateChromaticScale(root,lowOctave,highOctave){
	return extendScale(rootNotes, lowOctave,highOctave)
}
function generateMajorScale(rootNote, lowOctave,highOctave){
	return generateScale([2,4,5,7,9,11],rootNote, lowOctave,highOctave)
}
function generateNaturalMinorScale(rootNote, lowOctave,highOctave){
	return generateScale([2,3,5,7,8,10],rootNote, lowOctave,highOctave)
}
function generateHarmonicMinorScale(rootNote, lowOctave,highOctave){
	return generateScale([2,3,5,7,8,11],rootNote, lowOctave,highOctave)
}
function generateMelodicMinorScale(rootNote, lowOctave,highOctave){
	return generateScale([2,3,5,7,9,11],rootNote, lowOctave,highOctave)
}
function generateShitScale(rootNote, lowOctave,highOctave){
	return generateScale([1,7],rootNote, lowOctave,highOctave)
}
function generateVScale(rootNote, lowOctave,highOctave){
	return generateScale([7],rootNote, lowOctave,highOctave)
}
function generateDorianScale(rootNote, lowOctave,highOctave){
	return generateScale([2,3,5,7,9,10],rootNote, lowOctave,highOctave)
}
function generatePhrygianScale(rootNote, lowOctave,highOctave){
	return generateScale([1,3,5,7,8,10],rootNote, lowOctave,highOctave)
}
function generateLydianScale(rootNote, lowOctave,highOctave){
	return generateScale([2,4,6,7,9,11],rootNote, lowOctave,highOctave)
}
function generateMixolydianScale(rootNote, lowOctave,highOctave){
	return generateScale([2,4,5,7,9,10],rootNote, lowOctave,highOctave)
}
function generateLocrianScale(rootNote, lowOctave,highOctave){
	return generateScale([1,3,5,6,8,10],rootNote, lowOctave,highOctave)
}
function generateMajorPentatonicScale(rootNote, lowOctave,highOctave){
	return generateScale([2,4,7,9],rootNote, lowOctave,highOctave)
}
function generateMinorPentatonicScale(rootNote, lowOctave,highOctave){
	return generateScale([3,5,7,10],rootNote, lowOctave,highOctave)
}