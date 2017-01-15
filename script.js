var speaker,
    mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    lastMessage = "",
    failureMessage,
    successMessage,
    currentInput,
    inputShort,
    inputDate,
    inputPhone,
    $answersHere,
    verify = function() {return};

function sayFrench(phrase) {
    var msg = new SpeechSynthesisUtterance(phrase);
    msg.lang = "fr-FR";
    speaker.speak(msg);
}

function saySuccess() {
    speaker.speak(successMessage);
}

function sayFailure() {
    speaker.speak(failureMesage);
}

function substituteCurrent(newInput) {
    if(currentInput) {
        currentInput.val("");
    } else {
        thirdInit();
    }
    currentInput = newInput;
}

function randomNumber() {
    return Math.round(1000 * Math.random());
}

function tryShort() {
    speaker.cancel();
    sayFrench(lastMessage = randomNumber());
    verify = verifyShort;
    this.blur();
    substituteCurrent(inputShort);
    inputDate.hide();
    inputPhone.hide();
    inputShort.show();
}

function verifyShort (answer, pattern) {
    return answer == pattern;
}

function formatDate(day, month, year) {
    return day + " " + mois[parseInt(month)] + " " + year;
}

function randomDate(start, end) {
    var day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return formatDate(day.getDate(), day.getMonth(), day.getFullYear());
}

function tryDate() {
    speaker.cancel();
    sayFrench (lastMessage = randomDate(new Date(1969, 0, 1), new Date()) );
    verify = verifyDate;
    this.blur();
    substituteCurrent(inputDate);
    inputPhone.hide();
    inputShort.hide();
    inputDate.show();
}

function verifyDate (answer, pattern) {
    var sliceAnswer = answer.split("-");
    return formatDate(sliceAnswer [0], parseInt(sliceAnswer [1]) - 1, sliceAnswer [2]) == pattern;
}

function formatPhone(x) {
    return x.toString().match(/.{1,2}/g).join("-");
}

function randomPhone() {
    return formatPhone(Math.round(100000000 + 899999999 * Math.random()));
}

function tryPhone() {
    speaker.cancel();
    sayFrench(lastMessage = randomPhone());
    this.blur();
    verify = verifyPhone;
    substituteCurrent(inputPhone);
    inputShort.hide();
    inputDate.hide();    
    inputPhone.show();
}

function verifyPhone(answer, pattern) {
    var sliceAnswer = parseInt(answer.split("-").join(""));
    return formatPhone(sliceAnswer) == pattern;
}

function repeat() {
    speaker.cancel();
    sayFrench(lastMessage);
    this.blur();
}

function checkAnswer() {
    var $inputField = $answersHere.find("input:visible"),
        answer = $inputField.val();
    if (verify(answer, lastMessage)) 
        saySuccess();
    else 
        sayFailure();
    this.blur();
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
    sayFrench("Salut!");
    inputShort = $("#answer-short");
    inputDate = $("#answer-date");
    inputPhone = $("#answer-phone");
    $answersHere = $("#answers-here");
    successMessage = new SpeechSynthesisUtterance("Correct.");
    successMessage.lang = "fr-FR";
    failureMesage = new SpeechSynthesisUtterance("Incorrect.");
    failureMesage.lang = "fr-FR";
    $("h2").css("visibility", "hidden");
    $("#button-repeat").click(repeat);
    $("#button-submit").click(checkAnswer);
    $("#button-short").removeAttr("disabled").click(tryShort);    
    $("#button-date").removeAttr("disabled").click(tryDate);
    $("#button-phone").removeAttr("disabled").click(tryPhone);

}

function thirdInit() {
    $("#button-submit").show();
    $("#button-repeat").show();
}

$().ready(init);
