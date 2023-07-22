import { CommandHandlers } from '#lostcity/engine/script/ScriptRunner.js';
import ScriptOpcode from '#lostcity/engine/script/ScriptOpcode.js';

const DebugOps: CommandHandlers = {
    [ScriptOpcode.ERROR]: (state) => {
        throw new Error(state.popString());
    },

    [ScriptOpcode.ACTIVE_NPC]: (state) => {
        const activeNpc = state.activeNpc;
        state.pushInt(activeNpc !== null ? 1 : 0);
    },

    [ScriptOpcode.ACTIVE_PLAYER]: (state) => {
        const activePlayer = state.activePlayer;
        state.pushInt(activePlayer !== null ? 1 : 0);
    },

    [ScriptOpcode.ACTIVE_LOC]: (state) => {
        const activeLoc = state.activeLoc;
        state.pushInt(activeLoc !== null ? 1 : 0);
    },

    [ScriptOpcode.ACTIVE_OBJ]: (state) => {
        const activeObj = state.activeObj;
        state.pushInt(activeObj !== null ? 1 : 0);
    },
};

export default DebugOps;
