// retrobin - Orologio binario per Bangle.js 2 (stile LCD retro)
// Sfondo chiaro tipo LCD, tutto in nero: pallini binari, potenze di 2,
// cifre binarie e ora a 7 segmenti. Cornice e data come i Casio classici.

var SPACING = 24;   // distanza orizzontale tra i pallini
var DOT_R = 9;      // raggio dei pallini
var drawTimeout;
// data abbreviata nella lingua dell'utente (modulo locale di sistema)
var locale = require("locale");

// font a 7 segmenti (risolto al momento dell'upload)
require("Font7x11Numeric7Seg").add(Graphics);

// ridisegna esattamente allo scatto del minuto successivo (risparmia batteria)
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

// numero in binario con zeri iniziali fino a n cifre
function bin(v, n) {
  var s = v.toString(2);
  while (s.length < n) s = "0" + s;
  return s;
}

function drawRow(value, nbits, y) {
  var startX = (g.getWidth() - nbits * SPACING) / 2 + SPACING / 2;
  // etichette in 6x8: piccolo ma nitido, il 7 segmenti a questa
  // dimensione impasta le cifre doppie come 16 e 32
  g.setFont("6x8").setFontAlign(0, 0).setColor("#000");
  for (var i = 0; i < nbits; i++) {
    var pow = nbits - 1 - i;            // bit più significativo a sinistra
    var x = startX + i * SPACING;
    var on = (value >> pow) & 1;
    if (on) {
      g.fillCircle(x, y, DOT_R);
    } else {
      g.drawCircle(x, y, DOT_R);
      g.drawCircle(x, y, DOT_R - 1);    // doppio cerchio = bordo più visibile
    }
    g.drawString(1 << pow, x, y + DOT_R + 8);
  }
}

function draw() {
  var d = new Date();
  g.reset();
  g.setBgColor("#fff").clearRect(Bangle.appRect);
  g.setColor("#000");
  // intestazione stile Casio: "bangle.js" grande, "binclock" piccolo accanto
  var brand = "bangle.js";
  var model = "retrobin";
  g.setFont("6x8", 2);
  var bw = g.stringWidth(brand);
  g.setFont("6x15");
  var hx = (g.getWidth() - (bw + 6 + g.stringWidth(model))) / 2;
  g.setFont("6x8", 2).setFontAlign(-1, 0);
  g.drawString(brand, hx, 32);           // senza grassetto: piu' leggero
  g.setFont("6x15").setFontAlign(-1, 0);
  g.drawString(model, hx + bw + 6, 33);  // 6x15: alto e stretto, stile condensed
  // cornice
  g.drawRect(2, 42, 173, 172);
  g.drawRect(3, 43, 172, 171);
  // le due righe binarie a pallini
  drawRow(d.getHours(), 5, 59);
  drawRow(d.getMinutes(), 6, 99);
  // cifre binarie, gruppo unico centrato
  var hs = bin(d.getHours(), 5);
  var ms = bin(d.getMinutes(), 6);
  var cx = g.getWidth() / 2;
  g.setFont("7x11Numeric7Seg").setFontAlign(-1, 0);
  var gap = 14;
  var x0 = cx - (g.stringWidth(hs) + gap + g.stringWidth(ms)) / 2;
  g.drawString(hs, x0, 133);
  g.drawString(ms, x0 + g.stringWidth(hs) + gap, 133);
  // riga finale: giorno a sinistra, ora al centro, data a destra
  g.setFont("7x11Numeric7Seg", 2).setFontAlign(0, 0);
  g.drawString(
    ("0" + d.getHours()).substr(-2) + ":" + ("0" + d.getMinutes()).substr(-2),
    cx, 156
  );
  g.setFont("6x8");
  var dow = locale.dow(d, 1).toUpperCase().replace(".", "");
  var mon = locale.month(d, 1).toUpperCase().replace(".", "");
  g.setFontAlign(-1, 0).drawString(dow, 12, 158);
  g.setFontAlign(1, 0).drawString(d.getDate() + " " + mon, 164, 158);
  queueDraw();
}

// comportamento standard da quadrante (pulsante = menu, ecc.)
Bangle.setUI({
  mode: "clock",
  remove: function () {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});
g.setBgColor("#fff");
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
