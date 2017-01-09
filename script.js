var speaker,
    mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    lastMessage = "";

function sayFrench(phrase) {
    var msg = new SpeechSynthesisUtterance(phrase);
    msg.lang = "fr-FR";
    speaker.speak(msg);
}

function trySmallNumber() {
    speaker.cancel();
    sayFrench(lastMessage = randomNumber());
    this.blur();
    $("#answer-date").hide();
    $("#answer-phone").hide();
    $("#answer-number").show();
    $("#button-submit").css("visibility", "visible");
}

function tryYear() {
    speaker.cancel();
    sayFrench (lastMessage = randomDate(new Date(1969, 0, 1), new Date()) );
    this.blur();
    console.log(lastMessage);
    $("#answer-phone").hide();
    $("#answer-number").hide();
    $("#answer-date").show();
    $("#button-submit").css("visibility", "visible");    
}

function tryPhone() {
    speaker.cancel();
    sayFrench(lastMessage = randomPhone());
    this.blur();
    console.log(lastMessage);
    $("#answer-number").hide();
    $("#answer-date").hide();    
    $("#answer-phone").show();
    $("#button-submit").css("visibility", "visible");
}

function repeat() {
    speaker.cancel();
    sayFrench(lastMessage);
    this.blur();
}

function checkAnswer() {
    var answer = $("#answers-here").find("input:visible").val();
    console.log(answer);
    this.blur();
}

function init() {    
    speaker = window.speechSynthesis;
    $("#button-try").click(trySmallNumber);    
    $("#button-year").click(tryYear);
    $("#button-phone").click(tryPhone);
    $("#button-repeat").click(repeat);
    $("#button-submit").click(checkAnswer);
}

function randomYear() {
    return 1920 + Math.round(100 * Math.random());
}

function randomNumber() {
    return Math.round(1000 * Math.random());
}

function randomPhone() {
    return Math.round(100000000 + 899999999 * Math.random()).toString().match(/.{1,2}/g).join(". ");
}

function randomDate(start, end) {
    var day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return day.getDate() + " " + mois[day.getMonth()] + " " + day.getFullYear();
}

$().ready(init);