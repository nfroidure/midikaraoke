# MIDI Karaoke Player

Building the project:

```sh
npm run build
```

Starting the server:

```sh
npm run start
```

# Note on Debian/GNULinux and the WebMIDIAPI

Install a synth:
```sh
apt get install timidity
```

Install a synth:
```sh
apt-get install timidity
```

Start a timidity server and connect it to the virtual MIDI output:
```sh
$ timidity -iA -B2,8 -Os -EFreverb=0&
[1] 21177
ALSA pcm 'default' set buffer size 2048, period size 680 bytes
TiMidity starting in ALSA server mode
Opening sequencer port: 128:0 128:1 128:2 128:3
Requested buffer size 2048, fragment size 1024
ALSA pcm 'default' set buffer size 2048, period size 680 bytes

$ aconnect -lo
client 14: 'Midi Through' [type=noyau]
    0 'Midi Through Port-0'
client 20: 'Virtual Raw MIDI 1-0' [type=noyau]
    0 'VirMIDI 1-0     '
client 21: 'Virtual Raw MIDI 1-1' [type=noyau]
    0 'VirMIDI 1-1     '
client 22: 'Virtual Raw MIDI 1-2' [type=noyau]
    0 'VirMIDI 1-2     '
client 23: 'Virtual Raw MIDI 1-3' [type=noyau]
    0 'VirMIDI 1-3     '
client 128: 'TiMidity' [type=utilisateur]
    0 'TiMidity port 0 '
    1 'TiMidity port 1 '
    2 'TiMidity port 2 '
    3 'TiMidity port 3 '
    
$ aconnect 20:0 128:0

```

More infos here: http://jazz-soft.net/download/Jazz-Plugin/LinuxSynth.html

