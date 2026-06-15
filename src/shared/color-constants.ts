import { Vector3 } from "../maths/vector3"


export const Colors = {
    RED: new Vector3(1, 0, 0),
    GREEN: new Vector3(0, 1, 0),
    BLUE: new Vector3(0, 0, 1),
    WHITE: new Vector3(1, 1, 1),
    BLACK: new Vector3(0, 0, 0),
    YELLOW: new Vector3(1, 1, 0),
    CYAN: new Vector3(0, 1, 1),
    MAGENTA: new Vector3(1, 0, 1),
    ORANGE: new Vector3(1, 0.5, 0),
    PURPLE: new Vector3(0.5, 0, 0.5),
    GRAY: new Vector3(0.5, 0.5, 0.5),
    DARK_GREEN: new Vector3(0, 0.5, 0),
    DARK_RED: new Vector3(0.5, 0, 0),
    DARK_BLUE: new Vector3(0, 0, 0.5),
    GOLD: new Vector3(1, 0.84, 0),
    SILVER: new Vector3(0.75, 0.75, 0.75),
    BRONZE: new Vector3(0.8, 0.5, 0.2)
} as const