var Pattern = function(steps,pulses){
  this.steps = steps;
  this.pulses = pulses;
  this.remainder = []
  this.pattern = []
  this.count = []
  this.level = 0;
  this.result = "";
  this.stp = 0;

}

Pattern.prototype.bjorklund = function(steps,pulses){
  this.level = 0;
  this.pattern = []
  this.remainder = []
  this.count = []
  this.result = "";

  steps = Math.round(steps)
  pulses = Math.round(pulses)

  if(pulses > steps || pulses ==0 || steps == 0){
    this.result =  "error"
    return []
  }

  var divisor = steps - pulses
  this.remainder.push(pulses)

  while(true){
    this.count.push(Math.floor(divisor/this.remainder[this.level]))
    this.remainder.push(divisor % this.remainder[this.level])
    divisor = this.remainder[this.level]
    this.level++
    if(this.remainder[this.level] <=1)
      break;
  }
    this.count.push(divisor)
    this.build(this.level)
    this.pattern = this.startWith1()
    this.pattern.forEach(function(p){
      this.result += " " + p;
    })

    return this.pattern
}

Pattern.prototype.build = function(level){
  if(level == -1)
    this.pattern.push(0)
  else if (level == -2)
    this.pattern.push(1)
  else{
    for (var i = 0; i < this.count[level]; i++){
      this.build(level - 1);
    }
    if (this.remainder[level] != 0)
      this.build(level - 2);
  }
}

Pattern.prototype.startWith1 = function(){
  var i = this.pattern.indexOf(1)
  pat1 = this.pattern.slice(0,i)
  pat2 = this.pattern.slice(i,this.pattern.length-i)
  var result = pat2
  for(var j = 0;j<pat1.length;j++)
    result.push(pat1[j])

  return result
}

Pattern.prototype.rotateByi = function(i){
  pat1 = this.pattern.slice(0,i)
  pat2 = this.pattern.slice(i,this.pattern.length-i)
  var result = pat2
  for(var j = 0;j<pat1.length;j++)
    result.push(pat1[j])

  return result
}

Pattern.prototype.addStep = function(){
  this.steps++
  this.pattern = this.bjorklund(this.steps, this.pulse)
}

Pattern.prototype.removeStep = function(){
  if(this.pulses >= this.steps)
    return;
  this.steps--;
  this.pattern = this.bjorklund(this.steps, this.pulses)
}

Pattern.prototype.addPulse = function(){
  if(this.pulses >= this.steps)
    return;
  this.pulses++
  this.pattern = this.bjorklund(this.steps, this.pulse)
}

Pattern.prototype.removePulse = function(){
  if(this.pulses <= 1)
    return;
  this.pulses--;
  this.pattern = this.bjorklund(this.steps, this.pulses)
}