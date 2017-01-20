var speaker,
    lastMessage = "",
    failureUtterance,
    successUtterance,
    lastUtterance,
    currentInput,
    inputShort,
    inputDate,
    inputPhone,
    $submitButton,
    $answersHere,
    $shortButton,
    $dateButton,
    $phoneButton,
    answer;

var frenchController = {
    failureMessage: "C'est incorrect.",
    successMessage: "C'est correct.",
    startMessage: "Salut !",
    lang: "fr-FR",
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],

    utterance: function(phrase) {
        var msg = new SpeechSynthesisUtterance(phrase);
        msg.lang = this.lang;
        return msg;
    },
    
    sayHello: function() {
        speaker.cancel();
        this.bindButtons();
        successUtterance = this.utterance(this.successMessage);
        failureUtterance = this.utterance(this.failureMessage);
        speaker.speak(this.utterance(this.startMessage));
    },    
    
    randomShort: function() {
        return Math.round(400 * Math.random());
    },  
        
    formatShort: function(x) {
        var stringified = String(x);
        return {
            pattern: stringified,
            placeholder: stringified.replace(/./g,"#")
        }
    },
            
    verifyShort: function (answer, pattern) {
        return answer == pattern;
    },
    
    randomPhone: function() {
        return this.formatPhone(Math.round(100000000 + 899999999 * Math.random()));
    },
    
    formatPhone: function(x) {
        return x.toString().match(/.{1,2}/g).join("-");
    },    
    
    verifyPhone: function(answer, pattern) {
        var sliceAnswer = parseInt(answer.split("-").join(""));
        return this.formatPhone(sliceAnswer) == pattern;        
    },

    randomDate: function(start, end) {
        var day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return this.formatDate(day.getDate(), day.getMonth(), day.getFullYear());
    },
    
    formatDate: function(day, month, year) {
        return day + " " + this.months[parseInt(month)] + " " + year;        
    },
      
    verifyDate: function(answer, pattern) {
        var sliceAnswer = answer.split("-");
        return this.formatDate(sliceAnswer [0], parseInt(sliceAnswer [1]) - 1, sliceAnswer [2]) == pattern;
    },
    
    tryGame: function (randomGenerator, verifyFunction, inputWindow) {
        speaker.cancel();
        lastMessage = randomGenerator;
        speaker.speak(lastUtterance = this.utterance(lastMessage) );
        substituteCurrent(inputWindow);
        $submitButton.off("click")
            .click(this.verifyAnswer.bind(this, verifyFunction) );                
        inputDate.hide();
        inputPhone.hide();
        inputShort.hide();
        inputWindow.show();
    },

    tryShort: function() {
        this.tryGame.call(
            this,
            this.randomShort(),
            this.verifyShort,
            inputShort
        );
    },
    
    tryDate: function() {
        this.tryGame.call(
            this, 
            this.randomDate(new Date(1969, 0, 1), new Date()), 
            this.verifyDate, 
            inputDate);
    },
    
    tryPhone: function() {
        this.tryGame.call(
            this,
            this.randomPhone(),
            this.verifyPhone,
            inputPhone
        );
    },
    
    verifyAnswer: function(verifyFunction) {
        verifyFunction = verifyFunction || verify;
        var $inputField = $answersHere.find("input:visible"),
            answer = $inputField.val();
        if (verifyFunction.call(this, answer, lastMessage)) 
            saySuccess();
        else 
            sayFailure();
    },
    
    bindButtons: function() {
        $shortButton.off("click")
            .click(this.tryShort.bind(this) );
        $phoneButton.off("click")
            .click(this.tryPhone.bind(this) );
        $dateButton.off("click")
            .click(this.tryDate.bind(this) );        
    }
}

var spanishController = Object.create(frenchController);

spanishController.months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
spanishController.startMessage = "Hola!";
spanishController.failureMessage = "Es incorrecte.";
spanishController.successMessage = "Es correcte.";
spanishController.lang = "es-ES";

function saySuccess() {
    speaker.speak(successUtterance);
}

function sayFailure() {
    speaker.speak(failureUtterance);
}

function substituteCurrent(newInput) {
    if(currentInput) {
        currentInput.val("");
    } else {
        thirdInit();
    }
    currentInput = newInput;
}

function repeat() {
    speaker.cancel();
    speaker.speak(lastUtterance);
}

function noVoices() {
    $("footer").show();
}

function findFrenchVoice(list) {
    for (var i = 0; i < list.length; i++) {
            if ( (list[i].lang) && (list[i].lang.startsWith("fr")) ) return true;
    }
    return false;
}

function init() {
    if(!("speechSynthesis" in window)) {
        noVoices();
        return;
    }
    speaker = window.speechSynthesis;
    if (findFrenchVoice (window.speechSynthesis.getVoices() ) ) 
        secondInit();
    else window.speechSynthesis.onvoiceschanged = function(e) {
        var voices = window.speechSynthesis.getVoices();
        if (findFrenchVoice(voices) && $("#button-short").attr("disabled")) {
            secondInit();
        }
    }
}

function secondInit() {
    $submitButton = $("#button-submit");
    inputShort = $("#answer-short");
    inputDate = $("#answer-date");
    inputPhone = $("#answer-phone");
    $answersHere = $("#answers-here");
    $shortButton = $("#button-short");
    $dateButton = $("#button-date");
    $phoneButton = $("#button-phone");
    frenchController.sayHello();    
    $("h2").css("visibility", "hidden");
    $("#button-repeat").click(repeat);
    $shortButton
        .removeAttr("disabled");
    $dateButton
        .removeAttr("disabled");
    $phoneButton
        .removeAttr("disabled");
    frenchController.bindButtons();
}

function thirdInit() {
    $("#button-submit").show();
    $("#button-repeat").show();
}

$().ready(init);
