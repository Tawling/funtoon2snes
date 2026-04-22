import { wram } from "../datatypes";
import MemState from "../../util/memory/MemState";

const addresses = {
    "someName": new MemState(wram.uint16Read(0x0000), "someName", "Description of someName"),
};

export default addresses;