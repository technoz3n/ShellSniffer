# ShellSniffer

- hooks directly into the game's global catalog and player account data (gameGlobal) to map your inventory in real-time <3
- features an auditCategory() command to instantly crossreference owned items against unowned ones, filtering out premium-only or unobtainable items to generate a precise list for completionists and hoarders (such as myself)


# catalog reference list

list of internal category string keys extracted from `gameGlobal.catalog` for use with the inventory auditing

* `"Hats"`
* `"Stamps"`
* `"Soldier Primary Weapons"`
* `"Ranger Primary Weapons"`
* `"Scrambler Primary Weapons"`
* `"Eggsploder Primary Weapons"`
* `"Whipper Primary Weapons"`
* `"Crackshot Primary Weapons"`
* `"TriHard Primary Weapons"`
* `"Shared Secondary Weapons"`
* `"Grenades"`
* `"Melee"`

## these are the EXACT item names searching anything else wont bring up a result
