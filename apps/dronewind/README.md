# Drone Wind

Wind conditions for drone pilots, on your wrist.

Weather apps tell you the wind on the ground — but your drone flies at up to 120m,
where wind is typically 1.5-2x stronger. Drone Wind shows both, so you know what
your aircraft will actually face before you take off.

## What it shows

- **GROUND** — wind speed at 10m (m/s)
- **120m** — wind speed at 120m altitude, the EU legal ceiling for drones (m/s)
- **GUSTS** — wind gusts at ground level (m/s)
- Wind direction (arrow + compass point + degrees) and temperature
- Time of the last update in the top right corner

Data comes from [Open-Meteo](https://open-meteo.com/) (free, no API key) for your
current GPS position.

## Requirements

- **Gadgetbridge** on your phone with the
  [Android Integration](https://banglejs.com/apps/?id=android) app installed on the
  Bangle, and **"Allow Internet Access"** enabled in Gadgetbridge's Bangle.js settings
  (the HTTP request is made through your phone).
- A GPS fix: instant if you enable **"Overwrite GPS"** in the Android Integration
  app settings on the watch (the phone position is then used), otherwise the watch
  GPS is used (first fix outdoors can take 30-60s).

## Controls

- **Tap** the screen: refresh
- **Button**: exit

## Notes

Wind values are model forecasts, not live measurements — always cross-check with
what you see and feel on site. This app gives you a much better picture than
ground-only weather apps, but the final go/no-go decision is yours.
