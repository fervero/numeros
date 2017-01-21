var speaker,
    lastMessage = "",
    failureUtterance,
    successUtterance,
    lastUtterance,
    $input,
    $submitButton,
    $repeatButton,
    $shortButton,
    $dateButton,
    $phoneButton,
    $pageTitle,
    $pleaseWait,
    dateFrom = new Date(1989, 0, 1), 
    dateTo = new Date(2020, 11, 31),
    shortLimit = 999;

var frenchController = {
    failureMessage: "C'est incorrect.",
    successMessage: "C'est correct.",
    startMessage: "Salut !",
    headerText: "Apprenons les chiffres français&nbsp;!",
    waitText: "En train de chercher une voix française&nbsp;...",
    lang: "fr-FR",
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    haveVoice: false,

    utterance: function(phrase) {
        var msg = new SpeechSynthesisUtterance(phrase);
        msg.lang = this.lang;
        return msg;
    },

    showWait: function() {
        $pleaseWait.html(this.waitText).show();
    },
    
    hideWait: function() {
        $pleaseWait.hide();
    },
    
    findMyVoice: function() {
        var voices = window.speechSynthesis.getVoices();
        for (var i = 0; i < voices.length; i++) {
                if ( (voices[i].lang) && (voices[i].lang.startsWith(this.lang.substr(0,2) ) ) )
                    return this.haveVoice = true;
        }        
        return false;
    },
    
    sayHello: function() {
        $pageTitle.html(this.headerText);
        speaker.cancel();
        this.bindButtons();
        if (this.haveVoice || this.findMyVoice() )
            this.startGame();
        else {
            this.showWait();
            disableButtons();
            window.speechSynthesis.onvoiceschanged = function() {
                if(this.findMyVoice()) {
                    window.speechSynthesis.onvoiceschanged = null;
                    this.startGame();
                }
            }.bind(this);
        };
    },
    
    startGame: function() {
        this.hideWait();
        successUtterance = this.utterance(this.successMessage);
        failureUtterance = this.utterance(this.failureMessage);
        speaker.speak(this.utterance(this.startMessage));
        enableButtons();
    },
    
    randomShort: function() {
        return this.formatShort( Math.round(shortLimit * Math.random()) );
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
        var stringified = x.toString().match(/.{1,2}/g).join("-") 
        return {
            pattern: stringified,
            placeholder: stringified.replace(/[0-9]/g,"#")
        };
    },
    
    verifyPhone: function(answer, pattern) {
        var sliceAnswer = parseInt(answer.split(/\D/).join(""));
        return this.formatPhone(sliceAnswer).pattern == pattern;
    },

    randomDate: function(start, end) {
        start = start || dateFrom;
        end = end || dateTo;
        var day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return this.formatDate(day.getDate(), day.getMonth(), day.getFullYear());
    },
    
    formatDate: function(day, month, year) {
        var stringified = day + " " + this.months[parseInt(month)] + " " + year;
        return {
            pattern: stringified,
            placeholder: "##-##-####" // Don't really foresee any variances here.
        }
    },
      
    verifyDate: function(answer, pattern) {
        var sliceAnswer = answer.split(/\D/);
        sliceAnswer[1] = parseInt(sliceAnswer[1]) - 1;
        return this.formatDate.apply(this, sliceAnswer).pattern == pattern;
    },
    
    tryGame: function (newAnswer, formatFunction, verifyFunction, placeholder) {
        speaker.cancel();
        if (!(lastMessage)) {
            secondInit();
        }
        lastMessage = newAnswer.pattern;
        speaker.speak(lastUtterance = this.utterance(lastMessage) );
        $submitButton.off("click")
            .click(this.verifyAnswer.bind(this, verifyFunction) );                
        $input.attr("placeholder", newAnswer.placeholder);
        $input.val("");
    },

    tryShort: function() {
        this.tryGame.call(
            this,
            this.randomShort(),
            this.formatShort,
            this.verifyShort,
            "###"
        );
    },
    
    tryDate: function() {
        this.tryGame.call(
            this, 
            this.randomDate(), 
            this.formatDate,
            this.verifyDate, 
            "##-##-####");
    },
    
    tryPhone: function() {
        this.tryGame.call(
            this,
            this.randomPhone(),
            this.formatPhone,
            this.verifyPhone,
            "##-##-##-##-#"
        );
    },
    
    verifyAnswer: function(verifyFunction) {
        verifyFunction = verifyFunction || verify;
        answer = $input.val();
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
        $input.val("");
        lastMessage = "";
        lastUtterance = null;
    }
}

