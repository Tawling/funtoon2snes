import { rom } from "./datatypes";
import MemState from "../util/memory/MemState";

const headerAddresses = {
    // LoROM Header
    loHeaderMakerCode: new MemState(rom.uint16Read(0x7fb0), "loHeaderMakerCode", "LoROM Header: Maker Code"),
    loHeaderGameCode: new MemState(rom.uint32Read(0x7fb2), "loHeaderGameCode", "LoROM Header: Game Code"),
    loHeaderExpansionRAMSize: new MemState(
        rom.uint8Read(0x7fbd),
        "loHeaderExpansionRAMSize",
        "LoROM Header: Expansion RAM Size"
    ),
    loHeaderSpecialVersion: new MemState(
        rom.uint8Read(0x7fbe),
        "loHeaderSpecialVersion",
        "LoROM Header: Special Version"
    ),
    loHeaderCartridgeTypeSubNumber: new MemState(
        rom.uint8Read(0x7fbf),
        "loHeaderCartridgeTypeSubNumber",
        "LoROM Header: Cartridge Type (Sub-number)"
    ),
    loHeaderGameTitle: new MemState(rom.jisx0201Read(0x7fc0, 21), "loHeaderGameTitle", "LoROM Header: Game Title"),
    loHeaderMapMode: new MemState(rom.uint8Read(0x7fd5), "loHeaderMapMode", "LoROM Header: Map Mode"),
    loHeaderCartridgeType: new MemState(rom.uint8Read(0x7fd6), "loHeaderCartridgeType", "LoROM Header: Cartridge Type"),
    loHeaderROMSize: new MemState(rom.uint8Read(0x7fd7), "loHeaderROMSize", "LoROM Header: LoROM Size"),
    loHeaderRAMSize: new MemState(rom.uint8Read(0x7fd8), "loHeaderRAMSize", "LoROM Header: RAM Size"),
    loHeaderDestinationCode: new MemState(
        rom.uint8Read(0x7fd9),
        "loHeaderDestinationCode",
        "LoROM Header: Destination Code"
    ),
    loHeaderMaskROMVersion: new MemState(
        rom.uint8Read(0x7fdb),
        "loHeaderMaskROMVersion",
        "LoROM Header: Mask ROM Version"
    ),
    loHeaderComplementCheck: new MemState(
        rom.uint16Read(0x7fdc),
        "loHeaderComplementCheck",
        "LoROM Header: Checksum Complement"
    ),
    loHeaderChecksum: new MemState(rom.uint16Read(0x7fde), "loHeaderChecksum", "LoROM Header: Checksum"),
    // HiROM Header
    hiHeaderMakerCode: new MemState(rom.uint16Read(0xffb0), "hiHeaderMakerCode", "HiROM Header: Maker Code"),
    hiHeaderGameCode: new MemState(rom.uint32Read(0xffb2), "hiHeaderGameCode", "HiROM Header: Game Code"),
    hiHeaderExpansionRAMSize: new MemState(
        rom.uint8Read(0xffbd),
        "hiHeaderExpansionRAMSize",
        "HiROM Header: Expansion RAM Size"
    ),
    hiHeaderSpecialVersion: new MemState(
        rom.uint8Read(0xffbe),
        "hiHeaderSpecialVersion",
        "HiROM Header: Special Version"
    ),
    hiHeaderCartridgeTypeSubNumber: new MemState(
        rom.uint8Read(0xffbf),
        "hiHeaderCartridgeTypeSubNumber",
        "HiROM Header: Cartridge Type (Sub-number)"
    ),
    hiHeaderGameTitle: new MemState(rom.jisx0201Read(0xffc0, 21), "hiHeaderGameTitle", "HiROM Header: Game Title"),
    hiHeaderMapMode: new MemState(rom.uint8Read(0xffd5), "hiHeaderMapMode", "HiROM Header: Map Mode"),
    hiHeaderCartridgeType: new MemState(rom.uint8Read(0xffd6), "hiHeaderCartridgeType", "HiROM Header: Cartridge Type"),
    hiHeaderROMSize: new MemState(rom.uint8Read(0xffd7), "hiHeaderROMSize", "HiROM Header: HiROM Size"),
    hiHeaderRAMSize: new MemState(rom.uint8Read(0xffd8), "hiHeaderRAMSize", "HiROM Header: RAM Size"),
    hiHeaderDestinationCode: new MemState(
        rom.uint8Read(0xffd9),
        "hiHeaderDestinationCode",
        "HiROM Header: Destination Code"
    ),
    hiHeaderMaskROMVersion: new MemState(
        rom.uint8Read(0xffdb),
        "hiHeaderMaskROMVersion",
        "HiROM Header: Mask ROM Version"
    ),
    hiHeaderComplementCheck: new MemState(
        rom.uint16Read(0xffdc),
        "hiHeaderComplementCheck",
        "HiROM Header: Checksum Complement"
    ),
    hiHeaderChecksum: new MemState(rom.uint16Read(0xffde), "hiHeaderChecksum", "HiROM Header: Checksum"),
};

export default headerAddresses;