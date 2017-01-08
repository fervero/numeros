var speaker,
    mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function sayFrench(phrase) {
    var msg = new SpeechSynthesisUtterance(phrase);
    msg.lang = "fr-FR";
    speaker.speak(msg);
}

function init() {    
    speaker = window.speechSynthesis;
    $("#button-try").click(function() {
        sayFrench(randomNumber());});
    $("#button-year").click(function() {
        var day = randomDate(new Date(1969, 0, 1), new Date());
        console.log(day);
        sayFrench(day);
    })
}

function randomYear() {
    return 1920 + Math.round(100 * Math.random());
}

function randomNumber() {
    return Math.round(1000 * Math.random());
}

function randomDate(start, end) {
    var day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return day.getDate() + " " + mois[day.getMonth()] + " " + day.getFullYear();
}

$().ready(init);