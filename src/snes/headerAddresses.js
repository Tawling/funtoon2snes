import { rom } from "./datatypes";
import MemState from "../util/memory/MemState";

export default {
    headerMakerCode: new MemState(rom.uint16Read(0xffb0), "headerMakerCode", "ROM Header: Maker Code"),
    headerGameCode: new MemState(rom.uint32Read(0xffb2), "headerGameCode", "ROM Header: Game Code"),
    headerExpansionRAMSize: new MemState(
        rom.uint8Read(0xffbd),
        "headerExpansionRAMSize",
        "ROM Header: Expansion RAM Size"
    ),
    headerSpecialVersion: new MemState(rom.uint8Read(0xffbe), "headerSpecialVersion", "ROM Header: Special Version"),
    headerCartridgeTypeSubNumber: new MemState(
        rom.uint8Read(0xffbf),
        "headerCartridgeTypeSubNumber",
        "ROM Header: Cartridge Type (Sub-number)"
    ),
    headerGameTitle: new MemState(rom.jisx0201Read(0xffc0, 21), "headerGameTitle", "ROM Header: Game Title"),
    headerMapMode: new MemState(rom.uint8Read(0xffd5), "headerMapMode", "ROM Header: Map Mode"),
    headerCartridgeType: new MemState(rom.uint8Read(0xffd6), "headerCartridgeType", "ROM Header: Cartridge Type"),
    headerROMSize: new MemState(rom.uint8Read(0xffd7), "headerROMSize", "ROM Header: ROM Size"),
    headerRAMSize: new MemState(rom.uint8Read(0xffd8), "headerRAMSize", "ROM Header: RAM Size"),
    headerDestinationCode: new MemState(rom.uint8Read(0xffd9), "headerDestinationCode", "ROM Header: Destination Code"),
    headerMaskROMVersion: new MemState(rom.uint8Read(0xffdb), "headerMaskROMVersion", "ROM Header: Mask ROM Version"),
    headerComplementCheck: new MemState(
        rom.uint16Read(0xffdc),
        "headerComplementCheck",
        "ROM Header: Checksum Complement"
    ),
    headerChecksum: new MemState(rom.uint16Read(0xffde), "headerChecksum", "ROM Header: Checksum"),
};
