import { wram } from "../datatypes";
import MemState from "../../util/memory/MemState";

const addresses = {
    "roomID": new MemState(wram.uint16Read(0x0000a0), "roomID", "Room ID for underworld"),
    "overworldScreenID": new MemState(wram.uint8Read(0x00008a), "overworldScreenID", "Overworld screen ID"),
    "quadH": new MemState(wram.uint8Read(0x0000a9), "quadH", "Horizontal West or East room quadrant"),
    "quadV": new MemState(wram.uint8Read(0x0000aa), "quadV", "Vertical North or South room quadrant"),
    "indoorState": new MemState(wram.uint8Read(0x00001b), "indoorState", "Indoor state (0 = not indoors, 1 = indoors)"),
    "level": new MemState(wram.uint8Read(0x0000ee), "level","Which layer Link is on (0 = Upper Layer, 1 = Lower Layer"),
    "frameCounter": new MemState(wram.uint8Read(0x00001a), "frameCounter", "This counter is incremented every time the main loop runs.  In other words: every frame that the game is not lagging."),
    "overworldEntranceID": new MemState(wram.uint8Read(0x00010e), "overworldEntranceID", "Entrance ID into underworld."),
    "scrollCounter": new MemState(wram.uint8Read(0x000126), "scrollCounter", "Used as a counter for scrolling screens"),
    "linkX": new MemState(wram.uint8Read(0x000022), "linkX", "Link's X coordinates"),
    "linkY": new MemState(wram.uint8Read(0x000020), "linkY", "Link's Y coordinates"),
    "stairCounter": new MemState(wram.uint8Read(0x000464), "stairCounter", "Countdown timer used when climbing stairs."),
    "gameMode": new MemState(wram.uint8Read(0x000010), "gameMode", "Game Mode"),
    "overworldWalkoutCounter": new MemState(wram.uint8Read(0x00069a), "overworldWalkoutCounter", "Countdown timer for walking out when exiting to overworld."),
    "fadeCounter": new MemState(wram.uint16Read(0x00c007), "fadeCounter", "Timer for transition fading and mosaics"),
};

export default addresses;