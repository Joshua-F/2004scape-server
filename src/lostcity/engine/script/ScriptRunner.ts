import ScriptState from '#lostcity/engine/script/ScriptState.js';
import path from 'path';
import Player from '#lostcity/entity/Player.js';
import Npc from '#lostcity/entity/Npc.js';
import Script from '#lostcity/engine/script/Script.js';
import { ScriptArgument } from '#lostcity/entity/EntityQueueRequest.js';
import Loc from '#lostcity/entity/Loc.js';
import CoreOps from '#lostcity/engine/script/handlers/CoreOps.js';
import ServerOps from '#lostcity/engine/script/handlers/ServerOps.js';
import PlayerOps from '#lostcity/engine/script/handlers/PlayerOps.js';
import NpcOps from '#lostcity/engine/script/handlers/NpcOps.js';
import LocOps from '#lostcity/engine/script/handlers/LocOps.js';
import ObjOps from '#lostcity/engine/script/handlers/ObjOps.js';
import NpcConfigOps from '#lostcity/engine/script/handlers/NpcConfigOps.js';
import LocConfigOps from '#lostcity/engine/script/handlers/LocConfigOps.js';
import ObjConfigOps from '#lostcity/engine/script/handlers/ObjConfigOps.js';
import InvOps from '#lostcity/engine/script/handlers/InvOps.js';
import EnumOps from '#lostcity/engine/script/handlers/EnumOps.js';
import StringOps from '#lostcity/engine/script/handlers/StringOps.js';
import NumberOps from '#lostcity/engine/script/handlers/NumberOps.js';
import DbOps from '#lostcity/engine/script/handlers/DbOps.js';
import DebugOps from '#lostcity/engine/script/handlers/DebugOps.js';
import Entity from '#lostcity/entity/Entity.js';
import Obj from '#lostcity/entity/Obj.js';
import ScriptPointer from '#lostcity/engine/script/ScriptPointer.js';

export type CommandHandler = (state: ScriptState) => void;
export type CommandHandlers = {
    [opcode: number]: CommandHandler
}

// script executor
export default class ScriptRunner {
    static readonly HANDLERS: CommandHandlers = {
        // Language required opcodes
        ...CoreOps,
        ...ServerOps,
        ...PlayerOps,
        ...NpcOps,
        ...LocOps,
        ...ObjOps,
        ...NpcConfigOps,
        ...LocConfigOps,
        ...ObjConfigOps,
        ...InvOps,
        ...EnumOps,
        ...StringOps,
        ...NumberOps,
        ...DbOps,
        ...DebugOps,
    };

    /**
     *
     * @param script
     * @param primaryEntity
     * @param activeEntities
     * @param pointers
     * @param args
     */
    static init(script: Script, primaryEntity: Entity | null = null, activeEntities: Entity[] = [], pointers: ScriptPointer[] = [], args: ScriptArgument[] | null = []) {
        const state = new ScriptState(script, args);
        state.self = primaryEntity;
        state.pointerSet(...pointers);

        if (primaryEntity !== null) {
            this.setupActiveEntity(state, primaryEntity);
        }

        for (const target of activeEntities) {
            this.setupActiveEntity(state, target);
        }

        return state;
    }

    private static setupActiveEntity(state: ScriptState, entity: Entity) {
        let activeArray: (Entity | null)[] | null = null;

        if (entity instanceof Player) {
            activeArray = state._activePlayers;
        } else if (entity instanceof Npc) {
            activeArray = state._activeNpcs;
        } else if (entity instanceof Loc) {
            activeArray = state._activeLocs;
        } else if (entity instanceof Obj) {
            activeArray = state._activeObjs;
        }

        if (!activeArray) {
            throw new Error(`Unsupported entity type: ${entity}`);
        }

        if (activeArray.length >= 2) {
            throw new Error('Attempting to have more than 2 active entities of the same type.');
        }

        // push the entity to the proper array
        activeArray.push(entity);
    }

    static execute(state: ScriptState, reset = false, benchmark = false) {
        if (!state || !state.script || !state.script.info) {
            return ScriptState.ABORTED;
        }

        try {
            if (reset) {
                state.reset();
            }

            if (state.execution !== ScriptState.RUNNING) {
                state.executionHistory.push(state.execution);
            }
            state.execution = ScriptState.RUNNING;

            while (state.execution === ScriptState.RUNNING) {
                if (state.pc >= state.script.opcodes.length || state.pc < -1) {
                    throw new Error('Invalid program counter: ' + state.pc + ', max expected: ' + state.script.opcodes.length);
                }

                // if we're benchmarking we don't care about the opcount
                if (!benchmark && state.opcount > 500_000) {
                    throw new Error('Too many instructions');
                }

                state.opcount++;
                ScriptRunner.executeInner(state, state.script.opcodes[++state.pc]);
            }
        } catch (err) {
            console.error(err);

            if (state.self instanceof Player) {
                state.self.wrappedMessageGame(`script error: ${err.message}`);
                state.self.wrappedMessageGame(`file: ${path.basename(state.script.info.sourceFilePath)}`);
                state.self.wrappedMessageGame('');

                state.self.wrappedMessageGame('stack backtrace:');
                state.self.wrappedMessageGame(`    1: ${state.script.name} - ${state.script.fileName}:${state.script.lineNumber(state.pc)}`);
                for (let i = state.fp; i > 0; i--) {
                    const frame = state.frames[i];
                    if (frame) {
                        state.self.wrappedMessageGame(`    ${state.fp - i + 2}: ${frame.script.name} - ${frame.script.fileName}:${frame.script.lineNumber(frame.pc)}`);
                    }
                }
            } else {
                console.error(`script error: ${err.message}`);
                console.error(`file: ${path.basename(state.script.info.sourceFilePath)}`);
                console.error('');

                console.error('stack backtrace:');
                console.error(`    1: ${state.script.name} - ${state.script.fileName}:${state.script.lineNumber(state.pc)}`);
                for (let i = state.fp; i > 0; i--) {
                    const frame = state.frames[i];
                    if (frame) {
                        console.error(`    ${state.fp - i + 2}: ${frame.script.name} - ${frame.script.fileName}:${frame.script.lineNumber(frame.pc)}`);
                    }
                }
            }

            state.execution = ScriptState.ABORTED;
        }

        return state.execution;
    }

    static executeInner(state: ScriptState, opcode: number) {
        const handler = ScriptRunner.HANDLERS[opcode];
        if (!handler) {
            throw new Error(`Unknown opcode ${opcode}`);
        }

        handler(state);
    }
}
