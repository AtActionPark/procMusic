
class Instrument{
	constructor(context,osc,peakLevel,sustainLevel,attackTime,decayTime,releaseTime,drumType,snareRelease){
		this.voices = {}
		this.context = context;
		this.osc = osc;
		this.peakLevel = peakLevel;
		this.sustainLevel = sustainLevel;
		this.attackTime = attackTime;
		this.decayTime = decayTime;
		this.releaseTime = releaseTime;	
		this.drumType = drumType;
		this.snareRelease = snareRelease
	}

	addVoice(freq){
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
			this.releaseTime,
			this.drumType,
			this.snareRelease)
		if(this.drumType)
			this.voices[freq].trigger()
		else
			this.voices[freq].start()
	}

	stopVoice(freq){
		if(!this.context)
			return
		this.voices[freq].stop();	
	}

	kill(){
		for(var i = 0;i<this.voices.length;i++){
			this.voices[i].stop();
			delete this.voices[i]
		}

		this.voices = []
	}
}

class Voice{
	constructor(context,frequency,osc,peakLevel,sustainLevel,attackTime,decayTime,releaseTime,drumType,snareRelease){
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
		this.drumType = drumType;
		this.snareRelease = snareRelease

		this.oscillators = [];

		this.gainNode = context.createGain();
		this.gainNode.gain.value = 0;	
	}

	start(){
		if(!this.context)
			return
		var self = this;
		this.osc.forEach(function(o){
			var osc = self.createOsc(self.frequency,o[1])
			osc.detune.value = o[0]
			osc.start(0)
		})

		var now = this.context.currentTime
		this.gainNode.connect(this.context.destination);
		this.gainNode.gain.cancelScheduledValues(now)
	    this.gainNode.gain.setValueAtTime(0,this.context.currentTime );
	    this.gainNode.gain.linearRampToValueAtTime(this.peakLevel, now + this.attackTime/1000)
	    this.gainNode.gain.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime/1000 + this.decayTime/1000) 

	    var release = this.releaseTime/1000;
	    this.gainNode.gain.linearRampToValueAtTime(0,now + release);
		this.oscillators.forEach(function(oscillator) {
			oscillator.stop(now + release);
		});
	}

	trigger(){
		if(!this.context)
			return
		var self = this;
		
		if(this.drumType == 'kick'){
			self.kick()
		}
		else if(this.drumType == 'snare'){
			self.snare()
		}
		else if(this.drumType == 'hihat'){
			self.hihat()
		}
	}

	createOsc(freq,wave){
		var osc = this.context.createOscillator();
		osc.type = wave;
		osc.frequency.value = freq;

		osc.connect(this.gainNode);
		this.oscillators.push(osc);
		return osc
	}

	kick(){
		var time = this.context.currentTime
		var osc = this.context.createOscillator();
		var osc2 = this.context.createOscillator();
		osc2.type = 'sine'
		osc.connect(this.gainNode);
		osc2.connect(this.gainNode);
		this.gainNode.connect(this.context.destination);

		osc.frequency.setValueAtTime(150, time);
		osc2.frequency.setValueAtTime(120, time);
		this.gainNode.gain.setValueAtTime(1, time);

		osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
		osc2.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
		this.gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

		osc.start(time);

		osc.stop(time + 0.5);
	}

	snare(){
		var time = this.context.currentTime
		this.noise = this.context.createBufferSource();
		this.noise.buffer = noiseBuffer(this.context)
		var noiseFilter = this.context.createBiquadFilter();
		noiseFilter.type = 'highpass';
		noiseFilter.frequency.value = 1000;
		this.noise.connect(noiseFilter);
		this.noiseEnvelope = this.context.createGain();
		noiseFilter.connect(this.noiseEnvelope);

		this.noiseEnvelope.connect(this.context.destination);
		this.osc = this.context.createOscillator();
		this.osc.type = 'triangle';

		this.oscEnvelope = this.context.createGain();
		this.osc.connect(this.oscEnvelope);
		this.noiseEnvelope.gain.setValueAtTime(0.5, time);
		this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + this.snareRelease);
		this.noise.start(time)

		this.osc.frequency.setValueAtTime(100, time);
		this.oscEnvelope.gain.setValueAtTime(0.7, time);
		this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
		this.osc.start(time)

		this.osc.stop(time + 0.2);
		this.noise.stop(time + 0.2);
	}

	hihat(){
		var fundamental = 40;
		var ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
		var self = this;
		// Always useful
		var when = this.context.currentTime;

		// Bandpass
		var bandpass = this.context.createBiquadFilter();
		bandpass.type = "bandpass";
		bandpass.frequency.value = 10000;

		// Highpass
		var highpass = this.context.createBiquadFilter();
		highpass.type = "highpass";
		highpass.frequency.value = 7000;

		// Connect the graph
		bandpass.connect(highpass);
		highpass.connect(this.gainNode);
		this.gainNode.connect(this.context.destination);

		// Create the oscillators
		ratios.forEach(function(ratio) {
		  var osc = self.context.createOscillator();
		  osc.type = "square";
		  // Frequency is the fundamental * this oscillator's ratio
		  osc.frequency.value = fundamental * ratio;
		  osc.connect(bandpass);
		  osc.start(when);
		  osc.stop(when + 0.3);
		});

		// Define the volume envelope
		this.gainNode.gain.setValueAtTime(0.00001, when);
		this.gainNode.gain.exponentialRampToValueAtTime(1, when + 0.02);
		this.gainNode.gain.exponentialRampToValueAtTime(0.3, when + 0.03);
		this.gainNode.gain.exponentialRampToValueAtTime(0.00001, when + 2);
			}
}

noiseBuffer = function(context) {

	var bufferSize = context.sampleRate;
	var buffer = context.createBuffer(1, bufferSize, context.sampleRate);
	var output = buffer.getChannelData(0);

	for (var i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}

	return buffer;
};



