var speaker,
    mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function sayFrench(phrase) {
    var msg = new SpeechSynthesisUtterance(phrase);
    msg.lang = "fr-FR";
    speaker.speak(msg);
}

function trySmallNumber() {
    sayFrench(randomNumber());
    this.blur();       
}

function tryYear() {
    var day = randomDate(new Date(1969, 0, 1), new Date());
    sayFrench(day);
    this.blur();
    console.log(day);
}

function tryPhone() {
    var phone = randomPhone();
    sayFrench(phone);
    console.log(phone);
    this.blur();
}

function init() {    
    speaker = window.speechSynthesis;
    $("#button-try").click(trySmallNumber);    
    $("#button-year").click(tryYear);
    $("#button-phone").click(tryPhone);    
}

function randomYear() {
    return 1920 + Math.round(100 * Math.random());
}

function randomNumber() {
    return Math.round(1000 * Math.random());
}

function randomPhone() {
    return Math.round(100000000 + 899999999 * Math.random()).toString().match(/.{1,2}/g).join(", ");
}

function randomDate(start, end) {
    var day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return day.getDate() + " " + mois[day.getMonth()] + " " + day.getFullYear();
}

$().ready(init);