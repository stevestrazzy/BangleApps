# Retro Binary Clock

A **pure binary** clock face styled like a classic retro LCD digital watch.

Unlike BCD binary clocks (which encode each decimal digit separately), this face
shows hours and minutes as true binary numbers: hours on 5 bits, minutes on 6 bits.
Filled dot = 1, outlined dot = 0.

## Reading the time

Add up the powers of two printed under the filled dots:

```
  o . o . o        hours:   8 + 2 = 10
 16 8 4 2 1
 . o o o . o       minutes: 16 + 8 + 4 + 1 = 29
 32 16 8 4 2 1
 01010  011101     the same, as binary digits
     10:29         ...and in decimal, 7-segment style
```

Day of the week and date are shown in the bottom corners (localised via the
`locale` module — install your language from the App Loader).

## Why it looks like this

The design is a homage to classic LCD digital watches: light background for
maximum readability on the Bangle.js 2 transflective screen, double frame,
7-segment digits. The small digital time and the printed powers of two are
there to help you learn to read binary time — after a while you will not
need them anymore.

## Battery

The face redraws only once per minute (aligned to the minute change), so the
impact on battery life is minimal.
