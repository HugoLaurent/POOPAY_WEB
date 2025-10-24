import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoPoopay from "../assets/logo/logoPoopay.png";

const RATE_PER_HOUR = 12; // euros gagnes par heure
const GAMES = [
  {
    id: "dinoturd",
    name: "DinoTurd",
    description:
      "Cours dans le desert POOPAY et evite les crottes qui foncent vers toi.",
    tips: "Clic ou espace pour bondir. Les petits clics donnent des sauts rapides.",
  },
  {
    id: "flappyturd",
    name: "FlappyTurd",
    description:
      "Garde ton turd aile entre les tuyaux mentholes sans toucher les bords.",
    tips: "Clique ou appuie sur espace pour battre des ailes.",
  },
];

const MONEY_PER_SECOND = RATE_PER_HOUR / 3600;

const DINO_CONFIG = {
  groundOffset: 68,
  playerLeft: 64,
  playerWidth: 56,
  airClearance: 52,
  obstacleWidth: 40,
  speed: 420,
  gravity: 2400,
  jumpVelocity: 900,
  maxFall: 1800,
};

const FLAPPY_CONFIG = {
  birdX: 80,
  birdSize: 46,
  gapHeight: 128,
  gravity: 2000,
  flapStrength: 520,
  maxFall: 620,
  pipeSpeed: 230,
  pipeWidth: 68,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


function useAnimationFrame(active, callback) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return undefined;
    if (typeof window === "undefined") return undefined;

    let frameId;
    let previous = performance.now();

    const loop = (time) => {
      const delta = (time - previous) / 1000;
      previous = time;
      savedCallback.current?.({ delta, time });
      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame((time) => {
      previous = time;
      loop(time);
    });

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [active]);
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

function GameViewport({ gameId, running, resetToken, showConfirmation }) {
  const meta = GAMES.find((game) => game.id === gameId);

  if (!gameId || !meta) {
    return (
      <div className="relative w-full rounded-3xl border border-dashed border-poopay-mute/30 bg-poopay-card/80 px-8 py-10 text-center shadow-soft">
        <p className="text-sm text-poopay-text/70">
          Choisis un mini-jeu puis appuie sur{" "}
          <span className="font-semibold text-poopay-active">COMMENCER</span> pour te lancer.
        </p>
      </div>
    );
  }

  const statusLabel = running
    ? "En cours"
    : showConfirmation
    ? "En pause"
    : "Pret";

  const Component = gameId === "flappyturd" ? FlappyTurdGame : DinoTurdGame;
  const helper =
    showConfirmation && !running ? "Session en pause : valide ou annule ton timer." : meta.tips;

  return (
    <div className="relative mx-auto w-full max-w-3xl rounded-[38px] border border-white/12 bg-poopay-card/85 px-5 py-7 shadow-[0_38px_110px_rgba(0,0,0,0.12)] backdrop-blur-xl md:px-8 md:py-9">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-poopay-text md:text-lg">{meta.name}</h3>
          <p className="text-xs text-poopay-text/70 md:text-sm">{meta.description}</p>
        </div>
        <span
          className={`self-start rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] ${
            running
              ? "bg-poopay-active/15 text-poopay-active ring-1 ring-poopay-active/45"
              : "bg-poopay-card/90 text-poopay-text/60 ring-1 ring-white/25"
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-[660px] rounded-[32px] border border-white/14 bg-white/6 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.08)] sm:p-4">
          <Component key={gameId} running={running} resetToken={resetToken} />
        </div>
      </div>
      {helper ? (
        <p className="mt-7 text-center text-[10px] font-semibold uppercase tracking-[0.45em] text-poopay-mute">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function DinoTurdGame({ running, resetToken }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const obstacleRef = useRef(null);
  const [status, setStatus] = useState("ready");
  const statusRef = useRef(status);
  const gameState = useRef({
    obstacleX: 0,
    playerY: 0,
    playerVelocity: 0,
  });

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const syncDom = useCallback(() => {
    const { obstacleX, playerY } = gameState.current;
    if (playerRef.current) {
      playerRef.current.style.transform = `translate3d(0, ${-playerY}px, 0)`;
    }
    if (obstacleRef.current) {
      obstacleRef.current.style.transform = `translate3d(${obstacleX}px, 0, 0)`;
    }
  }, []);

  const resetGame = useCallback(() => {
    const width = containerRef.current?.offsetWidth ?? 360;
    gameState.current.obstacleX = width * 0.9;
    gameState.current.playerY = 0;
    gameState.current.playerVelocity = 0;
    syncDom();
    setStatus("ready");
  }, [syncDom]);

  useEffect(() => {
    resetGame();
  }, [resetGame, resetToken]);

  useEffect(() => {
    if (running) {
      setStatus((current) =>
        current === "ready" || current === "paused" ? "play" : current
      );
    } else {
      setStatus((current) => {
        if (current === "ready") return "ready";
        if (current === "paused") return current;
        return "paused";
      });
    }
  }, [running]);

  const triggerJump = useCallback(() => {
    if (!running) return;
    if (gameState.current.playerY > 6) return;
    gameState.current.playerVelocity = -DINO_CONFIG.jumpVelocity;
    setStatus((current) => (current === "play" ? current : "play"));
  }, [running]);

  useEffect(() => {
    if (!running) return undefined;
    const handler = (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running, triggerJump]);

  useAnimationFrame(
    running,
    useCallback(
      ({ delta }) => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.offsetWidth;
        const state = gameState.current;

        state.obstacleX -= DINO_CONFIG.speed * delta;
        if (state.obstacleX < -DINO_CONFIG.obstacleWidth - 24) {
          const spacing =
            width * 0.35 + Math.random() * Math.max(width * 0.25, 60);
          state.obstacleX = width + spacing;
        }

        state.playerVelocity = Math.min(
          DINO_CONFIG.maxFall,
          state.playerVelocity + DINO_CONFIG.gravity * delta
        );
        state.playerY = Math.max(0, state.playerY + state.playerVelocity * delta);
        if (state.playerY === 0 && state.playerVelocity > 0) {
          state.playerVelocity = 0;
        }

        syncDom();

        const obstacleFront = state.obstacleX + DINO_CONFIG.obstacleWidth;
        const obstacleBack = state.obstacleX;
        const playerFront =
          DINO_CONFIG.playerLeft + DINO_CONFIG.playerWidth - 8;
        const playerBack = DINO_CONFIG.playerLeft + 4;
        const overlapping =
          obstacleBack < playerFront && obstacleFront > playerBack;

        if (overlapping && state.playerY < DINO_CONFIG.airClearance) {
          if (statusRef.current !== "ouch") {
            setStatus("ouch");
          }
        } else if (statusRef.current === "ouch") {
          setStatus("play");
        }
      },
      [syncDom]
    )
  );

  return (
    <div
      ref={containerRef}
      onClick={triggerJump}
      role="button"
      tabIndex={0}
      className="relative flex min-h-[22rem] w-full select-none items-end overflow-hidden rounded-[28px] bg-gradient-to-br from-[#fceedd] via-[#f6dfc4] to-[#f2d0ac] px-6 pb-7 pt-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] outline-none transition focus:ring-2 focus:ring-poopay-active/40 sm:min-h-[26rem]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.65),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-6 h-16 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-75" />
      <div className="pointer-events-none absolute inset-x-12 bottom-[84px] h-24 rounded-full bg-white/35 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[70px] h-2 bg-gradient-to-r from-poopay-active/25 via-poopay-active/55 to-poopay-active/25 opacity-95" />
      <img
        src={logoPoopay}
        alt="Logo Poopay"
        className="pointer-events-none absolute left-6 top-6 h-12 w-12 opacity-80 drop-shadow-lg sm:h-16 sm:w-16"
      />
      <div
        ref={playerRef}
        className="absolute bottom-[68px] z-10 h-14 w-14 rounded-[18px] bg-gradient-to-br from-poopay-active to-[#f07c4d] shadow-[0_16px_32px_rgba(240,124,77,0.35)] will-change-transform"
        style={{ left: `${DINO_CONFIG.playerLeft}px` }}
      >
        <div className="absolute inset-[6px] rounded-[14px] border border-white/45 backdrop-blur-[1px]" />
        <div className="absolute left-3 top-3.5 h-2.5 w-2.5 rounded-full bg-white/90" />
        <div className="absolute inset-x-2 bottom-2 h-1 rounded-full bg-black/20 opacity-70" />
      </div>
      <div
        ref={obstacleRef}
        className="absolute bottom-[68px] h-12 w-10 rounded-[14px] bg-[#6b3b1c] shadow-[0_12px_26px_rgba(107,59,28,0.35)] will-change-transform"
        style={{ transform: "translate3d(120%,0,0)" }}
      >
        <div className="absolute inset-x-1 top-1 h-2 rounded-full bg-black/15 opacity-60" />
        <div className="absolute inset-x-2 bottom-2 h-[6px] rounded-full bg-black/20" />
      </div>
      <div className="pointer-events-none absolute right-6 top-7 flex items-center gap-2 rounded-full bg-white/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-poopay-text/60 backdrop-blur">
        {status === "ouch"
          ? "Oups !"
          : status === "paused"
          ? "Pause"
          : status === "ready"
          ? "Pret"
          : "Go !"}
      </div>
    </div>
  );
}

function FlappyTurdGame({ running, resetToken }) {
  const containerRef = useRef(null);
  const birdRef = useRef(null);
  const pipeWrapperRef = useRef(null);
  const pipeTopRef = useRef(null);
  const pipeBottomRef = useRef(null);
  const [status, setStatus] = useState("ready");
  const statusRef = useRef(status);
  const gameState = useRef({
    birdY: 0,
    birdVelocity: 0,
    pipeX: 0,
    gapCenter: 0,
  });

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const syncDom = useCallback(() => {
    const { birdY, pipeX, gapCenter } = gameState.current;
    const container = containerRef.current;
    if (birdRef.current) {
      birdRef.current.style.transform = `translate3d(${FLAPPY_CONFIG.birdX}px, ${birdY}px, 0)`;
    }
    if (pipeWrapperRef.current) {
      pipeWrapperRef.current.style.transform = `translate3d(${pipeX}px, 0, 0)`;
    }
    if (pipeTopRef.current && pipeBottomRef.current && container) {
      const height = container.offsetHeight;
      const gapHalf = FLAPPY_CONFIG.gapHeight / 2;
      const topHeight = clamp(gapCenter - gapHalf, 0, height);
      const bottomHeight = clamp(height - (gapCenter + gapHalf), 0, height);
      pipeTopRef.current.style.height = `${topHeight}px`;
      pipeBottomRef.current.style.height = `${bottomHeight}px`;
    }
  }, []);

  const resetGame = useCallback(() => {
    const container = containerRef.current;
    const width = container?.offsetWidth ?? 320;
    const height = container?.offsetHeight ?? 232;
    gameState.current.birdY = height / 2 - FLAPPY_CONFIG.birdSize / 2;
    gameState.current.birdVelocity = 0;
    gameState.current.pipeX = width * 0.75;
    gameState.current.gapCenter = height / 2;
    syncDom();
    setStatus("ready");
  }, [syncDom]);

  useEffect(() => {
    resetGame();
  }, [resetGame, resetToken]);

  useEffect(() => {
    if (running) {
      setStatus((current) =>
        current === "ready" || current === "paused" ? "play" : current
      );
    } else {
      setStatus((current) => {
        if (current === "ready") return "ready";
        if (current === "paused") return current;
        return "paused";
      });
    }
  }, [running]);

  const flap = useCallback(() => {
    if (!running) return;
    gameState.current.birdVelocity = -FLAPPY_CONFIG.flapStrength;
    setStatus((current) => (current === "play" ? current : "play"));
  }, [running]);

  useEffect(() => {
    if (!running) return undefined;
    const handler = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running, flap]);

  useAnimationFrame(
    running,
    useCallback(
      ({ delta }) => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const state = gameState.current;
        const gapHalf = FLAPPY_CONFIG.gapHeight / 2;

        state.birdVelocity = clamp(
          state.birdVelocity + FLAPPY_CONFIG.gravity * delta,
          -FLAPPY_CONFIG.flapStrength,
          FLAPPY_CONFIG.maxFall
        );
        state.birdY = clamp(
          state.birdY + state.birdVelocity * delta,
          0,
          height - FLAPPY_CONFIG.birdSize
        );

        state.pipeX -= FLAPPY_CONFIG.pipeSpeed * delta;
        if (state.pipeX < -FLAPPY_CONFIG.pipeWidth) {
          const spacing =
            width * 0.45 + Math.random() * Math.max(width * 0.2, 80);
          state.pipeX = width + spacing;
          const minCenter = gapHalf + 12;
          const maxCenter = height - gapHalf - 12;
          gameState.current.gapCenter = clamp(
            minCenter + Math.random() * (maxCenter - minCenter),
            minCenter,
            maxCenter
          );
        }

        syncDom();

        const pipeLeft = state.pipeX;
        const pipeRight = state.pipeX + FLAPPY_CONFIG.pipeWidth;
        const birdLeft = FLAPPY_CONFIG.birdX;
        const birdRight = FLAPPY_CONFIG.birdX + FLAPPY_CONFIG.birdSize;
        const overlapsX = pipeLeft < birdRight && pipeRight > birdLeft;

        const gapTop = state.gapCenter - gapHalf;
        const gapBottom = state.gapCenter + gapHalf;
        const birdTop = state.birdY;
        const birdBottom = state.birdY + FLAPPY_CONFIG.birdSize;

        const hitBounds = birdTop <= 0 || birdBottom >= height;

        if (
          hitBounds ||
          (overlapsX && (birdTop < gapTop || birdBottom > gapBottom))
        ) {
          if (statusRef.current !== "ouch") {
            setStatus("ouch");
          }
        } else if (statusRef.current === "ouch") {
          setStatus("play");
        }
      },
      [syncDom]
    )
  );

  return (
    <div
      ref={containerRef}
      onClick={flap}
      role="button"
      tabIndex={0}
      className="relative flex min-h-[22rem] w-full select-none items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-b from-[#d9f4ff] via-[#bde8ff] to-[#99dcff] px-6 pb-8 pt-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] outline-none transition focus:ring-2 focus:ring-poopay-active/40 sm:min-h-[26rem]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.8),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-6 h-[72px] bg-gradient-to-b from-white/40 via-white/15 to-transparent opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#86d4ff]/70 via-[#c5ecff]/40 to-transparent" />
      <img
        src={logoPoopay}
        alt="Logo Poopay"
        className="pointer-events-none absolute left-6 top-6 h-12 w-12 opacity-75 drop-shadow-lg sm:h-16 sm:w-16"
      />
      <div
        ref={birdRef}
        className="absolute z-10 h-11 w-11 rounded-full bg-gradient-to-br from-poopay-active to-[#ed8655] shadow-[0_14px_28px_rgba(237,134,85,0.35)] will-change-transform"
        style={{ transform: `translate3d(${FLAPPY_CONFIG.birdX}px, 0, 0)` }}
      >
        <div className="absolute inset-[6px] rounded-full border border-white/55 backdrop-blur-[1px]" />
        <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-white/90" />
      </div>
      <div
        ref={pipeWrapperRef}
        className="absolute inset-y-0 left-0 w-16 will-change-transform"
        style={{ transform: "translate3d(120%,0,0)" }}
      >
        <div
          ref={pipeTopRef}
          className="absolute left-0 top-0 w-full rounded-b-[18px] bg-[#4aa58b] shadow-[0_12px_22px_rgba(74,165,139,0.25)]"
        />
        <div
          ref={pipeBottomRef}
          className="absolute bottom-0 left-0 w-full rounded-t-[18px] bg-[#4aa58b] shadow-[0_-12px_22px_rgba(74,165,139,0.25)]"
        />
      </div>
      <div className="pointer-events-none absolute right-6 top-8 flex items-center gap-2 rounded-full bg-white/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-poopay-text/60 backdrop-blur">
        {status === "ouch"
          ? "Oups !"
          : status === "paused"
          ? "Pause"
          : status === "ready"
          ? "Pret"
          : "Vol !"}
      </div>
    </div>
  );
}

export default function Timer() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(GAMES[0].id);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [gameResetToken, setGameResetToken] = useState(0);

  useEffect(() => {
    if (!running) return undefined;

    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  const formattedTime = useMemo(
    () => formatTime(elapsedSeconds),
    [elapsedSeconds]
  );
  const earnings = elapsedSeconds * MONEY_PER_SECOND;
  const formattedEarnings = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }).format(earnings),
    [earnings]
  );

  const handleStart = () => {
    if (running) return;
    setShowConfirmation(false);
    setActiveGame(selectedGame);
    setGameResetToken((token) => token + 1);
    setRunning(true);
  };

  const handleAbortToHome = () => {
    navigate("/");
  };

  const handleStopRequest = () => {
    setRunning(false);
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setElapsedSeconds(0);
    setRunning(false);
    setActiveGame(null);
    setGameResetToken((token) => token + 1);
  };

  const handleValidate = () => {
    const gameInfo = GAMES.find((game) => game.id === selectedGame);
    setLastSession({
      game: gameInfo?.name ?? selectedGame,
      seconds: elapsedSeconds,
      earnings,
      finishedAt: new Date(),
    });
    setShowConfirmation(false);
    setElapsedSeconds(0);
    setRunning(false);
    setActiveGame(null);
    setGameResetToken((token) => token + 1);
  };

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-poopay-bg px-4 pb-36 sm:px-5">
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center">
          <header className="w-full px-4 text-center sm:px-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-poopay-mute">
              Compteur en direct
            </p>
            <div className="mt-2 flex flex-col items-center gap-1">
              <span className="text-3xl font-extrabold tabular-nums text-poopay-text md:text-4xl">
                {formattedTime}
              </span>
              <span className="text-sm font-semibold text-poopay-active md:text-base">
                {formattedEarnings} gagnes
              </span>
            </div>
          </header>

          <section className="mt-4 w-full">
            <h2 className="px-1 text-center text-base font-semibold text-poopay-text md:text-lg">
              Choisis ton mini-jeu pendant la session
            </h2>
            <div className="mt-3 flex gap-3 md:grid-cols-2 md:gap-4">
              {GAMES.map(({ id, name }) => {
                const active = selectedGame === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedGame(id)}
                    disabled={running}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition md:px-5 md:py-4 md:text-base ${
                      active
                        ? "border-poopay-active bg-poopay-active/15 text-poopay-text shadow-soft"
                        : "border-black/10 bg-poopay-card/70 text-poopay-text/80 hover:bg-poopay-card"
                    } ${running ? "cursor-not-allowed opacity-75" : ""}`}
                  >
                    <div className="font-semibold text-center">
                      {name}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-8 w-full">
            <GameViewport
              gameId={activeGame}
              running={running}
              resetToken={gameResetToken}
              showConfirmation={showConfirmation}
            />
            {!running && lastSession ? (
              <div className="mt-6 rounded-2xl border border-poopay-mute/15 bg-poopay-card/70 px-5 py-4 text-sm text-poopay-text/80 shadow-soft">
                <p className="font-semibold text-poopay-text">Derniere session</p>
                <p className="mt-1 text-poopay-text/70">
                  {lastSession.game} | {formatTime(lastSession.seconds)} |{" "}
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 2,
                  }).format(lastSession.earnings)}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-poopay-mute/15 bg-poopay-bg px-4 pb-7 pt-5 sm:px-5">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4">
          {!running && !showConfirmation && (
            <div className="w-full max-w-sm space-y-3">
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-3xl bg-poopay-active px-8 py-3.5 text-base font-semibold uppercase tracking-wide text-white shadow-soft transition hover:opacity-95 md:py-4 md:text-lg"
              >
                COMMENCER
              </button>
              <button
                type="button"
                onClick={handleAbortToHome}
                className="w-full rounded-3xl border border-poopay-mute/40 bg-poopay-card px-8 py-2.5 text-xs font-semibold uppercase tracking-wide text-poopay-text transition hover:bg-poopay-card/80 md:py-3 md:text-sm"
              >
                ANNULER
              </button>
            </div>
          )}

          {running && (
            <button
              type="button"
              onClick={handleStopRequest}
              className="w-full max-w-sm rounded-3xl bg-poopay-card px-8 py-3 text-sm font-semibold uppercase tracking-wide text-poopay-text shadow-soft ring-2 ring-poopay-active/40 transition hover:bg-poopay-card/90 md:text-base"
            >
              ARRETER LE COMPTEUR
            </button>
          )}

          {showConfirmation && (
            <div className="flex w-full max-w-lg flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-3xl border border-poopay-mute/40 bg-poopay-card px-6 py-3 text-xs font-semibold uppercase tracking-wide text-poopay-text transition hover:bg-poopay-card/80 md:text-sm"
              >
                ANNULER
              </button>
              <button
                type="button"
                onClick={handleValidate}
                className="flex-1 rounded-3xl bg-poopay-active px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-soft transition hover:opacity-95 md:text-sm"
              >
                VALIDER
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
