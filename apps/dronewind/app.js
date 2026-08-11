// dronewind - Meteo pilota per Bangle.js 2 (stile LCD retro)
// Vento a terra, a 120m di quota e raffiche da Open-Meteo.
// Posizione dal GPS (o dal GPS del telefono via Gadgetbridge).
// Tap sullo schermo = aggiorna. Pulsante = esci.

var W = g.getWidth();
var H = g.getHeight();
var data = null;        // ultimi dati meteo ricevuti
var lastFix = null;     // ultima posizione GPS usata
var state = "gps";      // gps | http | ok | nogps | nohttp | nobt | err
var lastUpdate = null;
var gpsTimeout;

require("Font7x11Numeric7Seg").add(Graphics);

var DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function dirName(deg) {
  return DIRS[Math.round(deg / 45) % 8];
}

// coordinate compatte in gradi e primi: N45 28' E9 11'
function fmtCoord(v, isLat) {
  var dir = isLat ? (v >= 0 ? "N" : "S") : (v >= 0 ? "E" : "W");
  v = Math.abs(v);
  var d = Math.floor(v);
  var m = Math.round((v - d) * 60);
  if (m === 60) { d++; m = 0; }
  return dir + d + " " + ("0" + m).substr(-2) + "'";
}
function fmtPos(f) {
  return fmtCoord(f.lat, true) + " " + fmtCoord(f.lon, false);
}

function drawValueRow(label, value, y) {
  g.setColor("#000");
  g.setFont("6x8").setFontAlign(-1, 0);
  g.drawString(label, 12, y);
  g.setFont("7x11Numeric7Seg", 2).setFontAlign(1, 0);
  g.drawString(value, 128, y);
  g.setFont("6x8").setFontAlign(-1, 0);
  g.drawString("m/s", 133, y);
}

function draw() {
  g.reset();
  g.setBgColor("#fff").clearRect(Bangle.appRect);
  g.setColor("#000");
  // intestazione in grassetto e cornice
  g.setFont("6x8").setFontAlign(0, 0);
  g.drawString("bangle.js DroneWind", 88, 31);
  g.drawString("bangle.js DroneWind", 89, 31);
  g.drawRect(2, 36, 173, 172);
  g.drawRect(3, 37, 172, 171);
  // stato in alto: GPS a sinistra, ora aggiornamento a destra
  g.setFont("6x8");
  g.setFontAlign(-1, 0);
  var status = {
    gps: "GPS...", http: "METEO...", ok: "GPS OK",
    nogps: "NO GPS", nohttp: "NO GADGETBR.",
    nobt: "NO BLUETOOTH", err: "ERRORE"
  }[state];
  // a dati ricevuti, al posto di "GPS OK" mostra la posizione in gradi e primi
  if (state === "ok" && lastFix) status = fmtPos(lastFix);
  g.drawString(status, 12, 47);
  if (lastUpdate) {
    g.setFontAlign(1, 0);
    g.drawString(
      ("0" + lastUpdate.getHours()).substr(-2) + ":" +
      ("0" + lastUpdate.getMinutes()).substr(-2), 163, 47);
  }
  // i tre numeri che decidono un volo
  drawValueRow("TERRA", data ? data.ground.toFixed(1) : "--", 70);
  drawValueRow("120m", data ? data.aloft.toFixed(1) : "--", 100);
  drawValueRow("RAFF.", data ? data.gusts.toFixed(1) : "--", 130);
  g.drawLine(10, 144, 165, 144);
  // direzione del vento (da dove arriva) e temperatura
  if (data) {
    var cx = 28, cy = 158;
    g.drawCircle(cx, cy, 9);
    // freccia meteo: indica dove va il vento (provenienza + 180)
    var rot = (data.dir + 180) * Math.PI / 180;
    g.fillPoly(g.transformVertices(
      [0, -7, 4, 5, 0, 2, -4, 5],
      { x: cx, y: cy, rotate: rot }
    ));
    g.setFont("6x8").setFontAlign(-1, 0);
    g.drawString(dirName(data.dir) + " " + Math.round(data.dir), 44, 158);
    g.setFontAlign(1, 0);
    g.drawString(Math.round(data.temp) + " C", 163, 158);
  }
}

function fetchWeather(lat, lon) {
  state = "http";
  draw();
  if (!Bangle.http) {
    state = "nohttp";
    return draw();
  }
  var url = "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + lat.toFixed(4) + "&longitude=" + lon.toFixed(4) +
    "&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m" +
    "&hourly=wind_speed_120m&forecast_hours=1&wind_speed_unit=ms";
  Bangle.http(url, { timeout: 20000 }).then(function (r) {
    var j = JSON.parse(r.resp);
    data = {
      ground: j.current.wind_speed_10m,
      aloft: j.hourly.wind_speed_120m[0],
      gusts: j.current.wind_gusts_10m,
      dir: j.current.wind_direction_10m,
      temp: j.current.temperature_2m
    };
    lastUpdate = new Date();
    state = "ok";
    draw();
  }).catch(function (e) {
    state = (String(e).indexOf("Bluetooth") >= 0) ? "nobt" : "err";
    draw();
  });
}

function update() {
  state = "gps";
  draw();
  Bangle.setGPSPower(1, "dronewind");
  if (gpsTimeout) clearTimeout(gpsTimeout);
  gpsTimeout = setTimeout(function () {
    // nessun fix entro 60s: GPS spento per non consumare
    Bangle.setGPSPower(0, "dronewind");
    if (state === "gps") { state = "nogps"; draw(); }
  }, 60000);
}

Bangle.on("GPS", function (fix) {
  if (!fix.fix) return;
  Bangle.setGPSPower(0, "dronewind");
  if (gpsTimeout) clearTimeout(gpsTimeout);
  lastFix = { lat: fix.lat, lon: fix.lon };
  fetchWeather(fix.lat, fix.lon);
});

Bangle.setUI({
  mode: "custom",
  back: function () { load(); },        // pulsante/back = esci
  touch: function () { update(); },     // tap = aggiorna
  remove: function () {
    Bangle.setGPSPower(0, "dronewind");
    if (gpsTimeout) clearTimeout(gpsTimeout);
  }
});
g.setBgColor("#fff");
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
update();
