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
var waves = {
	0:'sine',
	1:'square',
	2:'triangle',
	3:'sawtooth',
}
var scales = {
	0:'chromatic',
	1:'major',
	2:'naturalMinor',
	3:'harmonicMinor',
	4:'melodicMinor',
	5:'dorian',
	6:'phrygian',
	7:'lydian',
	8:'mixolydian',
	9:'locrian',
	10:'pentatonicMinorr',
	11:'pentatonicMajor',
	12:'V',
	13:'shit',
}

var tempo = 60.0
var maxOscNumber = 4
var minAttackLevel = 0.05;
var maxAttackLevel = 1;
var minSustainLevel = 0.05;
var maxSustainLevel = 1;
var minAttackTime = 1.0;
var maxAttackTime = 500.0;
var minDecayTime = 1.0;
var maxDecayTime = 500.0;
var minReleaseTime = 1.0;
var maxReleaseTime = 500.0;
var maxDetune = 5;
var seqPow2 = true;
var nbOfInstr = 3;


var run;
var cursor = 0;
var max = 1
var pause = true;
var commandList;


$(document).ready(function(){
	seed = 100*Math.random()
	//seed = 59.15919079982497

	$('#seed').html('Current : ' )
	tempo = 1/tempo*60*1000/4
	commandList = new CommandList();

	$('#play').mousedown(function(){
		pause = !pause
		$('#play').html(pause? 'PLAY': 'PAUSE')
		//customSong()
	})
	$('#inputSeed').submit(function(event){
		event.preventDefault()
		reset()
		$('#play').html('PAUSE')
		seed = $("#inputSeedVal").val();
		$('#seed').html('Current : ' + seed)
		generateRandomSong()
	})
});

function generateRandomSong(){
	var t = rand()
	seqPow2 = t>0.5? true: false
	var root = pickRandomProperty(rootNotes)
	commandList.reset();
	commandList = new CommandList()
	commandList.randomize(3,root,1,5)
	createDrums(commandList.context2).forEach(function(d){
		commandList.list.push(d)
	})
	console.log(commandList)	
	loop()
	$('#sequence').html(cursor+1 + ' / ' + max)
	displayResult()
}

function newSong(){
	reset()
	generateRandomSong()
}

function customSong(){
	commandList.reset();
	commandList = new CommandList()
	var c1 = commandList.context1
	var c2 = commandList.context2
	//scale(rootNote,minOctave.maxOctave)    
	var scale1= generateNaturalMinorScale('C',5,6)
	var scale2= randomScale('C',3,5)
	var scale3= generateShitScale('C',1,3)

	//sequence(length,scale,addNoteProba,silenceProba,density)
	var seq1 = new Sequence(16,scale1,0.2,0.1,0.5)
	var seq2 = new Sequence(32,scale2,0.4,0.2,0.8)
	var seq3 = new Sequence(8,scale3,0,0.2,1)
	var seq4 = new Sequence(8,scale3,0,0.2,0.9)
	var seq5 = new Sequence(8,scale3,0,0.5,0.5)
	var seq6 = new Sequence(8,scale3,0,0,1)

	var instr1 = new Instrument(
		c1,
		[[0,'sine'],[5,'sine']], //oscillators (detune,wave)
		0.9, //attack peak level
		0.5, //sustain level
		50.0, //attack
		100.0, //decay
		50.0) //release
	var instr2 = new Instrument(
		c1,
		[[4,'triangle'],[5,'sawtooth'],[-5,'sine']], //oscillators (detune,wave)
		0.1, //attack peak level
		0.2, //sustain level
		50.0, //attack
		100.0, //decay
		50.0) //release
	var instr3 = new Instrument(
		c1,
		[[0,'sawtooth'],[5,'sine']], //oscillators (detune,wave)
		0.4, //attack peak level
		0.3, //sustain level
		50.0, //attack
		1000.0, //decay
		500.0) //release

	var kick = new Instrument(
		c2,
		[], //oscillators (detune,wave)
		0.6, //attack peak level
		0.2, //sustain level
		50.0, //attack
		100.0, //decay
		50.0,'kick') //release
	var snare = new Instrument(
		c2,
		[], //oscillators (detune,wave)
		0.6, //attack peak level
		0.2, //sustain level
		50.0, //attack
		100.0, //decay
		50.0,'snare',1) //release
	var hihat = new Instrument(
		c2,
		[], //oscillators (detune,wave)
		0.6, //attack peak level
		0.2, //sustain level
		50.0, //attack
		100.0, //decay
		50.0,'hihat') //release

	var command1 = new Command(c1,instr1,seq1)
	var command2 = new Command(c1,instr2,seq2)
	var command3 = new Command(c1,instr3,seq3)
	var command4 = new Command(c2,kick,seq4)
	var command5 = new Command(c2,snare,seq5)
	var command6 = new Command(c2,hihat,seq6)

	commandList.list = [command1,command2,command3,command4,command5,command6]
	console.log(commandList)
	loop(commandList.list)
}

