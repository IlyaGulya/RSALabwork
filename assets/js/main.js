`use strict`;

var debug = false;

if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        } else if (this[i] instanceof Big && array[i] instanceof Big) {
          if (!this[i].eq(array[i]))
                return false;
        } else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
var lab;
$(function() {
  $(window).on('hashchange',function() {
    $.sammy(function(){
      this.get('#:page',function(){
        loadPage(this.params['page'])
      })
    }).run()
  });
  function easterEgg() {

  }
  function loadPage(page) {
    if (page == undefined || page == "") {
      showBlock("hello")
      toggleNav("hello")
    } else if (page == "azaz") {
      easterEgg()
    } else {
      showBlock(page)
      toggleNav(page)
    }
  }

  function showBlock(blockName) {
    $('#content>div').hide()
    $('#content>div[data-id='+ blockName +']').show()
  }

  function toggleNav(page) {
    $('ul.nav li').each(function() {
      $(this).removeClass("active")
    })
    $("ul.nav li#"+page).addClass("active")
  }
  $.sammy.apply()

  lab = new Labwork();

  $("button[data-step]").on('click', function() {
    var stepName = $(this).data("step");
    lab.processStep(stepName);
  })

  $("[data-step] input").on('click', function() {
    $(this).trigger('notify-hide')
  })

});

var Labwork = function() {
  this.steps = [
    "inputPQ",
    "inputN",
    "inputC",
    "inputD",
    "inputE",
    "inputPublicKey",
    "inputPrivateKey",
    "inputMessage",
    "inputMessageSequence",
    "inputMessageSequenceEncoded",
    "inputWrongD",
    "inputMessageSequenceDecodedWrong",
    "inputMessageSequenceDecodedExample",
    "messageSequenceDecodedExampleHumanReadable"
  ];
  this.transcode = createTable();
  if (!debug) {
    this.hideAllSteps()
  } else {
    this.fillExampleData()
  }
  this.data = {};
  this.data.step = "inputPQ";
  this.showCurrentStep();
}

Labwork.prototype.fillExampleData = function () {
  $("#numberP").val(7)
  $("#numberQ").val(11)
  $("#numberN").val(77)
  $("#numberC").val(60)
  $("#numberD").val(7)
  $("#numberE").val(43)
  $("#publickey-1").val(43)
  $("#publickey-2").val(77)
  $("#privatekey-1").val(7)
  $("#privatekey-2").val(77)
  var message = "Проверка 123"
  var sequence = this.textToSequence(message)
  var encoded = encode(43, 77, sequence)
  $("#message-encode").val(message)
  $("#message-sequence").val(sequence.join(","))
  $("#message-sequence-encoded").val(encoded.join(","))
  $("#numberWrongD").val(11)
  var decodedWrong = decode(11, 77, encoded)
  $("#message-sequence-decoded-wrong").val(decodedWrong)
  var decodedWrongMessage = this.sequenceToText(decodedWrong);
  $("#message-decoded-wrong").val(decodedWrongMessage)
}

Labwork.prototype.inputMessage = function (button) {
  var messageInput = $("#message-encode");
  var message = messageInput.val().trim();
  if (message != "") {
    this.data.message = message
    this.data.messageSequence = this.textToSequence(message)
    this.data.messageSequenceEncoded = encode(this.data.e, this.data.n, this.data.messageSequence)
    disable(messageInput)
    return true
  }
  return false
}

Labwork.prototype.inputMessageSequence = function (button) {
  var sequenceInput = $("#message-sequence");
  var sequence = sequenceInput.val().trim();
  if (sequence != "") {
    var messageSequence = this.data.messageSequence
    var array = sequence.split(",")
    if (!array.equals(messageSequence)) {
      error(sequenceInput)
    } else {
      disable(sequenceInput)
      return true
    }
  }
  return false
}

Labwork.prototype.inputMessageSequenceEncoded = function (button) {
  var sequenceInput = $("#message-sequence-encoded");
  var sequence = sequenceInput.val().trim();
  if (sequence != "") {
    var messageSequenceEncoded = this.data.messageSequenceEncoded
    var array = sequence.split(",")
    if (!array.equals(messageSequenceEncoded)) {
      error(sequenceInput)
    } else {
      disable(sequenceInput)
      return true
    }
  }
  return false
}

Labwork.prototype.inputWrongD = function (button) {
  var wrongDInput = $("#numberWrongD");
  var wrongD = getPrimeOrNotify(wrongDInput);
  if (wrongD != -1) {
    this.data.wrongD = wrongD
    this.data.messageSequenceDecodedWrong = decode(this.data.wrongD, this.data.n, this.data.messageSequenceEncoded)
    $("#message-decoded-wrong").val(this.sequenceToText(this.data.messageSequenceDecodedWrong))
    disable(wrongDInput)
    return true
  }
  return false
}

