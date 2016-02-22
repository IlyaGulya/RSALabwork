`use strict`;

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

  var lab = new Labwork();

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
  createTable(this.codes);
//  this.hideAllSteps()
  this.data = {};
  this.data.step = "inputPQ";
  this.showCurrentStep();
}

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
    pointing: ".,!?;:",
    russianLower1: "абвгдеёжзийклмно",
    russianLower2: "прстуфхцчшщъыьэюя",
    russianUpper1: "АБВГДЕЁЖЗИЙКЛМНО",
    russianUpper2: "ПРСТУФХЦЧШЩЪЫЬЭЮЯ",
    englishLower1: "abcdefghijklm",
    englishLower2: "nopqrstuvwxyz",
    englishUpper1: "ABCDEFGHIJKLM",
    englishUpper2: "NOPQRSTUVWXYZ"
  }
  this.codeToSymbol = {};
  this.symbolToCode = {};
  var currentCode = 0;
  for (var key in codes) {
    var value = codes[key]
    var trSymbol = $(`#${key}Symbol`);
    var trCode = $(`#${key}Code`);
    for (var i in value) {
      var symbol = value[i];
      this.codeToSymbol[currentCode] = symbol;
      this.symbolToCode[symbol] = currentCode;
      $(`<td>${symbol}</td>`).appendTo(trSymbol);
      $(`<td>${currentCode}</td>`).appendTo(trCode);
      currentCode++;
    }
  }
}