function createDrums(c){
	var scale= ['C4']
	var seq1 = randomSequence(scale, seqPow2)
	var seq2 = randomSequence(scale,seqPow2)
	var seq3 = randomSequence(scale,seqPow2)

	var kick = new Instrument(
		c,
		[], //oscillators (detune,wave)
		0.5, //attack peak level
		0.5, //sustain level
		50.0, //attack
		100.0, //decay
		50.0,'kick') //release
	var snare = new Instrument(
		c,
		[], //oscillators (detune,wave)
		0.5, //attack peak level
		0.5, //sustain level
		50.0, //attack
		100.0, //decay
		50.0,'snare',getRandomFloat(0.1,1)) //release
	var hihat = new Instrument(
		c,
		[], //oscillators (detune,wave)
		0.5, //attack peak level
		0.5, //sustain level
		50.0, //attack
		100.0, //decay
		50.0,'hihat') //release

	var command1 = new Command(c,kick,seq1)
	var command2 = new Command(c,snare,seq2)
	var command3 = new Command(c,hihat,seq3)
	return [command1,command2,command3]
}

function loop(){
	var c = commandList.list
	for(var i = 0;i<c.length;i++){
		max = lcm(max,c[i].sequence.s.length)
	}
	run = setInterval(function(){play(c)}, tempo);
}

function play(){
	var com = commandList.list
	if(pause)
		return
	$('#sequence').html(cursor+1 + ' / ' + max)
	for(var i = 0;i<com.length;i++){
		var played = {}
		var instr = com[i].instrument
		var Sequence = com[i].sequence
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
		        	instr.addVoice(freq,sequence[c][0][1]*(tempo-20));
		        	played[notes[m]] = true;
		    	}
			})
    	})  
	}
    cursor += 1;
    if(cursor>=max)
    	cursor=0
}

function reset(){
	clearInterval(run);
	seed = 100*Math.random()
	$('#seed').html('Current : ' + seed)
	console.log(seed)
	max = 1
	cursor = 0;
	for(var i = 0;i<commandList.length;i++){
		commandList[i].kill()
	}
	pause = false;
	$('#play').html('PAUSE')
}

function displayResult(){
	$('#result').empty()
	$('#result').append('</br>')
	for(var i = 0;i<commandList.list.length;i++){
		var type = commandList.list[i].instrument.drumType
		if (typeof(type) == typeof(undefined))
			type = 'instr' + i
		if(i == 3)
		$('#result').append('- - - - -</br></br>')
		$('#result').append(type + " : " + commandList.list[i].sequence.s.length + " steps </br>")
		$('#result').append('<input id="instrument'+i+'" type="range" value='+commandList.list[i].instrument.sustainLevel*100 + ' min=0 max=100></input></br>')
	}
	reloadVolumes()
}

