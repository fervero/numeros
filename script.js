var speaker,
    mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    lastMessage = "",
    failureMessage,
    successMessage,
    currentInput,
    inputShort,
    inputDate,
    inputPhone;

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
        secondInit();
    }
    currentInput = newInput;
}

function randomNumber() {
    return Math.round(1000 * Math.random());
}

function tryShort() {
    speaker.cancel();
    sayFrench(lastMessage = randomNumber());
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
    return day + " " + mois[parseInt(month) - 1] + " " + year;
}

function randomDate(start, end) {
    var day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return formatDate(day.getDate(), day.getMonth(), day.getFullYear());
}

function tryDate() {
    speaker.cancel();
    sayFrench (lastMessage = randomDate(new Date(1969, 0, 1), new Date()) );
    this.blur();
    substituteCurrent(inputDate);
    inputPhone.hide();
    inputShort.hide();
    inputDate.show();
}

function verifyDate (answer, pattern) {
    var sliceAnswer = answer.split("-");
    return formatDate(sliceAnswer [0], sliceAnswer [1], sliceAnswer [2]) == pattern;
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
    var $inputField = $("#answers-here").find("input:visible"),
        answer = $inputField.val(),
        success;
    console.log(answer, " =? ", lastMessage);
    switch ($inputField.attr("name")) {
        case "short" : success = verifyShort(answer, lastMessage);
            break;
        case "date" : success = verifyDate(answer, lastMessage);
            break;
        case "phone" : success = verifyPhone(answer, lastMessage);
    }
    if (success) saySuccess();
    else sayFailure();
    this.blur();
}

function init() {    
    speaker = window.speechSynthesis;
    inputShort = $("#answer-short");
    inputDate = $("#answer-date");
    inputPhone = $("#answer-phone");
    successMessage = new SpeechSynthesisUtterance("Correct.");
    successMessage.lang = "fr-FR";
    failureMesage = new SpeechSynthesisUtterance("Incorrect.");
    failureMesage.lang = "fr-FR";
    $("#button-short").click(tryShort);    
    $("#button-date").click(tryDate);
    $("#button-phone").click(tryPhone);
    $("#button-repeat").click(repeat);
    $("#button-submit").click(checkAnswer);
}

function secondInit() {
    $("#button-submit").show();
    $("#button-repeat").show();
}

$().ready(init);