import CeresGameModule from './modules/CeresGame'
import PhantoonGameModule from './modules/PhantoonGame'
import MoondanceEmoteOnlyModule from './modules/MoondanceEmoteOnly'
import MoatDiveModule from './modules/MoatDive'
import OceanDiveModule from './modules/OceanDive'
import TacoTankTracker from './modules/TacoTankTracker'
import ResetEventModule from './modules/ResetEvent'

export const SuperMetroid = [
    new ResetEventModule(),
    new PhantoonGameModule(),
    new CeresGameModule(),
    new MoondanceEmoteOnlyModule(),
    new MoatDiveModule(),
    new OceanDiveModule(),
    new TacoTankTracker(),
];