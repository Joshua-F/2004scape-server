import { CommandHandlers } from '#lostcity/engine/script/ScriptRunner.js';
import ScriptOpcode from '#lostcity/engine/script/ScriptOpcode.js';
import ParamType from '#lostcity/cache/ParamType.js';
import LocType from '#lostcity/cache/LocType.js';
import { ParamHelper } from '#lostcity/cache/ParamHelper.js';
import World from '#lostcity/engine/World.js';
import Loc from '#lostcity/entity/Loc.js';

const LocOps: CommandHandlers = {
    [ScriptOpcode.LOC_ADD]: (state) => {
        const [coord, type, angle, shape, duration] = state.popInts(5);
        const loc = new Loc();
        loc.type = type;
        loc.rotation = angle & 0x3;
        loc.shape = shape;
        loc.level = (coord >> 28) & 0x3fff;
        loc.x = (coord >> 14) & 0x3fff;
        loc.z = coord & 0x3fff;
        World.addLoc(loc, duration);
    },

    [ScriptOpcode.LOC_ANGLE]: (state) => {
        state.pushInt(state.activeLoc.rotation);
    },

    [ScriptOpcode.LOC_ANIM]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.LOC_CATEGORY]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.LOC_CHANGE]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.LOC_COORD]: (state) => {
        const packed = state.activeLoc.z | (state.activeLoc.x << 14) | (state.activeLoc.level << 28);
        state.pushInt(packed);
    },

    [ScriptOpcode.LOC_DEL]: (state) => {
        const duration = state.popInt();
        World.removeLoc(state.activeLoc, duration);
    },

    [ScriptOpcode.LOC_FINDALLZONE]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.LOC_FINDNEXT]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.LOC_PARAM]: (state) => {
        const paramId = state.popInt();
        const param = ParamType.get(paramId);
        const loc = LocType.get(state.activeLoc.type);
        if (param.isString()) {
            state.pushString(ParamHelper.getStringParam(paramId, loc, param.defaultString));
        } else {
            state.pushInt(ParamHelper.getIntParam(paramId, loc, param.defaultInt));
        }
    },

    [ScriptOpcode.LOC_TYPE]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.LOC_NAME]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.LOC_SHAPE]: (state) => {
        state.pushInt(state.activeLoc.shape);
    },
};

export default LocOps;
