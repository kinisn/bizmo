/* = 利用法 = 

  static async getMediaStream(video: Option<VideoDevice>, audio: Option<AudioDevice>, constraints: Option<MediaStreamConstraints>): PromiseResult<MediaStream> {
    const videoTrackConstraints = this.getVideoConstraints(video, constraints);
    const audioTrackConstraints = this.getAudioConstraints(audio, constraints);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: matchOption(videoTrackConstraints, { some: v => v, none: () => undefined }),
        audio: matchOption(audioTrackConstraints, { some: a => a, none: () => undefined }),
        peerIdentity: matchOption(constraints, { some: c => c.peerIdentity, none: () => undefined }),
        preferCurrentTab: matchOption(constraints, { some: c => c.preferCurrentTab, none: () => undefined }),
      })

      return success(stream);
    } catch (e: any) {
      return failureException(e);
    }
  }
*/
// Option

type Some<T> = { some: true; value: T };
type None = { some: false };

export type Option<T> = Some<T> | None;

export interface OptionMatchers<T, R1, R2> {
    some(value: T): R1;
    none(): R2;
}

export const some = <T>(value: T): Option<T> => ({ some: true, value: value });

export const none = <T>(): Option<T> => ({ some: false });

export const someOrNone = <T>(value: T | undefined | null): Option<T> => {
    if (value == null) {
        return none();
    }

    return some(value);
};

export const matchOption = <T, R1, R2>(
    option: Option<T>,
    matchers: OptionMatchers<T, R1, R2>
) => (option.some === true ? matchers.some(option.value) : matchers.none());

// Result
type Success<T> = { ok: true; value: T };
type Failure<E extends Error> = { ok: false; error: E };

export type Result<T = void, E extends Error = Error> = Success<T> | Failure<E>;

export type PromiseResult<T = void, E extends Error = Error> = Promise<
    Result<T, E>
>;

export interface ResultMatchers<T, E extends Error, R1, R2> {
    ok(value: T): R1;
    err(error: E): R2;
}

export const success = <T>(value: T): Result<T> => ({ ok: true, value: value });

export const successVoid = () => success<void>(undefined);

export const failure = <T, E extends Error>(error: E): Result<T, E> => ({
    ok: false,
    error: error,
});

export const matchResult = <T, E extends Error, R1, R2>(
    result: Result<T, E>,
    matchers: ResultMatchers<T, E, R1, R2>
) =>
    result.ok === true ? matchers.ok(result.value) : matchers.err(result.error);

export const failureException = <T>(e: any): Result<T, Error> => {
    let err: Error;
    if (e instanceof Error) {
        err = e;
    } else {
        err = new Error(e);
    }

    return failure(err);
};
