import { rom } from "./datatypes";
import MemState from "../util/memory/MemState";

export default {
    headerMakerCode: new MemState(rom.uint16Read(0x7Fb0), "headerMakerCode", "ROM Header: Maker Code"),
    headerGameCode: new MemState(rom.uint32Read(0x7Fb2), "headerGameCode", "ROM Header: Game Code"),
    headerExpansionRAMSize: new MemState(
        rom.uint8Read(0x7Fbd),
        "headerExpansionRAMSize",
        "ROM Header: Expansion RAM Size"
    ),
    headerSpecialVersion: new MemState(rom.uint8Read(0x7Fbe), "headerSpecialVersion", "ROM Header: Special Version"),
    headerCartridgeTypeSubNumber: new MemState(
        rom.uint8Read(0x7Fbf),
        "headerCartridgeTypeSubNumber",
        "ROM Header: Cartridge Type (Sub-number)"
    ),
    headerGameTitle: new MemState(rom.jisx0201Read(0x7Fc0, 21), "headerGameTitle", "ROM Header: Game Title"),
    headerMapMode: new MemState(rom.uint8Read(0x7Fd5), "headerMapMode", "ROM Header: Map Mode"),
    headerCartridgeType: new MemState(rom.uint8Read(0x7Fd6), "headerCartridgeType", "ROM Header: Cartridge Type"),
    headerROMSize: new MemState(rom.uint8Read(0x7Fd7), "headerROMSize", "ROM Header: ROM Size"),
    headerRAMSize: new MemState(rom.uint8Read(0x7Fd8), "headerRAMSize", "ROM Header: RAM Size"),
    headerDestinationCode: new MemState(rom.uint8Read(0x7Fd9), "headerDestinationCode", "ROM Header: Destination Code"),
    headerMaskROMVersion: new MemState(rom.uint8Read(0x7Fdb), "headerMaskROMVersion", "ROM Header: Mask ROM Version"),
    headerComplementCheck: new MemState(
        rom.uint16Read(0x7Fdc),
        "headerComplementCheck",
        "ROM Header: Checksum Complement"
    ),
    headerChecksum: new MemState(rom.uint16Read(0x7Fde), "headerChecksum", "ROM Header: Checksum"),
};
