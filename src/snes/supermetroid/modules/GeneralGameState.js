import MemoryModule from "../../../util/memory/MemoryModule";
import { EquipmentFlags, BossStates } from "../enums";
import Addresses from "../addresses";
import { readBigIntFlag } from "../../../util/utils";

export default class GeneralGameStateModule extends MemoryModule {
    constructor() {
        super("generalGameState", "Send Events for General Game State Changes");
        this.tooltip =
            "Sends an event to FUNtoon when some general game state values change";
        this.description = "Sends an event to FUNtoon when general game state values change, such as boss deaths, equipment changes, or item.\n***Enabling these events can cause a LOT of event traffic, so please only enable the ones you need!***"
    }

    settingDefs = {
        trackItemPickups: {
            display: 'Track Item Pickups',
            description: "Report an event every time the item collection bitfield changes. This tracks specific item locations rather than the item that was picked up.",
            type: "bool",
            default: false,
        },
        trackBossKills: {
            display: 'Track Boss Death States',
            description: "Report an event every time a boss killed state changes.",
            type: "bool",
            default: false,
        },
        trackEquipmentPickups: {
            display: 'Track Equipment Pickups',
            description: "Report an event every time collected equipment changes. This tracks which item was picked up, but not the specific location it was found at.",
            type: "bool",
            default: false,
        },
        trackEquips: {
            display: 'Track Current Equipment Changes',
            description: "Report an event every time current items are equipped/unequipped.",
            type: "bool",
            default: false,
        },
        trackMaxStats: {
            display: 'Track Max Stats',
            description: "Report an event every time Samus's pickup maximums change (max health, max reserves, max ammo).",
            type: "bool",
            default: false,
        },
        trackEventStates: {
            display: 'Track Global Event States',
            description: 'Report an event every time a global event state changes, such as the maridia tube being broken or not.',
            type: "bool",
            default: false,
        },
        trackTimerStatus: {
            display: 'Track Timer State',
            description: "Report an event every time the escape timer state changes for both Ceres and Zebes escape.\n*(Note: this does not send events based on the actual time changing, just timer state such as whether it's active or not.)*",
            type: "bool",
            default: false,
        },
        trackSamusStates: {
            display: 'Track Misc. Samus States',
            description: "Report an event every time some miscellaneous Samus states change, such as water physics type and X-speed divisor from Draygon goop or Baby Metroid.",
            type: "bool",
            default: false,
        }
    };

    shouldRunForGame(gameTags) {
        return gameTags.SM;
    }

    getMemoryReads() {
        return [
            Addresses.gameState,
            Addresses.roomID,
            Addresses.bossStates,
            Addresses.timerState,
            Addresses.collectedItemBits,
            Addresses.collectedEquipment,
            Addresses.equippedEquipment,
            Addresses.samusMaxHP,
            Addresses.samusMaxMissiles,
            Addresses.samusMaxPBs,
            Addresses.samusMaxReserveHP,
            Addresses.samusMaxSupers,
            Addresses.eventStates,
            Addresses.samusXSpeedDivisor,
            Addresses.samusWaterPhysics,
        ];
    }