var spanishController = jQuery.extend(Object.create(frenchController), {
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    startMessage: "Hola!",
    failureMessage: "Es incorrecte.",
    successMessage: "Es correcte.",
    headerText: "¡Aprendamos los números españoles!",
    waitText: "Buscando una voz española&nbsp;...",
    lang: "es-ES",
    formatPhone: function(x) {
        var stringified = x.toString().match(/.{1,3}/g).join("-") 
        return {
            pattern: stringified.replace(/-/g, ". "),
            placeholder: stringified.replace(/[0-9]/g,"#")
        };
    }
});

var englishController = jQuery.extend(Object.create(frenchController), {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    startMessage: "Hello!",
    failureMessage: "Incorrect.",
    successMessage: "Correct.",
    headerText: "Let's learn English numbers.",
    waitText: "Looking for an English voice...",
    lang: "en-UK",
    formatPhone: function(x) {
        var stringified = x.toString().match(/.{1,3}/g).join("-"); 
        return { 
            pattern: stringified, 
            placeholder: stringified.replace(/[0-9]/g,"#")
        };
    }
});

var polishController = jQuery.extend(Object.create(englishController), {
    months: ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia "],
    startMessage: "Cześć!",
    failureMessage: "Niepoprawnie.",
    successMessage: "Poprawnie.",
    headerText: "Uczymy się liczb po polsku.",
    waitText: "Szukam polskiego głosu...",
    lang: "pl-PL"
});


function saySuccess() {
    speaker.speak(successUtterance);
}

function sayFailure() {
    speaker.speak(failureUtterance);
}

function repeat() {
    speaker.cancel();
    if(lastUtterance) speaker.speak(lastUtterance);
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

function changeLanguage(hash) {
    var languages = {
        pl: polishController,
        es: spanishController,
        fr: frenchController,
        en: englishController
    };
    if (!(hash in languages)) hash = "fr";
    languages[hash].sayHello();
}

function handleHashChange(e) {
    changeLanguage(e.newURL.match(/#.*/)[0].slice(1));
}

function cacheButtons() {
    speaker = window.speechSynthesis;
    $pageTitle = $("#page-header");
    $pleaseWait = $("#wait-header");
    $submitButton = $("#button-submit");
    $input = $("#answer");
    $shortButton = $("#button-short");
    $dateButton = $("#button-date");
    $phoneButton = $("#button-phone");
    $pleaseWait = $("#wait-header");
    $repeatButton = $("#button-repeat");
}
    
function enableButtons() {
    [
        $submitButton,
        $shortButton,
        $dateButton,
        $phoneButton,
        $repeatButton
    ].forEach(function (x) {
        x.removeAttr("disabled");
    });
}
    
function disableButtons() {
    [
        $submitButton,
        $shortButton,
        $dateButton,
        $phoneButton,
        $repeatButton
    ].forEach(function (x) {
        x.attr("disabled", "disabled");
    });
}

function init() {
    if(!("speechSynthesis" in window)) {
        noVoices();
        return;
    }
    window.speechSynthesis.getVoices();
    cacheButtons();
    $repeatButton.click(repeat);
    window.addEventListener("hashchange", handleHashChange, false);    
    changeLanguage(window.location.hash.slice(1));
}

function secondInit() {
    $("#answer").show();
    $("#button-submit").show();
    $("#button-repeat").show();
}

$().ready(init);