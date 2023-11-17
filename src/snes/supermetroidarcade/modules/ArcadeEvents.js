import MemoryModule from "../../../util/memory/MemoryModule";
import { Rooms, GameStates, CeresEscapeStateFlags } from "../../supermetroid/enums";
import Addresses from "../../supermetroid/addresses";
import ArcadeAddresses from "../addresses";

export default class ArcadeEventsModule extends MemoryModule {
    constructor() {
        super("arcade", "Arcade Hooks");
        this.tooltip = "Various hooks for Super Metroid Arcade. Handle the events via FUNtoon Script.";
        this.currentRoomCount = -1;
        this.currentScore = -1;
        this.currentSecondsRemaining = -1;
        this.activeAchievement = undefined;
    }

    settingDefs = {
        sendRoomCountEvent: {
            display: "Send an event when your room count increases",
            type: "bool",
            default: false,
        },
        sendScoreEvent: {
            display: "Send an event when your score changes",
            type: "bool",
            attributes: { disabled: true },
            default: false,
        },
        sendTimerEvent: {
            display: "Send an event when your time remaining changes",
            type: "bool",
            attributes: { disabled: true },
            default: false,
        },
        sendAchievementEvent: {
            display: "Send an event when you get achievement points",
            type: "bool",
            default: false,
        },
    };

    setEnabled(enabled) {
        super.setEnabled(enabled);
    }

    shouldRunForGame(gameTags) {
        return gameTags.SM && gameTags.ARCADE;
    }

    getMemoryReads() {
        return [
            ArcadeAddresses.arcadeRoomCount,
            ArcadeAddresses.arcadeScore,
            ArcadeAddresses.arcadeTimer,
            ArcadeAddresses.arcadeAchievementText
        ];
    }
    
    // There's many other things we could add to this, like point tiles and icons (like plasma, space, grav, etc)
    achievementValueToCharacter = {
        15: ' ',
        224: 'A',
        225: 'B',
        226: 'C',
        227: 'D',
        228: 'E',
        229: 'F',
        230: 'G',
        231: 'H',
        232: 'I',
        233: 'J',
        234: 'K',
        235: 'L',
        236: 'M',
        237: 'N',
        238: 'O',
        239: 'P',
        240: 'Q',
        241: 'R',
        242: 'S',
        243: 'T',
        244: 'U',
        245: 'V',
        246: 'W',
        247: 'X',
        248: 'Y',
        249: 'Z',
        255: '!'
    };
    
    parseAchievement(memory) {        
        let out = "";
        let len = memory.arcadeAchievementText.value.length;
        
        // We only want to check every other character, since a character is immediately followed by a byte for its color
        // We start at the back since all text is right aligned
        // If the last character is not one of the ones we care about, we don't bother parsing. We may want to change this in the future.
        if (memory.arcadeAchievementText.value[len - 2] in this.achievementValueToCharacter)
        {
            for (let textIdx = len - 2; textIdx >= 0; textIdx -= 2) {
                let val = memory.arcadeAchievementText.value[textIdx];
                if (val in this.achievementValueToCharacter) {
                    out = this.achievementValueToCharacter[val] + out;
                }
                else {
                    // can't think of when this would hit, since I think all achievements use A-Z, space, or !
                    break;
                }
            }
        }
        
        if (out.length > 0) {
            return out.trim();
        }
        return;
    }
    
    // Wrappers to send events that check against the settings first
    // Delay of 3s added to everything except a new run. TODO: expose this in settings?
    sendRoomCountEvent(sendEvent, roomCount) {
        if (this.settings.sendRoomCountEvent.value) {
            sendEvent("eventRoomCount", roomCount, 3);
        }
    }
    
    sendScoreEvent(sendEvent, currentScore) {
        if (this.settings.sendScoreEvent.value) {
            sendEvent("eventScore", currentScore, 3);
        }
    }
    
    sendTimerEvent(sendEvent, currentTimer) {
        if (this.settings.sendTimerEvent.value) {
            sendEvent("eventTimer", currentTimer, 3);
        }
    }
    
    sendAchievementEvent(sendEvent, achievementText) {
        if (this.settings.sendAchievementEvent.value) {
            sendEvent("eventAchievement", achievementText, 3);
        }
    }

    memoryReadAvailable({ memory, sendEvent, globalState, setReloadUnsafe }) {
        // The score is actually stored as two integers displayed side by side
        // So if the score is displayed as 00046300, this is 0004 and 6300
        // So we read the full 32 bits and the first 16 bits are the lower number (6300) and the
        // second 16 bits are the higher number (0004). To get an actual value, we must multiply the
        // higher value by 10000 and add the lower value
        let convertedScore = (memory.arcadeScore.value & 0xFFFF) + (10000 * (memory.arcadeScore.value >> 16));
        
        // The timer is stored as seconds followed by minutes
        let convertedSecondsRemaining = (memory.arcadeTimer.value & 0xFF) + (60 * (memory.arcadeTimer.value >> 8));
        
        // Just initialize these to something if they have no current value
        if (this.currentRoomCount < 0) this.currentRoomCount = memory.arcadeRoomCount.value;
        if (this.currentScore < 0) this.currentScore = convertedScore;
        if (this.currentSecondsRemaining < 0) this.currentSecondsRemaining = convertedSecondsRemaining;
        
        // Some logic and parsing
        let newRoomReached = memory.arcadeRoomCount.value != this.currentRoomCount;
        let newScoreValue = convertedScore != this.currentScore;
        let newTimerValue = convertedSecondsRemaining != this.currentSecondsRemaining;
        let achievementText = this.parseAchievement(memory);
        let newAchievement = !this.activeAchievement && achievementText;
        
        // Check if we want to send any events
        if (newRoomReached) {
            if (memory.arcadeRoomCount.value > 0) {
                this.sendRoomCountEvent(sendEvent, memory.arcadeRoomCount.value);
            }
        }
        
        if (newScoreValue) {
            this.sendScoreEvent(sendEvent, convertedScore);
        }
        
        if (newTimerValue) {
            this.sendTimerEvent(sendEvent, convertedSecondsRemaining);
        }
        
        if (newAchievement) {
            this.sendAchievementEvent(sendEvent, achievementText);
        }
        
        // Cache off current values
        this.currentRoomCount = memory.arcadeRoomCount.value;
        this.currentScore = convertedScore;
        this.currentSecondsRemaining = convertedSecondsRemaining;
        this.activeAchievement = achievementText;
    }
}
