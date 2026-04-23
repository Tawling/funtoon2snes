import { wram } from "../datatypes";
import MemState from "../../util/memory/MemState";

const addresses = {
    "roomID": new MemState(wram.uint16Read(0x0000a0), "roomID", "Room ID for underworld"),
    "overworldScreenID": new MemState(wram.uint16Read(0x00008a), "overworldScreenID", "Overworld screen ID"),
    "quadH": new MemState(wram.uint16Read(0x0000a9), "quadH", "Horizontal West or East room quadrant"),
    "quadV": new MemState(wram.uint16Read(0x0000aa), "quadV", "Vertical North or South room quadrant"),
};

export default addresses;