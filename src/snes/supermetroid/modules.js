import CeresGameModule from "./modules/CeresGame";
import PhantoonGameModule from "./modules/PhantoonGame";
import MoondanceEmoteOnlyModule from "./modules/MoondanceEmoteOnly";
import MoatDiveModule from "./modules/MoatDive";
import OceanDiveModule from "./modules/OceanDive";
import TacoTankTracker from "./modules/TacoTankTracker";
import ResetEventModule from "./modules/ResetEvent";
import DeathEventModule from "./modules/DeathEvent";
import NiceModule from "./modules/Nice";
import KQKMiss from "./modules/KQKMiss";
import DLCSpoSpo from "./modules/DLCSpoSpo";
import RoomTimes from "./modules/RoomTimes";
import IGTReport from "./modules/IGTReport";
import RidleyOverkillTracker from "./modules/RidleyOverkillTracker";
import RidleyGameModule from "./modules/RidleyGame";
import ZebesGameModule from "./modules/ZebesGame";

export const SuperMetroid = [
    ResetEventModule,
    DeathEventModule,
    RoomTimes,
    PhantoonGameModule,
    CeresGameModule,
    RidleyGameModule,
    ZebesGameModule,
    IGTReport,
    MoondanceEmoteOnlyModule,
    MoatDiveModule,
    OceanDiveModule,
    KQKMiss,
    DLCSpoSpo,
    RidleyOverkillTracker,
    TacoTankTracker,
    NiceModule,
];
