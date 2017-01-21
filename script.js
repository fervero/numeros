var speaker,
    lastMessage = "",
    failureUtterance,
    successUtterance,
    lastUtterance,
    $input,
    $submitButton,
    $answersHere,
    $shortButton,
    $dateButton,
    $phoneButton,
    dateFrom = new Date(1989, 0, 1), 
    dateTo = new Date(2020, 11, 31),
    shortLimit = 1000;

var frenchController = {
    failureMessage: "C'est incorrect.",
    successMessage: "C'est correct.",
    startMessage: "Salut !",
    headerText: "Apprenons les chiffres français&nbsp;!",
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
        $("h1").html(this.headerText);
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
            thirdInit();
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
    }
}

var spanishController = jQuery.extend(Object.create(frenchController), {
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    startMessage: "Hola!",
    failureMessage: "Es incorrecte.",
    successMessage: "Es correcte.",
    headerText: "¡Aprendamos los números españoles!",
    lang: "es-ES",
    formatPhone: function(x) {
        var stringified = x.toString().match(/.{1,3}/g).join("-") 
        return {
            pattern: stringified.replace(/-/g, ". "),
            placeholder: stringified.replace(/[0-9]/g,"#")
        };
    }
});

var polishController = jQuery.extend(Object.create(frenchController), {
    months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
    startMessage: "Cześć!",
    failureMessage: "Niepoprawnie.",
    successMessage: "Poprawnie.",
    headerText: "Uczymy się liczb po polsku.",
    lang: "pl-PL",
    formatPhone: function(x) {
        var stringified = x.toString().match(/.{1,3}/g).join("-"); 
        return { 
            pattern: stringified, 
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
    lang: "en-UK",
    formatPhone: function(x) {
        var stringified = x.toString().match(/.{1,3}/g).join("-"); 
        return { 
            pattern: stringified, 
            placeholder: stringified.replace(/[0-9]/g,"#")
        };
    }
});


function saySuccess() {
    speaker.speak(successUtterance);
}

function sayFailure() {
    speaker.speak(failureUtterance);
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

function handleHashChange(e) {
    var languages = {
        pl: polishController,
        es: spanishController,
        fr: frenchController,
        en: englishController
    };
    var newHash = e.newURL.match(/#.*/)[0].slice(1);
    console.log(newHash);
    console.log(languages[newHash]);
    languages[newHash].sayHello();
}

function init() {
    window.addEventListener("hashchange", handleHashChange, false);
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
    $answersHere = $("#answers-here");
    $input = $("#answer");
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
    $("#answer").show();
    $("#button-submit").show();
    $("#button-repeat").show();
}

$().ready(init);