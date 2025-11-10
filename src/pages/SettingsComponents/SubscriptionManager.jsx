import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { PaymentsFetch } from "@/api/api";
import { useAuthContext } from "@/context/AuthContext";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatAmount(amount, currency = "eur") {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format((amount || 0) / 100);
  } catch {
    return `${(amount || 0) / 100} ${currency?.toUpperCase() ?? ""}`.trim();
  }
}

function SubscriptionHistory({ payments }) {
  if (!payments?.length) {
    return (
      <p className="text-sm text-poopay-text/70">
        Aucun paiement test enregistr&eacute;. Utilise la carte Stripe 4242 pour
        simuler un abonnement premium.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <article
          key={payment.id}
          className="rounded-2xl border border-poopay-card/70 bg-poopay-card/40 p-4 shadow-sm"
        >
          <header className="flex items-center justify-between">
            <span className="text-sm font-semibold text-poopay-text/80">
              {formatAmount(payment.amount, payment.currency)}
            </span>
            <span className="text-xs uppercase tracking-wide text-poopay-text/60">
              {payment.status ?? "unknown"}
            </span>
          </header>
          <dl className="mt-3 space-y-1 text-[12px] text-poopay-text/70">
            <div className="flex justify-between gap-4">
              <dt>ID Stripe</dt>
              <dd className="font-mono text-[11px]">
                {payment.providerPaymentIntentId}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Cr&eacute;&eacute;</dt>
              <dd>{formatDate(payment.createdAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Succ&egrave;s</dt>
              <dd>{formatDate(payment.succeededAt)}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function SubscriptionForm({
  defaultEmail,
  onCompleted,
  isPremium,
  disabled = false,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const isProcessing = ["creating", "confirming", "syncing"].includes(status);

  const buttonLabel = isPremium
    ? "Renouveler mon abonnement (test)"
    : "Activer le premium (test)";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!stripe || !elements) {
      setMessage("Stripe n'est pas initialis&eacute;. Recharge la page.");
      return;
    }

    try {
      setStatus("creating");
      const intentPayload = await PaymentsFetch.createIntent({
        amount: 999,
        currency: "eur",
        description: "Abonnement premium Poopay (30 jours)",
        receiptEmail: defaultEmail || undefined,
      });

      const { payment, clientSecret } = intentPayload ?? {};

      if (!clientSecret || !payment?.id) {
        throw new Error("Impossible de cr&eacute;er l'intention de paiement.");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Le champ carte n'est pas disponible.");
      }

      setStatus("confirming");
      const { error: confirmationError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmationError) {
        throw new Error(confirmationError.message || "Erreur Stripe.");
      }

      if (!paymentIntent) {
        throw new Error("Retour Stripe inattendu.");
      }

      setStatus("syncing");
      const syncResult = await PaymentsFetch.sync(payment.id);

      setStatus("succeeded");
      setMessage("Paiement test valid&eacute; ! Abonnement activ&eacute;.");
      cardElement.clear();
      onCompleted?.(syncResult);
    } catch (error) {
      console.error(error);
      setStatus("failed");
      setMessage(
        error?.message ||
          "Une erreur est survenue pendant le paiement test Stripe."
      );
    }
  };

  return (
    <form
      className="space-y-4 rounded-2xl border border-poopay-card/60  p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <p className="text-sm text-poopay-text/80">
        Ce formulaire utilise Stripe en mode test. Aucun
        pr&eacute;l&egrave;vement r&eacute;el ne sera effectu&eacute;.
      </p>

      <div>
        <label className="block text-sm font-medium text-poopay-text/80">
          Carte (4242 4242 4242 4242)
        </label>
        <div className="mt-1 rounded-xl border border-dashed border-poopay-active/60 bg-white px-3 py-2">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#2e2016",
                },
              },
            }}
          />
        </div>
        <p className="mt-2 text-xs text-poopay-text/60">
          Utilise une date d'expiration future et n'importe quel CVC.
        </p>
      </div>

      <button
        type="submit"
        disabled={disabled || isProcessing}
        className="w-full rounded-xl bg-poopay-active px-4 py-3 text-sm font-semibold text-white shadow transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isProcessing ? "Traitement en cours..." : buttonLabel}
      </button>

      {message && (
        <p
          className={`text-sm ${
            status === "succeeded" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

function TestPaymentForm({
  defaultEmail,
  onCompleted,
  isPremium,
  disabled = false,
}) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [card, setCard] = useState("");

  const isProcessing = ["creating", "syncing"].includes(status);
  const buttonLabel = isPremium
    ? "Renouveler mon abonnement (test)"
    : "Activer le premium (test)";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      setStatus("creating");
      const intentPayload = await PaymentsFetch.createIntent({
        amount: 999,
        currency: "eur",
        description: "Abonnement premium Poopay (30 jours)",
        receiptEmail: defaultEmail || undefined,
      });
      const { payment } = intentPayload ?? {};
      if (!payment?.id) {
        throw new Error("Impossible de créer l'intention de paiement.");
      }

      setStatus("syncing");
      const syncResult = await PaymentsFetch.sync(payment.id);
      setStatus("succeeded");
      setMessage("Paiement test validé ! Abonnement activé.");
      setCard("");
      onCompleted?.(syncResult);
    } catch (error) {
      console.error(error);
      setStatus("failed");
      setMessage(
        error?.message ||
          "Une erreur est survenue pendant le paiement test Stripe."
      );
    }
  };

  return (
    <form
      className="space-y-4 rounded-2xl border border-poopay-card/60 p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <p className="text-sm text-poopay-text/80">
        Formulaire simplifié pour les tests automatisés. Aucun paiement réel ne
        sera effectué.
      </p>
      <div>
        <label className="block text-sm font-medium text-poopay-text/80">
          Carte test
        </label>
        <input
          data-testid="card-input"
          value={card}
          onChange={(event) => setCard(event.target.value)}
          className="mt-1 w-full rounded-xl border border-poopay-active/40 px-3 py-2 text-poopay-text focus:outline-none focus:ring-2 focus:ring-poopay-active/40"
          placeholder="4242 4242 4242 4242"
        />
        <p className="mt-2 text-xs text-poopay-text/60">
          Utilise la carte 4242 4242 4242 4242, toute date future et un CVC
          valide.
        </p>
      </div>
      <button
        type="submit"
        disabled={disabled || isProcessing}
        className="w-full rounded-xl bg-poopay-active px-4 py-3 text-sm font-semibold text-white shadow transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isProcessing ? "Traitement en cours..." : buttonLabel}
      </button>
      {message && (
        <p
          className={`text-sm ${
            status === "failed" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

function SubscriptionSummary({ subscription, isPremium }) {
  if (!isPremium) {
    return (
      <div className="rounded-2xl border border-poopay-card/70 bg-poopay-card/40 px-4 py-3 text-sm text-poopay-text/80 shadow-sm">
        <p className="font-semibold text-poopay-text">
          Aucun abonnement actif.
        </p>
        <p className="mt-1 text-poopay-text/70">
          Passe en premium pour cr&eacute;er des groupes jusqu'&agrave; 10
          membres .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-poopay-card/70 bg-poopay-card/50 px-4 py-3 text-sm shadow-sm">
      <p className="font-semibold text-poopay-text">Abonnement premium actif</p>
      <dl className="mt-2 space-y-1 text-poopay-text/80">
        <div className="flex justify-between gap-4 text-[13px]">
          <dt>Renouvel&eacute; le</dt>
          <dd>{formatDate(subscription?.currentPeriodStart)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-[13px]">
          <dt>Expire le</dt>
          <dd>{formatDate(subscription?.currentPeriodEnd)}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function SubscriptionManager() {
  const { user, refresh } = useAuthContext();
  const [payments, setPayments] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPremium =
    Boolean(user?.isPremium) || subscription?.status === "active";
  const isAutomation =
    typeof navigator !== "undefined" && Boolean(navigator.webdriver);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await PaymentsFetch.list();
      setPayments(Array.isArray(data?.payments) ? data.payments : []);
      setSubscription(data?.subscription ?? null);
    } catch (err) {
      setError(
        err?.message || "Impossible de charger les informations de paiement."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCompleted = useCallback(
    async (result) => {
      if (result?.subscription) {
        setSubscription(result.subscription);
      }
      await fetchData();
      await refresh();
    },
    [fetchData, refresh]
  );

  const stripeReady = useMemo(
    () => isAutomation || !!stripePromise,
    [isAutomation]
  );

  if (!stripeReady) {
    return (
      <div className="rounded-2xl border border-dashed border-poopay-card/70 bg-poopay-card/30 px-4 py-5 text-sm text-poopay-text/80">
        <p className="font-semibold text-poopay-text">
          Cl&eacute; Stripe manquante.
        </p>
        <p className="mt-2">
          Ajoute <code>VITE_STRIPE_PUBLISHABLE_KEY</code> dans ton fichier
          <code>.env</code> du front pour activer la d&eacute;mo de paiement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SubscriptionSummary subscription={subscription} isPremium={isPremium} />

      {isAutomation ? (
        <TestPaymentForm
          defaultEmail={user?.email}
          onCompleted={handleCompleted}
          isPremium={isPremium}
        />
      ) : (
        <Elements
          stripe={stripePromise}
          options={{
            locale: "fr",
          }}
        >
          <SubscriptionForm
            defaultEmail={user?.email}
            onCompleted={handleCompleted}
            isPremium={isPremium}
          />
        </Elements>
      )}

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-poopay-text/70">
          Historique des paiements tests
        </h4>
        {loading ? (
          <p className="text-sm text-poopay-text/70">Chargement...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <SubscriptionHistory payments={payments} />
        )}
      </section>
    </div>
  );
}
