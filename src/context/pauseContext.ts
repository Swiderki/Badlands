type PauseCauses = { gameLogic: boolean; pauseMenu: boolean; windowChange: boolean };
export type PauseCause = keyof PauseCauses;
type PauseContext = {
  get isPaused(): boolean;
  pauseCauses: PauseCauses;
  isWindowActive: boolean | null;
  documentTimeline: DocumentTimeline;
  pauseGame: (cause: PauseCause, skipOverlayUpdate?: boolean) => void;
  resumeGame: (cause: PauseCause) => void;
};
let pauseContext: PauseContext = {} as PauseContext;

/** @argument context a reference to some object should be passed */
export const createPauseContext = (context: PauseContext) => (pauseContext = context);

export const usePauseContext = (): PauseContext => {
  if (!pauseContext.documentTimeline) {
    console.warn(`Trying to use context that wasn't created`);
  }
  return pauseContext;
};
