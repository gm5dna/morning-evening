# Morning and Evening

Daily devotional readings from C.H. Spurgeon's *Morning and Evening* (1866) — a classic collection of 732 devotional readings, one for each morning and evening of the year.

## Install

```bash
npm install -g morning-evening
```

Or install directly from GitHub:

```bash
npm install -g gm5dna/morning-evening
```

## Usage

```
morning-evening                     Show today's reading (morning or evening)
morning-evening morning             Today's morning reading
morning-evening evening             Today's evening reading
morning-evening jan 1               Reading for 1 January
morning-evening jan 1 morning       Morning reading for 1 January
morning-evening 15 mar evening      Evening reading for 15 March
morning-evening tomorrow            Reading for tomorrow
morning-evening yesterday           Reading for yesterday
```

### Options

```
--help, -h                          Show help
--version, -v                       Show version
--random, -r                        Show a random reading
--list, -l                          List all readings
--search, -s <term>                 Search readings by keyword or reference
```

### Examples

```bash
# Today's reading (morning before 2pm, evening after)
morning-evening

# Search for readings about prayer
morning-evening --search prayer

# A random reading
morning-evening --random
```

## About

The morning/evening period is detected automatically based on the time of day (before 14:00 = morning, 14:00 onwards = evening). Output is formatted with ANSI colours when writing to a terminal, and plain text when piped.

All 732 readings are bundled — no network connection required.

## Licence

MIT. The text of *Morning and Evening* is in the public domain (1866).
