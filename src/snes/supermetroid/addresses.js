import { wram } from "../datatypes";
import MemState from "../../util/memory/MemState";

export default {
    frameCounter: new MemState(wram.uint16Read(0x05b6), "frameCounter", "Frame Counter (without lag frames)"),
    nmiCounter: new MemState(wram.uint16Read(0x05b8), "nmiCounter", "NMI Frame Counter (with lag frames)"),
    roomID: new MemState(wram.uint16Read(0x079b), "roomID", "Room ID"),
    gameState: new MemState(wram.uint16Read(0x0998), "gameState", "Game State"),
    samusHP: new MemState(wram.uint16Read(0x09c2), "samusHP", "Samus HP"),
    samusMaxHP: new MemState(wram.uint16Read(0x09c4), "samusMaxHP", "Samus Max HP"),
    phantoonEyeTimer: new MemState(wram.uint16Read(0x0fe8), "phantoonEyeTimer", "Phantoon Eye Timer"),
    ceresTimer: new MemState(wram.bcdRead(0x0945, 2, true), "ceresTimer", "Ceres Timer"),
    ceresState: new MemState(wram.uint16Read(0x093f), "ceresState", "Ceres State"),
    eventStates: new MemState(wram.uint32Read(0xd820), "eventStates", "Event States"),
    bossStates: new MemState(wram.uint64Read(0xd828), "bossStates", "Boss States"),
    samusMissiles: new MemState(wram.uint16Read(0x09c6), "samusMissiles", "Samus Missiles"),
    samusMaxMissiles: new MemState(wram.uint16Read(0x09c8), "samusMaxMissiles", "Samus Max Missiles"),
    samusSupers: new MemState(wram.uint16Read(0x09ca), "samusSupers", "Samus Super Missiles"),
    samusMaxSupers: new MemState(wram.uint16Read(0x09cc), "samusMaxSupers", "Samus Max Super Missiles"),
    samusPBs: new MemState(wram.uint16Read(0x09ce), "samusPBs", "Samus Power Bombs"),
    samusMaxPBs: new MemState(wram.uint16Read(0x09d0), "samusMaxPBs", "Samus Max Power Bombs"),
    samusReserveHP: new MemState(wram.uint16Read(0x09d6), "samusReserveHP", "Samus Reserve HP"),
    samusMaxReserveHP: new MemState(wram.uint16Read(0x09d4), "samusMaxReserveHP", "Samus Max Reserve HP"),
    samusWaterPhysics: new MemState(wram.uint16Read(0x0ad2), "samusWaterPhysics", "Samus water physics state"),
    samusX: new MemState(wram.uint16Read(0x0af6), "samusX", "Samus X Position"),
    samusY: new MemState(wram.uint16Read(0x0afa), "samusY", "Samus y Position"),
    samusSubX: new MemState(wram.uint16Read(0x0af8), "samusSubX", "Samus X Sub-pixel Position"),
    samusSubY: new MemState(wram.uint16Read(0x0afc), "samusSubY", "Samus Y Sub-pixel Position"),
    samusXRadius: new MemState(wram.uint16Read(0x0afe), "samusXRadius", "Samus X Radius"),
    samusYRadius: new MemState(wram.uint16Read(0x0b00), "samusYRadius", "Samus Y Radius"),
    samusXSpeed: new MemState(wram.int16Read(0x0b42), "samusXSpeed", "Samus X Sub-Speed"),
    samusXSubSpeed: new MemState(wram.uint16Read(0x0b44), "samusXSubSpeed", "Samus X Sub-Speed"),
    samusXSubMomentum: new MemState(wram.uint16Read(0x0b48), "samusXSubMomentum", "Samus X Sub-Momentum"),
    samusYSpeed: new MemState(wram.int16Read(0x0b2e), "samusYSpeed", "Samus Y Sub-Speed"),
    samusYSubSpeed: new MemState(wram.uint16Read(0x0b2c), "samusYSubSpeed", "Samus Y Sub-Speed"),
    samusYDirection: new MemState(wram.uint16Read(0x0b36), "samusYDirection", "Samus Y Direction"),
    samusPose: new MemState(wram.uint16Read(0x0a1c), "samusPose", "Samus Pose"),
    collectedItemBits: new MemState(wram.dataRead(0xd870, 19), "collectedItemBits", '"Collected Items" Bit Array'),
    collectedEquipment: new MemState(wram.uint16Read(0x09a2), "collectedEquipment", "Collected equipment flags"),
    equippedEquipment: new MemState(wram.uint16Read(0x09a4), "equippedEquipment", "Equipped equipment flags"),
    scroll1: new MemState(wram.uint16Read(0xcd20), "scroll1", "Scroll read #1"),
    scroll2: new MemState(wram.uint16Read(0xcd22), "scroll2", "Scroll read #2"),
    gameTimeFrames: new MemState(wram.uint16Read(0x09da), "gameTimeFrames", "Game Time, Frames"),
    gameTimeSeconds: new MemState(wram.uint16Read(0x09dc), "gameTimeSeconds", "Game Time, Seconds"),
    gameTimeMinutes: new MemState(wram.uint16Read(0x09de), "gameTimeMinutes", "Game Time, Minutes"),
    gameTimeHours: new MemState(wram.uint16Read(0x09e0), "gameTimeHours", "Game Time, Hours"),
    frameCounter: new MemState(wram.uint16Read(0x05b6), "frameCounter", "Frame Counter (no lag frames)"),
    nmiCounter: new MemState(wram.uint16Read(0x05b8), "nmiCounter", "NMI Frame Counter (with lag frames)"),
    enemy0HP: new MemState(wram.uint16Read(0x0f8c), "enemy0HP", "Enemy 0 HP"),
    enemy0IFrames: new MemState(
        wram.uint16Read(0x0fa0),
        "enemy0IFrames",
        "Enemy 0 I-Frames"
    ),
    enemy0AIVariable1: new MemState(wram.uint16Read(0x0fa8), "enemy0AIVariable1", "Enemy 0 AI Variable #1"),
    enemy1HP: new MemState(wram.uint16Read(0x0f8c - 0x0f78 + 0x0fb8), "enemy1HP", "Enemy 1 HP"),
    enemyProjectileDamage: new MemState(
        wram.uint16Read(0x187a),
        "enemyProjectileDamage",
        "Enemy damage when projectile collides"
    ),
    mb2BabyIndex: new MemState(wram.uint16Read(0x7854), "mb2BabyIndex", "MB2 Baby Enemy Index"),

    // Practice Rom addresses
    prRealtimeRoom: new MemState(wram.uint16Read(0xfd06), "prRealtimeRoom", "[Practice Rom] Realtime Room"),
    prLastRealtimeRoom: new MemState(
        wram.uint16Read(0xfd08),
        "prLastRealtimeRoom",
        "[Practice Rom] Last Realtime Room"
    ),
    prTransitionCounter: new MemState(
        wram.uint16Read(0xfd10),
        "prTransitionCounter",
        "[Practice Rom] Transition Counter"
    ),
};