    memoryReadAvailable({ memory, sendEvent, globalState }) {
        if (this.settings.trackItemPickups) {
            const itemData = {
                current: Array.from(memory.collectedItemBits.value),
                prev: Array.from(memory.collectedItemBits.prevReadValue),
            }
            itemData.changed = itemData.current.map((v, i) => v ^ itemData.prev[i])
            if (itemData.changed.find((v) => v > 0)) {
                // An item was picked up
                sendEvent("smItemBitsChanged", itemData);
            }
        }
        if (this.settings.trackBossKills && this.checkChange(memory.bossStates)) {
            const bossData = {
                current: {
                    phantoon: readBigIntFlag(memory.bossStates.value, BossStates.PHANTOON),
                    ridley: readBigIntFlag(memory.bossStates.value, BossStates.RIDLEY),
                    kraid: readBigIntFlag(memory.bossStates.value, BossStates.KRAID),
                    draygon: readBigIntFlag(memory.bossStates.value, BossStates.DRAYGON),
                    botwoon: readBigIntFlag(memory.bossStates.value, BossStates.BOTWOON),
                    bombTorizo: readBigIntFlag(memory.bossStates.value, BossStates.BOMB_TORIZO),
                    goldenTorizo: readBigIntFlag(memory.bossStates.value, BossStates.GOLDEN_TORIZO),
                    sporeSpawn: readBigIntFlag(memory.bossStates.value, BossStates.SPORE_SPAWN),
                    crocomire: readBigIntFlag(memory.bossStates.value, BossStates.CROCOMIRE),
                    motherBrain: readBigIntFlag(memory.bossStates.value, BossStates.MOTHER_BRAIN),
                },
                prev: {
                    phantoon: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.PHANTOON),
                    ridley: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.RIDLEY),
                    kraid: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.KRAID),
                    draygon: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.DRAYGON),
                    botwoon: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.BOTWOON),
                    bombTorizo: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.BOMB_TORIZO),
                    goldenTorizo: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.GOLDEN_TORIZO),
                    sporeSpawn: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.SPORE_SPAWN),
                    crocomire: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.CROCOMIRE),
                    motherBrain: readBigIntFlag(memory.bossStates.prevReadValue, BossStates.MOTHER_BRAIN),
                },
                changed: {},
            }
            for (let key of Object.keys(bossData.current)) {
                bossData.changed[key] = (bossData.current[key] !== bossData.prev[key])
            }

            sendEvent("smBossesChanged", bossData);
        }
        if (this.settings.trackTimerStatus && this.checkChange(memory.timerState)) {
            sendEvent("smTimerStatusChanged", {
                prev: memory.timerState.prevReadValue,
                current: memory.timerState.value,
            })
        }
        if (this.settings.trackMaxStats && this.checkChange(memory.samusMaxHP)) {
            sendEvent("smMaxHPChanged", {
                prev: memory.samusMaxHP.prevReadValue,
                current: memory.samusMaxHP.value,
            })
        }
        if (this.settings.trackMaxStats && this.checkChange(memory.samusMaxReserveHP)) {
            sendEvent("smMaxReserveHPChanged", {
                prev: memory.samusMaxReserveHP.prevReadValue,
                current: memory.samusMaxReserveHP.value,
            })
        }
        if (this.settings.trackMaxStats && this.checkChange(memory.samusMaxMissiles)) {
            sendEvent("smMaxMissilesChanged", {
                prev: memory.samusMaxMissiles.prevReadValue,
                current: memory.samusMaxMissiles.value,
            })
        }
        if (this.settings.trackMaxStats && this.checkChange(memory.samusMaxSupers)) {
            sendEvent("smMaxSupersChanged", {
                prev: memory.samusMaxSupers.prevReadValue,
                current: memory.samusMaxSupers.value,
            })
        }
        if (this.settings.trackMaxStats && this.checkChange(memory.samusMaxPBs)) {
            sendEvent("smMaxPBsChanged", {
                prev: memory.samusMaxPBs.prevReadValue,
                current: memory.samusMaxPBs.value,
            })
        }

        if (this.settings.trackEquipmentPickups && this.checkChange(memory.collectedEquipment)) {
            
            const equipmentData = {
                current: {
                    variaSuit: !!(memory.collectedEquipment.value & EquipmentFlags.VARIA_SUIT),
                    springBall: !!(memory.collectedEquipment.value & EquipmentFlags.SPRING_BALL),
                    morphBall: !!(memory.collectedEquipment.value & EquipmentFlags.MORPH_BALL),
                    screwAttack: !!(memory.collectedEquipment.value & EquipmentFlags.SCREW_ATTACK),
                    gravitySuit: !!(memory.collectedEquipment.value & EquipmentFlags.GRAVITY_SUIT),
                    hiJumpBoots: !!(memory.collectedEquipment.value & EquipmentFlags.HI_JUMP_BOOTS),
                    spaceJump: !!(memory.collectedEquipment.value & EquipmentFlags.SPACE_JUMP),
                    bombs: !!(memory.collectedEquipment.value & EquipmentFlags.BOMBS),
                    speedBooster: !!(memory.collectedEquipment.value & EquipmentFlags.SPEED_BOOSTER),
                    grapple: !!(memory.collectedEquipment.value & EquipmentFlags.GRAPPLE),
                    xray: !!(memory.collectedEquipment.value & EquipmentFlags.XRAY),
                },
                prev: {
                    variaSuit: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.VARIA_SUIT),
                    springBall: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.SPRING_BALL),
                    morphBall: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.MORPH_BALL),
                    screwAttack: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.SCREW_ATTACK),
                    gravitySuit: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.GRAVITY_SUIT),
                    hiJumpBoots: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.HI_JUMP_BOOTS),
                    spaceJump: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.SPACE_JUMP),
                    bombs: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.BOMBS),
                    speedBooster: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.SPEED_BOOSTER),
                    grapple: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.GRAPPLE),
                    xray: !!(memory.collectedEquipment.prevReadValue & EquipmentFlags.XRAY),
                },
                changed: {},
            }

            for (let key of Object.keys(equipmentData.current)) {
                equipmentData.changed[key] = (equipmentData.current[key] !== equipmentData.prev[key])
            }

            sendEvent("smEquipmentChanged", equipmentData);
        }

        if (this.settings.trackEquips && this.checkChange(memory.equippedEquipment)) {
            
            const equipsData = {
                current: {
                    variaSuit: !!(memory.equippedEquipment.value & EquipmentFlags.VARIA_SUIT),
                    springBall: !!(memory.equippedEquipment.value & EquipmentFlags.SPRING_BALL),
                    morphBall: !!(memory.equippedEquipment.value & EquipmentFlags.MORPH_BALL),
                    screwAttack: !!(memory.equippedEquipment.value & EquipmentFlags.SCREW_ATTACK),
                    gravitySuit: !!(memory.equippedEquipment.value & EquipmentFlags.GRAVITY_SUIT),
                    hiJumpBoots: !!(memory.equippedEquipment.value & EquipmentFlags.HI_JUMP_BOOTS),
                    spaceJump: !!(memory.equippedEquipment.value & EquipmentFlags.SPACE_JUMP),
                    bombs: !!(memory.equippedEquipment.value & EquipmentFlags.BOMBS),
                    speedBooster: !!(memory.equippedEquipment.value & EquipmentFlags.SPEED_BOOSTER),
                    grapple: !!(memory.equippedEquipment.value & EquipmentFlags.GRAPPLE),
                    xray: !!(memory.equippedEquipment.value & EquipmentFlags.XRAY),
                },
                prev: {
                    variaSuit: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.VARIA_SUIT),
                    springBall: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.SPRING_BALL),
                    morphBall: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.MORPH_BALL),
                    screwAttack: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.SCREW_ATTACK),
                    gravitySuit: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.GRAVITY_SUIT),
                    hiJumpBoots: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.HI_JUMP_BOOTS),
                    spaceJump: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.SPACE_JUMP),
                    bombs: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.BOMBS),
                    speedBooster: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.SPEED_BOOSTER),
                    grapple: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.GRAPPLE),
                    xray: !!(memory.equippedEquipment.prevReadValue & EquipmentFlags.XRAY),
                },
                changed: {},
            }

            for (let key of Object.keys(equipsData.current)) {
                equipsData.changed[key] = (equipsData.current[key] !== equipsData.prev[key])
            }

            sendEvent("smEquipsChanged", equipsData);
        }

        if (this.settings.trackEventStates && this.checkChange(memory.eventStates)) {
            sendEvent("smEventStatesChanged", {
                current: memory.eventStates.value,
                prev: memory.eventStates.prevReadValue,
                changed: memory.eventStates.value ^ memory.eventStates.prevReadValue,
            })
        }

        if (this.settings.trackSamusStates && [
            memory.samusXSpeedDivisor,
            memory.samusWaterPhysics,
        ].some((v) => this.checkChange(v), this)) {
            const samusStates = {
                current: {
                    samusXSpeedDivisor: memory.samusXSpeedDivisor.value,
                    samusWaterPhysics: memory.samusWaterPhysics.value,
                },
                prev: {
                    samusXSpeedDivisor: memory.samusXSpeedDivisor.prevReadValue,
                    samusWaterPhysics: memory.samusWaterPhysics.prevReadValue,
                },
                changed: {}
            }

            for (let key of Object.keys(samusStates.current)) {
                samusStates.changed[key] = (samusStates.current[key] !== samusStates.prev[key])
            }

            sendEvent("smSamusStatesChanged", samusStates);
        }
    }
}
