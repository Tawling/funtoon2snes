import CeresGameModule from './modules/CeresGameModule'
import PhantoonGameModule from './modules/PhantoonGameModule'
import MoondanceEmoteOnlyModule from './modules/MoondanceEmoteOnlyModule'
import MoatDiveModule from './modules/MoatDiveModule'
import OceanDiveModule from './modules/OceanDiveModule'

export const SuperMetroid = [
    new PhantoonGameModule(),
    new CeresGameModule(),
    new MoondanceEmoteOnlyModule(),
    new MoatDiveModule(),
    new OceanDiveModule(),
];
