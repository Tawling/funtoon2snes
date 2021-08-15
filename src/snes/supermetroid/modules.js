import CeresGameModule from './modules/CeresGame'
import PhantoonGameModule from './modules/PhantoonGame'
import MoondanceEmoteOnlyModule from './modules/MoondanceEmoteOnly'
import MoatDiveModule from './modules/MoatDive'
import OceanDiveModule from './modules/OceanDive'
import TacoTankTracker from './modules/TacoTankTracker'

export const SuperMetroid = [
    new PhantoonGameModule(),
    new CeresGameModule(),
    new MoondanceEmoteOnlyModule(),
    new MoatDiveModule(),
    new OceanDiveModule(),
    new TacoTankTracker(),
];