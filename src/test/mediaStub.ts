type MediaState = {
  playing: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
};

const states = new WeakMap<HTMLMediaElement, MediaState>();

function stateOf(element: HTMLMediaElement): MediaState {
  let state = states.get(element);
  if (!state) {
    state = { playing: false, playbackRate: 1, currentTime: 0, duration: Number.NaN };
    states.set(element, state);
  }
  return state;
}

/**
 * The single replacement used by the page-level tests: a media element whose
 * duration, failure, playback rate and position a test can drive directly.
 */
export const media = {
  /** Makes the next play() reject, the way a browser autoplay block does. */
  rejectNextPlay: false,
  isPlaying: (element: HTMLMediaElement) => stateOf(element).playing,
  currentTime: (element: HTMLMediaElement) => stateOf(element).currentTime,
  playbackRate: (element: HTMLMediaElement) => stateOf(element).playbackRate,
  reportDuration(element: HTMLMediaElement, seconds: number) {
    stateOf(element).duration = seconds;
    element.dispatchEvent(new Event('loadedmetadata'));
  },
  reportError(element: HTMLMediaElement) {
    element.dispatchEvent(new Event('error'));
  },
};

export function installMediaStub() {
  const proto = window.HTMLMediaElement.prototype;

  Object.defineProperty(proto, 'play', {
    configurable: true,
    writable: true,
    value(this: HTMLMediaElement) {
      if (media.rejectNextPlay) {
        media.rejectNextPlay = false;
        return Promise.reject(new Error('play() blocked'));
      }
      stateOf(this).playing = true;
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    },
  });

  Object.defineProperty(proto, 'pause', {
    configurable: true,
    writable: true,
    value(this: HTMLMediaElement) {
      stateOf(this).playing = false;
      this.dispatchEvent(new Event('pause'));
    },
  });

  Object.defineProperty(proto, 'load', {
    configurable: true,
    writable: true,
    value() {},
  });

  Object.defineProperty(proto, 'duration', {
    configurable: true,
    get(this: HTMLMediaElement) {
      return stateOf(this).duration;
    },
  });

  Object.defineProperty(proto, 'currentTime', {
    configurable: true,
    get(this: HTMLMediaElement) {
      return stateOf(this).currentTime;
    },
    set(this: HTMLMediaElement, value: number) {
      stateOf(this).currentTime = value;
    },
  });

  Object.defineProperty(proto, 'playbackRate', {
    configurable: true,
    get(this: HTMLMediaElement) {
      return stateOf(this).playbackRate;
    },
    set(this: HTMLMediaElement, value: number) {
      stateOf(this).playbackRate = value;
    },
  });
}
