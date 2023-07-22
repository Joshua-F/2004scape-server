import { CommandHandlers } from '#lostcity/engine/script/ScriptRunner.js';
import ScriptOpcode from '#lostcity/engine/script/ScriptOpcode.js';
import ParamType from '#lostcity/cache/ParamType.js';
import NpcType from '#lostcity/cache/NpcType.js';
import { ParamHelper } from '#lostcity/cache/ParamHelper.js';
import ScriptProvider from '#lostcity/engine/script/ScriptProvider.js';
import { Position } from '#lostcity/entity/Position.js';
import ServerTriggerType from '#lostcity/engine/script/ServerTriggerType.js';
import World from '#lostcity/engine/World.js';

const NpcOps: CommandHandlers = {
    [ScriptOpcode.NPC_FINDUID]: (state) => {
        const npcUid = state.popInt();
        const slot = npcUid & 0xFFFF;
        const expectedType = npcUid >> 16 & 0xFFFF;
        const npc = World.getNpc(slot);

        if (npc !== null && npc.type === expectedType) {
            state.activeNpc = npc;
            state.pushInt(1);
        } else {
            state.activeNpc = null;
            state.pushInt(0);
        }
    },

    [ScriptOpcode.NPC_ADD]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_ANIM]: (state) => {
        const delay = state.popInt();
        const seq = state.popInt();

        state.activeNpc.playAnimation(seq, delay);
    },

    [ScriptOpcode.NPC_BASESTAT]: (state) => {
        const delay = state.popInt();
        const seq = state.popInt();

        state.activeNpc.playAnimation(seq, delay);
    },

    [ScriptOpcode.NPC_CATEGORY]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_COORD]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_DEL]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_DELAY]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_FACESQUARE]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_FINDEXACT]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_FINDHERO]: (state) => {
        state.pushInt(state.activeNpc.hero);
    },

    [ScriptOpcode.NPC_PARAM]: (state) => {
        const paramId = state.popInt();
        const param = ParamType.get(paramId);
        const npc = NpcType.get(state.activeNpc.type);
        if (param.isString()) {
            state.pushString(ParamHelper.getStringParam(paramId, npc, param.defaultString));
        } else {
            state.pushInt(ParamHelper.getIntParam(paramId, npc, param.defaultInt));
        }
    },

    [ScriptOpcode.NPC_QUEUE]: (state) => {
        const delay = state.popInt();
        const queueId = state.popInt() - 1;
        if (queueId < 0 || queueId >= 20) {
            throw new Error(`Invalid ai_queue: ${queueId + 1}`);
        }

        const type = NpcType.get(state.activeNpc.type);
        const script = ScriptProvider.getByTrigger(ServerTriggerType.AI_QUEUE1 + queueId, type.id, type.category);
        if (script) {
            state.activeNpc.enqueueScript(script, delay);
        }
    },

    [ScriptOpcode.NPC_RANGE]: (state) => {
        const coord = state.popInt();
        const level = (coord >> 28) & 0x3fff;
        const x = (coord >> 14) & 0x3fff;
        const z = coord & 0x3fff;

        if (level !== state.activeNpc.level) {
            state.pushInt(-1);
        } else {
            state.pushInt(Position.distanceTo(state.activeNpc, {x, z}));
        }
    },

    [ScriptOpcode.NPC_SAY]: (state) => {
        state.activeNpc.say(state.popString());
    },

    [ScriptOpcode.NPC_SETHUNT]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_SETHUNTMODE]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_SETMODE]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_STAT]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_STATHEAL]: (state) => {
        throw new Error('unimplemented');
    },

    [ScriptOpcode.NPC_TYPE]: (state) => {
        state.pushInt(state.activeNpc.type);
    },

    [ScriptOpcode.NPC_DAMAGE]: (state) => {
        const amount = state.popInt();
        const type = state.popInt();

        state.activeNpc.applyDamage(amount, type, state.activePlayer.pid);
    },

    [ScriptOpcode.NPC_NAME]: (state) => {
        const npcType = NpcType.get(state.activeNpc.type);

        state.pushString(npcType.name ?? 'null');
    },

    [ScriptOpcode.NPC_UID]: (state) => {
        const npc = state.activeNpc;
        state.pushInt((npc.type << 16) | npc.nid);
    },

    [ScriptOpcode.NPC_SETTIMER]: (state) => {
        const interval = state.popInt();

        state.activeNpc.setTimer(interval);
    },

    [ScriptOpcode.SPOTANIM_NPC]: (state) => {
        const delay = state.popInt();
        const height = state.popInt();
        const spotanim = state.popInt();

        state.activeNpc.spotanim(spotanim, height, delay);
    },
};

export default NpcOps;
