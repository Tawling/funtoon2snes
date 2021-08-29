import CeresGameModule from "./modules/CeresGame";
import PhantoonGameModule from "./modules/PhantoonGame";
import MoondanceEmoteOnlyModule from "./modules/MoondanceEmoteOnly";
import MoatDiveModule from "./modules/MoatDive";
import OceanDiveModule from "./modules/OceanDive";
import TacoTankTracker from "./modules/TacoTankTracker";
import ResetEventModule from "./modules/ResetEvent";
import DeathEventModule from "./modules/DeathEvent";

export const SuperMetroid = [
    ResetEventModule,
    DeathEventModule,
    PhantoonGameModule,
    CeresGameModule,
    MoondanceEmoteOnlyModule,
    MoatDiveModule,
    OceanDiveModule,
    TacoTankTracker,
];