Labwork.prototype.inputMessageSequenceDecodedWrong = function (button) {
  var sequenceInput = $("#message-sequence-decoded-wrong");
  var sequence = sequenceInput.val().trim();
  if (sequence != "") {
    var messageSequenceDecodedWrong = this.data.messageSequenceDecodedWrong
    var array = sequence.split(",")
    for (var i in array) {
      array[i] = parseInt(array[i])
    }
    if (!array.equals(messageSequenceDecodedWrong)) {
      error(sequenceInput)
    } else {
      disable(sequenceInput)
      this.data.messageExample = getRandomMessage();
      this.data.messageExampleSequence = this.textToSequence(this.data.messageExample)
      this.data.messageExampleSequenceEncoded = encode(this.data.e, this.data.n, this.data.messageExampleSequence)
      $("#message-sequence-encoded-example").val(this.data.messageExampleSequenceEncoded.join(","))
      if (debug) {
        $("#message-sequence-decoded-example").val(this.data.messageExampleSequence.join(","))
      }
      return true
    }
  }
  return false
}


Labwork.prototype.inputMessageSequenceDecodedExample = function (button) {
  var sequenceInput = $("#message-sequence-decoded-example");
  var sequence = sequenceInput.val().trim();
  if (sequence != "") {
    var messageExampleSequence = this.data.messageExampleSequence
    var array = sequence.split(",")
    for (var i in array) {
      array[i] = parseInt(array[i])
    }
    if (!array.equals(messageExampleSequence)) {
      error(sequenceInput)
    } else {
      disable(sequenceInput)
      $("#message-decoded-example").val(this.data.messageExample)
      return true
    }
  }
  return false
}

encode = function (e, n, sequenceArray) {
  var encodedArray = []
  for (var i in sequenceArray) {
    encodedArray[i] = encodeChar(e, n, sequenceArray[i])
  }
  return encodedArray
}

decode = function (d, n, sequenceArray) {
  var decodedArray = []
  for (var i in sequenceArray) {
    decodedArray[i] = decodeChar(d, n, sequenceArray[i])
  }
  return decodedArray
}

var encodeChar = (e, n, char) => parseInt(new Big(char).pow(e).mod(n))

var decodeChar = (d, n, char) => parseInt(new Big(char).pow(d).mod(n))

Labwork.prototype.hideAllSteps = function () {
  $(this.steps).each((i,step) => this.hideStep(step));
}

Labwork.prototype.hideStep = function (step) {
  $(`[data-step=${step}]`).hide();
}

Labwork.prototype.processStep = function (stepName) {
  var button = $(`button[data-step=${stepName}]`);
  if (this[stepName](button)) {
    var currentStepIndex = this.steps.indexOf(stepName);
    this.data.step = this.steps[currentStepIndex + 1];
    disable(button);
    this.showCurrentStep();
  }
}

Labwork.prototype.showCurrentStep = function () {
  this.showStep(this.data.step);
}

Labwork.prototype.showStep = function (step) {
  $(`[data-step=${step}]`).show();
}

Labwork.prototype.inputPQ = function (button) {
  var inputP = $("#numberP")
  var inputQ = $("#numberQ")
  var p = getPrimeOrNotify(inputP),
      q = getPrimeOrNotify(inputQ)
  if (p != -1 && q != -1) {
    if (p == q) {
      error()
    } else {
      this.data.p = p
      this.data.q = q
      disable(inputP)
      disable(inputQ)
      return true
    }
  }
  return false;
}

Labwork.prototype.inputN = function (button) {
  var inputN = $("#numberN")
  var n = getNumOrNotify(inputN)
  if (n != -1) {
    var product = this.data.p * this.data.q
    if (n != product) {
      error(inputN)
    } else {
      this.data.n = n;
      disable(inputN)
      return true
    }
  }
  return false
}

Labwork.prototype.inputC = function (button) {
  var inputC = $("#numberC")
  var c = getNumOrNotify(inputC)
  if (c != -1) {
    var result = (this.data.p-1) * (this.data.q-1)
    if (c != result) {
      error(inputC)
    } else {
      this.data.c = c;
      disable(inputC)
      return true
    }
  }
  return false
}

Labwork.prototype.inputD = function (button) {
  var inputD = $("#numberD")
  var d = getPrimeOrNotify(inputD)
  if (d != -1) {
    var result = gcd(d, this.data.c);
    if (result != 1) {
      error(inputD)
    } else {
      if (hasLessPrimeGCD(d, this.data.c)) {
        error(inputD)
      } else {
        this.data.d = d
        disable(inputD)
        return true
      }
    }
  }
  return false
}

Labwork.prototype.inputE = function (button) {
  var inputE = $("#numberE")
  var e = getNumOrNotify(inputE)
  if (e != -1) {
    var result = (e*this.data.d)%this.data.c;
    if (result != 1) {
      error(inputE)
    } else {
      this.data.e = e
      disable(inputE)
      return true
    }
  }
  return false
}

Labwork.prototype.inputPublicKey = function (button) {
  var pubkey1Input = $("#publickey-1")
  var pubkey2Input = $("#publickey-2")
  var pubkey1 = getNumOrNotify(pubkey1Input)
  var pubkey2 = getNumOrNotify(pubkey2Input)
  if (pubkey1 != -1 && pubkey2 != -1) {
    var success = true;
    if (pubkey1 != this.data.e) {
      error(pubkey1Input)
      success = false;
    }
    if (pubkey2 != this.data.n) {
      error(pubkey2Input)
      success = false;
    }
    if (success) {
      disable(pubkey1Input)
      disable(pubkey2Input)
      return true
    }
  }
  return false
}