function reloadVolumes(){
	$("#instrument0").on('input', function () {
		var val = Math.max($(this).val()/100.0,0.00001)
		commandList.list[0].instrument.currentSustainLevel = val*commandList.list[0].instrument.sustainLevel
		commandList.list[0].instrument.currentPeakLevel = val*commandList.list[0].instrument.peakLevel
	});
	$("#instrument1").on('input', function () {
		var val = Math.max($(this).val()/100.0,0.00001)
		commandList.list[1].instrument.currentSustainLevel = val*commandList.list[1].instrument.sustainLevel
		commandList.list[1].instrument.currentPeakLevel = val*commandList.list[1].instrument.peakLevel
		console.log(val)
	});
	$("#instrument2").on('input', function () {
		var val = Math.max($(this).val()/100.0,0.00001)
		commandList.list[2].instrument.currentSustainLevel = val*commandList.list[2].instrument.sustainLevel
		commandList.list[2].instrument.currentPeakLevel = val*commandList.list[2].instrument.peakLevel
	});
	$("#instrument3").on('input', function () {
		var val = Math.max($(this).val()/100.0,0.00001)
		commandList.list[3].instrument.currentSustainLevel = val*commandList.list[3].instrument.sustainLevel
		commandList.list[3].instrument.currentPeakLevel = val*commandList.list[3].instrument.peakLevel
	});
	$("#instrument4").on('input', function () {
		var val = Math.max($(this).val()/100.0,0.00001)
		commandList.list[4].instrument.currentSustainLevel = val*commandList.list[4].instrument.sustainLevel
		commandList.list[4].instrument.currentPeakLevel = val*commandList.list[4].instrument.peakLevel
	});
	$("#instrument5").on('input', function () {
		var val = Math.max($(this).val()/100.0,0.00001)
		commandList.list[5].instrument.currentSustainLevel = val*commandList.list[5].instrument.sustainLevel
		commandList.list[5].instrument.currentPeakLevel = val*commandList.list[5].instrument.peakLevel
	});
}





function randomInstrument(context, detune){
	var oscNb = getRandomInt(1,maxOscNumber)
	var osc = []
	for(var i = 0;i<oscNb;i++){
		osc.push([getRandomInt(-detune,detune),getRandomWave()])
	}
	return new Instrument(
		context,
		osc, //oscillators (detune,wave)
		getRandomFloat(minAttackLevel,maxAttackLevel), //attack peak level
		getRandomFloat(minSustainLevel,maxSustainLevel), //sustain level
		getRandomFloat(minAttackTime,maxAttackTime), //attack
		getRandomFloat(minDecayTime,maxDecayTime), //decay
		getRandomFloat(minReleaseTime,maxReleaseTime)) //release
}
function randomSequence(scale, pow2){
	var addNote = rand()
	if (pow2)
		return new Sequence(getRandomPow2(),scale,rand(),rand()/2,rand())
	return new Sequence(getRandomInt(2,32),scale,rand(),rand()/2,rand())
}
function randomScale(root,min,max){
	var minOctave = getRandomInt(1,6);
	var maxOctave = minOctave + getRandomInt(1,7)
	maxOctave = maxOctave>7 ? 7 : maxOctave

	if(min)
		minOctave = min
	if(max)
		maxOctave = max

	var x = parseInt(pickRandomProperty(scales))

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
		case 11:
			return generateMajorPentatonicScale(root,minOctave,maxOctave);
			break;
		case 12:
			return generateVScale(root,minOctave,maxOctave);
			break;
		case 13:
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
function extendScale(scale,lowOctave,highOctave){
	var notes = {}
	for (var prop in scale){
		for(var octave = lowOctave; octave<highOctave;octave++){
			notes[prop+octave] = rootNotes[prop]*Math.pow(2,(octave-4));
		}
	}
	return notes;
}

var CommandList = function(){
	this.list = []
	this.context1 = new AudioContext
	this.context2 = new AudioContext
}

CommandList.prototype.reset = function(){
	this.context1.close()
	this.context2.close()
	this.list = []
}

CommandList.prototype.randomize = function(nb,root,min,max){
	var list = []
	scale = randomScale(root,min,max)
	for(var i = 0;i<nb;i++){
		var c = new Command(this.context1,null,null)
		c.randomize(root,min,max,scale)
		list.push(c)
	}
	this.list = list
}



var Command = function(context,instrument,sequence){
	this.context = context;
	this.instrument = instrument;
	this.sequence = sequence;
}
Command.prototype.kill = function(){
	this.instrument.kill()
	this.context.close();
}
Command.prototype.randomize = function(root,min,max,sc){
	scale = randomScale(root,min,max)
	if(sc)
		scale = sc
	this.sequence = randomSequence(scale,seqPow2)
	this.instrument  = randomInstrument(this.context,maxDetune)
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
		//push notes to sequence[step]
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
	return Math.pow(2,getRandomInt(2,6))
}

function getRandomWave(){
	return waves[pickRandomProperty(waves)]
}






// Establish the parameters of the generator
var m = 25;
// a - 1 should be divisible by m's prime factors
var a = 11;
// c and m should be co-prime
var c = 17;
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