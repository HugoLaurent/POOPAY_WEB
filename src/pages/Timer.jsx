import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const RATE_PER_HOUR = 12; // euros gagnés par heure
const GAMES = [
  {
    id: "dinoturd",
    name: "DinoTurd",
    description: "Course sans fin façon dino Google mais version POOPAY.",
    tips: "Tape espace ou clique sur la zone pour sauter les crottes.",
  },
  {
    id: "flappyturd",
    name: "FlappyTurd",
    description: "Traverse les tuyaux avec ton turd ailé sans te crasher.",
    tips: "Clique ou touche espace pour garder ton turd en l’air.",
  },
];

const MONEY_PER_SECOND = RATE_PER_HOUR / 3600;

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

  if (!gameId) {
    return (
      <div className="w-full rounded-3xl border border-dashed border-poopay-mute/30 bg-poopay-card/70 px-6 py-10 text-center text-sm text-poopay-mute">
        Choisis DinoTurd ou FlappyTurd puis appuie sur «&nbsp;COMMENCER&nbsp;»
        pour lancer la session.
      </div>
    );
  }

  const Component = gameId === "flappyturd" ? FlappyTurdGame : DinoTurdGame;
  const helper =
    showConfirmation && !running
      ? "Session en pause : valide ou annule ton timer."
      : meta?.tips || "";

  return (
    <div className="w-full rounded-3xl bg-poopay-card/80 px-4 py-5 shadow-soft">
      <Component running={running} resetToken={resetToken} />
      {helper ? (
        <p className="mt-3 text-center text-xs uppercase tracking-wide text-poopay-mute">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function DinoTurdGame({ running, resetToken }) {
  const [obstacleX, setObstacleX] = useState(100);
  const [jumping, setJumping] = useState(false);
  const [status, setStatus] = useState("ready");
  const jumpTimeout = useRef(null);

  useEffect(() => {
    setObstacleX(100);
    setJumping(false);
    setStatus("ready");
  }, [resetToken]);

  useEffect(
    () => () => {
      if (jumpTimeout.current) {
        window.clearTimeout(jumpTimeout.current);
      }
    },
    []
  );

  const triggerJump = useCallback(() => {
    if (!running) return;
    if (jumpTimeout.current) window.clearTimeout(jumpTimeout.current);
    setJumping(true);
    jumpTimeout.current = window.setTimeout(() => {
      setJumping(false);
      jumpTimeout.current = null;
    }, 420);
  }, [running]);

  useEffect(() => {
    if (!running) {
      setStatus((prev) => (prev === "ready" ? "ready" : "paused"));
      return undefined;
    }
    setStatus("play");
    const ticker = window.setInterval(() => {
      setObstacleX((prev) => {
        const next = prev - 1.6;
        return next <= -10 ? 100 : next;
      });
    }, 16);
    return () => window.clearInterval(ticker);
  }, [running]);

  useEffect(() => {
    if (!running) return undefined;
    const keyHandler = (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [running, triggerJump]);

  useEffect(() => {
    if (!running) return;
    const withinRange = obstacleX < 16 && obstacleX > 6;
    if (withinRange && !jumping) {
      setStatus("ouch");
    } else if (status === "ouch") {
      setStatus("play");
    }
  }, [obstacleX, jumping, running, status]);

  return (
    <div
      onClick={triggerJump}
      role="button"
      tabIndex={0}
      className="relative h-40 w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-poopay-card to-poopay-card/80 outline-none"
    >
      <div className="absolute inset-x-0 bottom-8 h-1 bg-poopay-active/40" />
      <div
        className={`absolute bottom-8 left-10 h-10 w-10 rounded-2xl bg-poopay-active transition-transform duration-200 ${
          jumping ? "-translate-y-16" : ""
        }`}
      />
      <div
        className="absolute bottom-8 h-8 w-6 rounded-lg bg-poopay-text/70"
        style={{ left: `${obstacleX}%` }}
      />
      <p className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-wide text-poopay-mute">
        {status === "ouch"
          ? "Aïe ! saute vite"
          : "Clique ou espace pour sauter"}
      </p>
    </div>
  );
}

function FlappyTurdGame({ running, resetToken }) {
  const [birdY, setBirdY] = useState(50);
  const [pipeX, setPipeX] = useState(100);
  const [gapY, setGapY] = useState(45);
  const [status, setStatus] = useState("ready");

  useEffect(() => {
    setBirdY(50);
    setPipeX(100);
    setGapY(45);
    setStatus("ready");
  }, [resetToken]);

  const flap = useCallback(() => {
    if (!running) return;
    setBirdY((prev) => Math.max(5, prev - 12));
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

  useEffect(() => {
    if (!running) return undefined;
    setStatus("play");
    const gravity = window.setInterval(() => {
      setBirdY((prev) => Math.min(95, prev + 1.2));
    }, 40);
    return () => window.clearInterval(gravity);
  }, [running]);

  useEffect(() => {
    if (!running) return undefined;
    const mover = window.setInterval(() => {
      setPipeX((prev) => {
        const next = prev - 1.6;
        if (next <= -10) {
          setGapY(25 + Math.random() * 40);
          return 100;
        }
        return next;
      });
    }, 24);
    return () => window.clearInterval(mover);
  }, [running]);

  useEffect(() => {
    if (!running) {
      setStatus((prev) => (prev === "ready" ? "ready" : "paused"));
      return;
    }
    const withinPipe = pipeX < 25 && pipeX > 15;
    if (withinPipe) {
      const gapTop = gapY - 12;
      const gapBottom = gapY + 12;
      if (birdY < gapTop || birdY > gapBottom) {
        setStatus("ouch");
      } else {
        setStatus("play");
      }
    } else if (status === "ouch") {
      setStatus("play");
    }
  }, [birdY, pipeX, gapY, running, status]);

  return (
    <div
      onClick={flap}
      role="button"
      tabIndex={0}
      className="relative h-40 w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-[#f9e8d9] via-[#f6dec7] to-[#f1d0ad] outline-none"
    >
      <p className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-wide text-poopay-mute">
        {status === "ouch"
          ? "Oups ! clique ou espace pour continuer"
          : "Clique ou espace pour voler"}
      </p>
      <div
        className="absolute left-14 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-poopay-active shadow-[0_0_0_4px_rgba(255,255,255,0.55)] transition-transform duration-150"
        style={{ top: `${birdY}%` }}
      />
      <div
        className="absolute top-0 h-full w-8 bg-poopay-card/90"
        style={{ left: `${pipeX}%` }}
      >
        <div
          className="absolute left-0 top-0 w-full bg-poopay-text/20"
          style={{ height: `${Math.max(0, gapY - 15)}%` }}
        />
        <div
          className="absolute bottom-0 left-0 w-full bg-poopay-text/20"
          style={{ height: `${Math.max(0, 100 - (gapY + 15))}%` }}
        />
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
      <div className="min-h-[calc(100vh-64px)] bg-poopay-bg px-5 pb-40">
        <div className="mx-auto flex h-full max-w-3xl flex-col items-center">
          <header className="w-full px-5 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-poopay-mute">
              Compteur en direct
            </p>
            <div className="mt-3 flex flex-col items-center gap-1.5">
              <span className="text-4xl font-extrabold tabular-nums text-poopay-text">
                {formattedTime}
              </span>
              <span className="text-base font-semibold text-poopay-active">
                {formattedEarnings} gagnés
              </span>
            </div>
          </header>

          <section className="mt-4 w-full">
            <h2 className="px-1 text-center text-lg font-semibold text-poopay-text">
              Choisis ton mini-jeu pendant la session
            </h2>
            <div className="mt-4 flex gap-4 md:grid-cols-2">
              {GAMES.map(({ id, name }) => {
                const active = selectedGame === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedGame(id)}
                    disabled={running}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
                      active
                        ? "border-poopay-active bg-poopay-active/15 text-poopay-text shadow-soft"
                        : "border-black/10 bg-poopay-card/70 text-poopay-text/80 hover:bg-poopay-card"
                    } ${running ? "cursor-not-allowed opacity-75" : ""}`}
                  >
                    <div className="text-base font-semibold text-center">
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
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-poopay-mute/15 bg-poopay-bg px-5 pb-8 pt-6 ">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          {!running && !showConfirmation && (
            <div className="w-full max-w-xs space-y-3">
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-3xl bg-poopay-active px-8 py-4 text-lg font-semibold uppercase tracking-wide text-white shadow-soft transition hover:opacity-95"
              >
                COMMENCER
              </button>
              <button
                type="button"
                onClick={handleAbortToHome}
                className="w-full rounded-3xl border border-poopay-mute/40 bg-poopay-card px-8 py-3 text-sm font-semibold uppercase tracking-wide text-poopay-text transition hover:bg-poopay-card/80"
              >
                ANNULER
              </button>
            </div>
          )}

          {running && (
            <button
              type="button"
              onClick={handleStopRequest}
              className="w-full max-w-xs rounded-3xl bg-poopay-card px-8 py-3 text-base font-semibold uppercase tracking-wide text-poopay-text shadow-soft ring-2 ring-poopay-active/40 transition hover:bg-poopay-card/90"
            >
              ARRETER LE COMPTEUR
            </button>
          )}

          {showConfirmation && (
            <div className="flex w-full max-w-md flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-3xl border border-poopay-mute/40 bg-poopay-card px-6 py-3 text-sm font-semibold uppercase tracking-wide text-poopay-text transition hover:bg-poopay-card/80"
              >
                ANNULER
              </button>
              <button
                type="button"
                onClick={handleValidate}
                className="flex-1 rounded-3xl bg-poopay-active px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-soft transition hover:opacity-95"
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
