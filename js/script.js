/*

Copyright (c) 2017, Maciej Bójko.
All rights reserved.

*/

(function() {
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
        $lowerButtons,
        $pageTitle,
        $pleaseWait,
        dateFrom = new Date(1989, 0, 1), 
        dateTo = new Date(2020, 11, 31),
        shortLimit = 999;

    var frenchController = {
        failureMessage: "C'est incorrect.",
        successMessage: "C'est correct.",
        startMessage: "Salut !",
        headerText: "Apprenons les chiffres français&#8239;!",
        waitText: "En train de chercher une voix française...",
        lang: "fr",
        months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        haveVoice: false,
        
        randomVoice: function() {
            var voices = speaker.getVoices(),
                lang = this.lang;
            var compatibleVoices = voices.filter(function(elem) {
                return (elem.lang) && (elem.lang.startsWith(lang));
            });
            var i = Math.floor(Math.random() * compatibleVoices.length);
            return compatibleVoices[i];
        },

        utterance: function(phrase) {
// Turns the given string in a speaken utterance in French.
            var msg = new SpeechSynthesisUtterance(phrase);
            msg.lang = this.lang;
            msg.voice = this.randomVoice();
            return msg;
        },

        showWait: function() {
/* The input field, "repeat" and "verify" buttons should be visible only when a question has been asked. This
method and the next take care of showing and hiding them as needed.*/
            $pleaseWait.html(this.waitText).show();
        },

        hideWait: function() {
            $pleaseWait.hide();
        },

        findMyVoice: function() {
// Checks whether the browser speaks French.
            var voices = window.speechSynthesis.getVoices(),
                lang = this.lang;
            return voices.some(function(elem) {
                return (elem.lang) && (elem.lang.startsWith(lang))
            });            
        },

        initController: function() {
/* Substitutes the text strings on screen for French ones; binds buttons to the appropriate handlers; and politely
waits for the browser to make a French voice available. */
            $pageTitle.html(this.headerText);
            speaker.cancel();
            this.bindButtons();
            if (this.haveVoice || (this.haveVoice = this.findMyVoice() ) )
                this.sayHello();
            else {
                this.showWait();
                disableButtons();
                window.speechSynthesis.onvoiceschanged = function() {
                    if(this.haveVoice = this.findMyVoice() ) {
                        window.speechSynthesis.onvoiceschanged = null;
                        this.sayHello();
                    }
                }.bind(this);
            };
        },

        sayHello: function() {
// This function is called when we're all ready to play. 
            this.hideWait();
            successUtterance = this.utterance(this.successMessage);
            failureUtterance = this.utterance(this.failureMessage);
            var hello = this.utterance(this.startMessage);
            hello.onstart = enableButtons;
            speaker.speak(hello);
        },

        randomShort: function() {
// Gives a random number for the "short number" (by default 0...999) version of the test.
            return this.formatShort( Math.round(shortLimit * Math.random()) );
        },  

        formatShort: function(x) {
/* An object: the actual number, which is spoken by the TTS and compared against the user's answer,
and a "###"-like placeholder to put on the input field. */
            var stringified = String(x);
            return {
                pattern: stringified,
                placeholder: stringified.replace(/./g,"#")
            }
        },

        verifyShort: function (answer, pattern) {
// OK, I'm not explaining this one... 
            return answer == pattern;
        },

        randomPhone: function() {
// Just a random 9-figures number. The magic is in the formatting
            return this.formatPhone(Math.round(100000000 + 899999999 * Math.random()));
        },

        formatPhone: function(x) {
// See formatShort. This one differs from language to language. The French, for example, group the digits by two. Or so I've been led to believe.            
            var stringified = x.toString().match(/.{1,2}/g).join("-") 
            return {
                pattern: stringified,
                placeholder: stringified.replace(/[0-9]/g,"#")
            };
        },

        verifyPhone: function(answer, pattern) {
// Not much more complicated than the verifyShort.
            var sliceAnswer = parseInt(answer.split(/\D/).join(""));
            return this.formatPhone(sliceAnswer).pattern == pattern;
        },

        randomDate: function(start, end) {
// The parameters may be passed, if not, there are the global ends. Months are numbered 0...11 here.
            start = start || dateFrom;
            end = end || dateTo;
            var day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            return this.formatDate(day.getDate(), day.getMonth(), day.getFullYear());
        },

        formatDate: function(day, month, year) {
// dd-mm-yyyy, generally. Months are numbered 0...11 here.
            var stringified = day + " " + this.months[parseInt(month)] + " " + year;
            return {
                pattern: stringified,
                placeholder: "jj-mm-aaaa" // Don't really foresee any variance here.
            }
        },

        verifyDate: function(answer, pattern) {
// The user counts the months from 1 to 12. The function deals with that.
            var sliceAnswer = answer.split(/\D/);
            sliceAnswer[1] = parseInt(sliceAnswer[1]) - 1;
            return this.formatDate.apply(this, sliceAnswer).pattern == pattern;
        },

        tryGame: function (newAnswer, formatFunction, verifyFunction, placeholder) {
/* That's where the magic happens. Interrupt the speaker, if it's currently speaking.
Adapts the verify/repeat buttons and the input window to the particular exercise, 
if hidden - shows them. */
            speaker.cancel();
            if (!(lastMessage)) {
                showAnswers();
            }
            lastMessage = newAnswer.pattern;
            speaker.speak(lastUtterance = this.utterance(lastMessage) );
            $lowerButtons.submit(this.verifyAnswer.bind(this, verifyFunction));
            $input.attr("placeholder", newAnswer.placeholder);
            $input.val("");
        },

        tryShort: function() {
// And these two just call the tryGame function with the appropriate parameters.
            this.tryGame.call(
                this,
                this.randomShort(),
                this.formatShort,
                this.verifyShort
            );
        },

        tryDate: function() {
            this.tryGame.call(
                this, 
                this.randomDate(), 
                this.formatDate,
                this.verifyDate 
            );
        },

        tryPhone: function() {
            this.tryGame.call(
                this,
                this.randomPhone(),
                this.formatPhone,
                this.verifyPhone
            );
        },

        verifyAnswer: function(verifyFunction) {
// Wraps the logic of the given verifying function with the user interface - speaking.
            speaker.cancel();
            answer = $input.val();
            if (verifyFunction.call(this, answer, lastMessage)) 
                saySuccess();
            else 
                sayFailure();
            return false;
        },

        bindButtons: function() {
// Clears any present event handlers attached to the buttons, and attaches the right ones.
            $shortButton.off("click")
                .click(this.tryShort.bind(this) );
            $phoneButton.off("click")
                .click(this.tryPhone.bind(this) );
            $dateButton.off("click")
                .click(this.tryDate.bind(this) );
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
        lang: "es",
        formatPhone: function(x) {
            var stringified = x.toString().match(/.{1,3}/g).join("-") 
            return {
                pattern: stringified.replace(/-/g, ". "),
                placeholder: stringified.replace(/[0-9]/g,"#")
            };
        },
        formatDate: function(day, month, year) {
            var stringified = day + " " + this.months[parseInt(month)] + " " + year;
            return {
                pattern: stringified,
                placeholder: "dd-mm-aaaa"
            }
        }        
    });

    var polishController = jQuery.extend(Object.create(frenchController), {
// Here, besides basic translation, will go the subtle differences between how one says a date, or a phone number, in different languages.
        months: ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia "],
        startMessage: "Cześć!",
        failureMessage: "Niepoprawnie.",
        successMessage: "Poprawnie.",
        headerText: "Uczymy się liczb po polsku.",
        waitText: "Szukam polskiego głosu...",
        lang: "pl",
        formatPhone: function(x) {
            var stringified = x.toString().match(/.{1,3}/g).join("-"); 
            return { 
                pattern: stringified, 
                placeholder: stringified.replace(/[0-9]/g,"#")
            };
        },
        formatDate: function(day, month, year) {
            var stringified = day + " " + this.months[parseInt(month)] + " " + year;
            return {
                pattern: stringified,
                placeholder: "dd-mm-rrrr"
            }
        }   
    });

    var englishController = jQuery.extend(Object.create(polishController), {
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        startMessage: "Hello!",
        failureMessage: "Incorrect.",
        successMessage: "Correct.",
        headerText: "Let's learn English numbers.",
        waitText: "Looking for an English voice...",
        lang: "en",
        formatDate: function(day, month, year) {
// Specifically, the customary month-day-year order requires a tiny bit of extra attention.
            var stringified = this.months[parseInt(month)] + " " + day + " " + year;
            return {
                pattern: stringified,
                placeholder: "mm-dd-yyyy"
            }
        },
        verifyDate: function(answer, pattern) {
            var sliceAnswer = answer.split(/\D/);
            sliceAnswer[0] = parseInt(sliceAnswer[0]) - 1;
            return this.formatDate.apply(this, [ sliceAnswer[1], sliceAnswer[0], sliceAnswer[2] ]).pattern == pattern;
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
        if(lastUtterance) speaker.speak(lastUtterance);
    }

    function noVoices() {
// If the browser supports no Web Speech API at ALL, this function is called.
        $("#speechless").show();
    }

    function changeLanguage(hash) {
// This function is responsible both for initializing and for changing the controller, according to the selected language.
        disableButtons();
        var languages = {
            pl: polishController,
            es: spanishController,
            fr: frenchController,
            en: englishController
        };
        hideAnswers();
        if (!(hash in languages)) hash = "fr";
        languages[hash].initController();
    }

    function handleHashChange(e) {
// Just get the new hash, cut off the "#" and pass it over to the proper function.
        $('body').toggleClass("flipped");
        changeLanguage(e.newURL.match(/#.*/)[0].slice(1));
    }

    function cacheButtons() {
// So we don't go into the DOM every time we need to show, or hide, or change event handlers, or whatever.
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
        $lowerButtons = $("#answers-here");
    }

/* No real for a detailed explanation what the functions below do. 
"Answers" here means: input field, repeat button, submit button. */
    
    function showAnswers() {
        $lowerButtons.show().css("display", "flex");
    }

    function hideAnswers() {
        $lowerButtons.hide();
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

// And here we start the fun. Unless the browser doesn't support the Web Speech API, then we immediately end the fun.    
    
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

    $().ready(init);
})();