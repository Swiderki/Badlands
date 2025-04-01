type PauseContext = {
  isPaused: boolean;
  isWindowActive: boolean | null;
  documentTimeline: DocumentTimeline;
  pauseGame: () => void;
  resumeGame: () => void;
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
