import { wram } from "../datatypes";
import MemState from "../../util/memory/MemState";

const addresses = {
    "gameMode":                new MemState( wram.uint8Read(0x000010), "gameMode", "Game Mode"),
    "subGameMode":             new MemState( wram.uint8Read(0x000011), "subGameMode", "Sub Game Mode"),
    "lag":                     new MemState( wram.uint8Read(0x000012), "lag", "Will be 1 if the main game loop didn't finish, meaning we lagged that frame"),
    "frameCounter":            new MemState( wram.uint8Read(0x00001a), "frameCounter", "This counter is incremented every time the main loop runs.  In other words: every frame that the game is not lagging."),
    "indoorState":             new MemState( wram.uint8Read(0x00001b), "indoorState", "Indoor state (0 = not indoors, 1 = indoors)"),
    "linkY":                   new MemState( wram.uint8Read(0x000020), "linkY", "Link's Y coordinates"),
    "linkX":                   new MemState( wram.uint8Read(0x000022), "linkX", "Link's X coordinates"),
    "overworldScreenID":       new MemState(wram.uint16Read(0x00008a), "overworldScreenID", "Overworld screen ID"),
    "roomID":                  new MemState(wram.uint16Read(0x0000a0), "roomID", "Room ID for underworld"),
    "roomProp":                new MemState( wram.uint8Read(0x0000a8), "roomProp", "Room layout, quadV and quadH: ...lllvh"),
    "quadH":                   new MemState( wram.uint8Read(0x0000a9), "quadH", "Horizontal West or East room quadrant"),
    "quadV":                   new MemState( wram.uint8Read(0x0000aa), "quadV", "Vertical North or South room quadrant"),
    "level":                   new MemState( wram.uint8Read(0x0000ee), "level","Which layer Link is on (0 = Upper Layer, 1 = Lower Layer"),
    "overworldEntranceID":     new MemState( wram.uint8Read(0x00010e), "overworldEntranceID", "Entrance ID into underworld."),
    "scrollCounter":           new MemState( wram.uint8Read(0x000126), "scrollCounter", "Used as a counter for scrolling screens"),
    "stairCounter":            new MemState( wram.uint8Read(0x000464), "stairCounter", "Countdown timer used when climbing stairs."),
    "overworldWalkoutCounter": new MemState( wram.uint8Read(0x00069a), "overworldWalkoutCounter", "Countdown timer for walking out when exiting to overworld."),
    "fadeCounter":             new MemState(wram.uint16Read(0x00c007), "fadeCounter", "Timer for transition fading and mosaics"),
};

export default addresses;