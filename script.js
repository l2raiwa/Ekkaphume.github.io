var app = angular.module('24app', []);

Array.prototype.last = function() {
  if(this.length) {
    return this[this.length-1];
  }
};

Array.prototype.count = function(item) {
  var count = 0;
  for(var i=0;i<this.length;i++) {
    if(this[i] === item) {
      count++;
    }
  }
  return count;
}

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

app.controller('GameController', [function() {
  this.tokens = ["+", "-", "*", "/", "(", ")"];  
  this.result = [];
  this.numbers = [];

  this.getTokenType = function(token) {
    if(['+','-','/','*'].indexOf(token) != -1) {
      return 'operator';
    }
    if(token === '(') {
      return 'open_bracket';
    }
    if(token === ')') {
      return 'close_bracket';
    }
    if(this.numbers.indexOf(token) != -1) {
      return 'number';
    }
    return 'invalid';
  };

  this.isTokenPossible = function(token) {
    var tokenType = this.getTokenType(token);
    var prevTokenType = this.getTokenType(this.result.last());

    switch(tokenType) {
      case 'operator':
        return ['number', 'close_bracket'].indexOf(prevTokenType) !== -1;
      case 'number':
        if(['close_bracket', 'number'].indexOf(prevTokenType) !== -1) {
          return false;
        }        
        return this.numbers.count(token) > this.result.count(token);
        
      case 'open_bracket':
        return ['number', 'close_bracket'].indexOf(prevTokenType) === -1;
      case 'close_bracket':
        if(['number', 'close_bracket'].indexOf(prevTokenType) === -1) {
          return false;
        }
        var openCount = this.result.filter(function(item) {
          return item === '(';
        }).length;
        var closeCount = this.result.filter(function(item) {
          return item === ')';
        }).length;
        return openCount > closeCount;
    }
    return false;
  }

  this.addToken = function(token) {
    if(this.isTokenPossible(token)) {
      this.result.push(token);
    }
  };

  this.removeToken = function() {
    if(this.result.length) {
      this.result.pop();
    }
  }
  
  this.new = function() {
    this.reset();
    this.numbers = [getRandomInt(1,9),getRandomInt(1,9),getRandomInt(1,9),getRandomInt(1,9)];
  }
  
  this.reset = function() {
    this.result = [];
  }

  this.isValid = function() {
    var openCount = this.result.filter(function(item) {
      return item === '(';
    }).length;
    var closeCount = this.result.filter(function(item) {
      return item === ')';
    }).length;

    if(closeCount !== openCount) {
      return false;
    }

    if(['invalid', 'operator', 'open_bracket'].indexOf(this.getTokenType(this.result.last())) !== -1) {
      return false;
    }
    
    for(var i=0;i<this.numbers.length;i++) {
      if(this.result.count(this.numbers[i]) !== this.numbers.count(this.numbers[i])) {
        return false;
      }
    }

    var opStack = [];
    var output = [];
    var ops = {
      '+': {
        order: 1,
        func: function(a, b) { return a + b; }
      },
      '-': {
        order: 1,
        func: function(a, b) { return a - b; }
      },
      '/': {
        order: 2,
        func: function(a, b) { return a / b; }
      },
      '*': {
        order: 3,
        func: function(a, b) { return a * b; }
      }
    };

    for(var i=0; i<this.result.length; i++) {
      var curItem = this.result[i];
      var curType = this.getTokenType(curItem);

      switch(curType) {
        case 'number':
          output.push(curItem);
          break;
        case 'operator':
          while(opStack.length && this.getTokenType(opStack.last()) === 'operator' && ops[curItem].order <= ops[opStack.last()].order) {
            output.push(opStack.pop());
          }
          opStack.push(curItem);
          break;
        case 'open_bracket':
          opStack.push(curItem);
          break;
        case 'close_bracket':
          while(opStack.last() !== '(') {
            output.push(opStack.pop());
          }
          opStack.pop();
          break;
        default:
          return false;
      }
    }
    while(opStack.length) {
      output.push(opStack.pop());
    }

    var stack = [];
    while(output.length) {
      var curItem = output.shift();

      if(this.getTokenType(curItem) === 'operator') {
        var b = stack.pop();
        var a = stack.pop();
        stack.push(ops[curItem].func(a, b));
      }
      else {
        stack.push(curItem);
      }
    }
    return stack[0] === 24;
  }
  
  this.new();
}]);