import { wram } from "../datatypes";
import MemState from "../../util/memory/MemState";

const addresses = {
    "roomID": new MemState(wram.uint16Read(0x0000a0), "roomID", "Room ID for underworld"),
    "overworldScreenID": new MemState(wram.uint8Read(0x00008a), "overworldScreenID", "Overworld screen ID"),
    "quadH": new MemState(wram.uint8Read(0x0000a9), "quadH", "Horizontal West or East room quadrant"),
    "quadV": new MemState(wram.uint8Read(0x0000aa), "quadV", "Vertical North or South room quadrant"),
    "indoorState": new MemState(wram.uint8Read(0x00001b), "indoorState", "Indoor state (0 = not indoors, 1 = indoors)"),
    "level": new MemState(wram.uint8Read(0x0000ee), "level","Which layer Link is on (0 = Upper Layer, 1 = Lower Layer"),
    "frame": new MemState(wram.uint8Read(0x00001a), "frame", "This counter is incremented every time the main loop runs.  In other words: every frame that the game is not lagging.")
};

export default addresses;