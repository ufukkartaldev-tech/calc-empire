import { SolveFn } from "@/types/calculator";
import { solve as ohmSolve } from "./ohm";

/**
 * Registry of all available calculator solvers.
 * This identifies logic at runtime based on a serializable key stored in the config.
 */
export const SOLVER_REGISTRY: Record<string, SolveFn> = {
    'ohm': ohmSolve,
};