Labwork.prototype.inputPrivateKey = function (button) {
  var privkey1Input = $("#privatekey-1")
  var privkey2Input = $("#privatekey-2")
  var privkey1 = getNumOrNotify(privkey1Input)
  var privkey2 = getNumOrNotify(privkey2Input)
  if (privkey1 != -1 && privkey2 != -1) {
    var success = true;
    if (privkey1 != this.data.d) {
      error(privkey1Input)
      success = false;
    }
    if (privkey2 != this.data.n) {
      error(privkey2Input)
      success = false;
    }
    if (success) {
      disable(privkey1Input)
      disable(privkey2Input)
      return true
    }
  }
  return false
}

Labwork.prototype.textToSequence = function (message) {
  var result = [];
  var messageArray = message.split("");
  for (var i in messageArray) {
    var encoded = this.transcode.code[messageArray[i]];
    if (encoded != undefined) {
      result.push(encoded)
    }
  }
  return result;
}

Labwork.prototype.sequenceToText = function (sequenceArray) {
  var result = [];
  for (var i in sequenceArray) {
    var encoded = this.transcode.symbol[sequenceArray[i]];
    if (encoded != undefined) {
      result.push(encoded)
    }
  }
  return result.join("");
}

var disable = function(input) {
  $(input).prop('disabled', true)
}

var hasLessPrimeGCD = function(max, c) {
  for (var i = max - 1; i > 2; i--) {
    if (isPrime(i)) {
      if (gcd(i, c) == 1) {
        return true
      }
    }
  }
  return false
}

var error = function (elem, message, position) {
  var msg = message == undefined ? "Ошибка" : message;
  var params = {
    position: position == undefined ? "bottom center" : position
  }
  if (elem == undefined) {
    $.notify(msg, params)
  } else {
    $(elem).notify(msg, params)
  }
}

var gcd = function(a, b) {
    if ( ! b) {
        return a;
    }

    return gcd(b, a % b);
};

var getNumOrNotify = function (elem) {
  var numString = elem.val().trim();
  var num = -1;
  if (numString == "" || isNaN(numString)) {
    error(elem);

  } else {
    num = parseInt(numString);
  }
  return num;
}

isPrime = function (n) {
  if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false;
  if (n==leastFactor(n)) return true;
  return false;
}

var leastFactor = function (n) {
  if (isNaN(n) || !isFinite(n)) return NaN;
  if (n==0) return 0;
  if (n%1 || n*n<2) return 1;
  if (n%2==0) return 2;
  if (n%3==0) return 3;
  if (n%5==0) return 5;
  var m = Math.sqrt(n);
  for (var i=7;i<=m;i+=30) {
    if (n%i==0)      return i;
    if (n%(i+4)==0)  return i+4;
    if (n%(i+6)==0)  return i+6;
    if (n%(i+10)==0) return i+10;
    if (n%(i+12)==0) return i+12;
    if (n%(i+16)==0) return i+16;
    if (n%(i+22)==0) return i+22;
    if (n%(i+24)==0) return i+24;
  }
  return n;
}

var getPrimeOrNotify = function (elem) {
  var numString = elem.val().trim();
  var num = -1;
  if (numString == "" || isNaN(numString)) {
    error(elem);

  } else {
    num = parseInt(numString);
    if (!isPrime(num)) {
      error(elem);
      num = -1;
    }
  }
  return num;
}

var createTable = function() {
  var codes = {
    number: "0123456789",
    pointing: ".,!?;: ",
    russianLower1: "абвгдеёжзийклмно",
    russianLower2: "прстуфхцчшщъыьэюя",
    russianUpper1: "АБВГДЕЁЖЗИЙКЛМНО",
    russianUpper2: "ПРСТУФХЦЧШЩЪЫЬЭЮЯ",
    englishLower1: "abcdefghijklm",
    englishLower2: "nopqrstuvwxyz",
    englishUpper1: "ABCDEFGHIJKLM",
    englishUpper2: "NOPQRSTUVWXYZ"
  }
  var codeToSymbol = {};
  var symbolToCode = {};
  var currentCode = 0;
  for (var key in codes) {
    var value = codes[key]
    var trSymbol = $(`#${key}Symbol`);
    var trCode = $(`#${key}Code`);
    for (var i in value) {
      var symbol = value[i];
      codeToSymbol[currentCode] = symbol;
      symbolToCode[symbol] = currentCode;
      $(`<td>${symbol}</td>`).appendTo(trSymbol);
      $(`<td>${currentCode}</td>`).appendTo(trCode);
      currentCode++;
    }
  }
  return {
    code: symbolToCode,
    symbol: codeToSymbol
  }
}

var messages = [
  "Скоро госы?",
  "Как вам СДЭС?",
  "Автоматическая электросвязь",
  "RSA это просто"
]

var getRandomMessage = function() {
  return messages[Math.floor(Math.random() * messages.length)]
}
