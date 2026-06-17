export const Keys = {
    Q: "keyq",
    W: "keyw",
    E: "keye",
    R: "keyr",
    T: "keyt",
    Y: "keyy",
    U: "keyu",
    I: "keyi",
    O: "keyo",
    P: "keyp",
    A: "keya",
    S: "keys",
    D: "keyd",
    F: "keyf",
    G: "keyg",
    H: "keyh",
    J: "keyj",
    K: "keyk",
    L: "keyl",
    Z: "keyz",
    X: "keyx",
    C: "keyc",
    V: "keyv",
    B: "keyb",
    N: "keyn",
    M: "keym",

    Space: 'space',
    Shift: 'shiftleft',
    Control: 'controlleft',
    Escape: 'escape',
    Enter: 'enter',

    ArrowUp: 'arrowup',
    ArrowDown: 'arrowdown',
    ArrowLeft: 'arrowleft',
    ArrowRight: 'arrowright'
} as const

export type KeyCode = typeof Keys[keyof typeof Keys];

export class InputManager {
    private activeKeys = new Set<string>()

    constructor() {
        this.setupListeners()
    }

    private setupListeners(): void {
        window.addEventListener('keydown', (e) => {
            this.activeKeys.add(e.code.toLowerCase())
        })

        window.addEventListener('keyup', (e) => {
            this.activeKeys.delete(e.code.toLowerCase())
        })

        window.addEventListener('blur', () => {
            this.activeKeys.clear()
        })
    }

    public has(keyCode: KeyCode): boolean {
        return this.activeKeys.has(keyCode)
    }
}
