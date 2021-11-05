import { sram } from "../datatypes";
import MemState from "../../util/memory/MemState";

export default {
    smz3CurrentGame: new MemState(sram.uint16Read(0xa173fe), "smz3CurrentGame", "SMZ3: Current Game"),
};
