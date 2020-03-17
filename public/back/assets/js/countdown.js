function startTimer(duration, display) {
  var alert;
  var timer = duration,
    minutes,
    seconds;
  setInterval(function() {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = minutes + ":" + seconds;

    // if (--timer < 0) {
    //   timer = duration;
    // }

    if (--timer < 0) {
      // alert = true;
      document.getElementById("time").innerHTML = "EXPIRED";
      window.location.href = "http://localhost:3000/mentor/dashboard";
      window.alert("Time is Up");
    }
  }, 1000);
}

window.onload = function() {
  var fiveMinutes = 60 * 0.3,
    display = document.querySelector("#time");
  startTimer(fiveMinutes, display);
};
