// src/pages/SignUp.jsx
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Hourglass } from "lucide-react";
import logo from "../assets/logo/logoPoopay.png";

import departements from "../assets/data/departement.json";
import categories from "../assets/data/category.json";

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");

  const [searchDept, setSearchDept] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    departmentCode: "",
    categoryId: null,
    monthlySalary: "",
    monthlyHours: "",
    acceptedTerms: false,
    acceptedHealth: false,
    theme: "light",
  });

  // Si tu gères le thème système quelque part, synchronise ici
  useEffect(() => {
    // Exemple: lire data-theme de <html>
    const prefersDark =
      document.documentElement.dataset.theme === "dark" ||
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setData((d) => ({ ...d, theme: prefersDark ? "dark" : "light" }));
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!searchDept.trim()) return departements;
    const q = searchDept.toLowerCase();
    return departements.filter(
      (d) => d.nom.toLowerCase().includes(q) || d.code.includes(searchDept)
    );
  }, [searchDept]);

  const filteredCategories = useMemo(() => {
    if (!searchCategory.trim()) return categories;
    const q = searchCategory.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchCategory]);

  const update = (field, value) => setData((p) => ({ ...p, [field]: value }));

  const validateStep = (s) => {
    switch (s) {
      case 1: {
        if (!data.email || !data.password || !data.confirmPassword) {
          return (
            setErr("Veuillez remplir tous les champs d'identifiants."), false
          );
        }
        if (!data.email.includes("@")) {
          return setErr("Email invalide."), false;
        }
        if (data.password.length < 12) {
          return (
            setErr("Le mot de passe doit contenir au moins 12 caractères."),
            false
          );
        }
        const symbolRegex = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/;
        if (!symbolRegex.test(data.password)) {
          return (
            setErr("Le mot de passe doit contenir au moins un symbole."), false
          );
        }
        if (data.password !== data.confirmPassword) {
          return setErr("Les mots de passe ne correspondent pas."), false;
        }
        setErr("");
        return true;
      }
      case 2: {
        if (!data.username.trim()) {
          return setErr("Veuillez renseigner un nom d'utilisateur."), false;
        }
        if (!data.departmentCode) {
          return setErr("Veuillez sélectionner un département."), false;
        }
        setErr("");
        return true;
      }
      case 3: {
        if (!data.categoryId) {
          return (
            setErr("Veuillez sélectionner une catégorie professionnelle."),
            false
          );
        }
        setErr("");
        return true;
      }
      case 4: {
        if (!data.monthlySalary.trim() || !data.monthlyHours.trim()) {
          return (
            setErr("Salaire mensuel et heures mensuelles sont requis."), false
          );
        }
        const salary = parseFloat(data.monthlySalary);
        const hours = parseFloat(data.monthlyHours);
        if (Number.isNaN(salary) || salary <= 0) {
          return setErr("Salaire mensuel doit être un nombre positif."), false;
        }
        if (Number.isNaN(hours) || hours <= 0) {
          return (
            setErr("Heures mensuelles doivent être un nombre positif."), false
          );
        }
        setErr("");
        return true;
      }
      case 5: {
        if (!data.acceptedTerms || !data.acceptedHealth) {
          return (
            setErr(
              "Vous devez accepter les Conditions d’utilisation et le Disclaimer santé."
            ),
            false
          );
        }
        setErr("");
        return true;
      }
      default:
        return false;
    }
  };

  const next = () => {
    if (validateStep(step)) {
      if (step < 5) setStep((s) => s + 1);
      else handleSubmit();
    }
  };

  const back = () => {
    if (step > 1) setStep((s) => s - 1);
    else window.history.back();
  };

  async function handleSubmit() {
    setErr("");
    setIsLoading(true);
    try {
      // ➜ Branche ici ton appel API d’inscription
      // Exemple:
      // const res = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({...}) });
      // const json = await res.json();
      // if (!json.success) throw new Error(json.message || "Inscription impossible.");

      await new Promise((r) => setTimeout(r, 1000)); // simulation

      // Redirige vers l’app / tableau de bord :
      // window.location.href = "/app";
      alert("Bienvenue 🎉 Ton compte a été créé avec succès !");
    } catch (e) {
      console.error(e);
      setErr(
        e?.message ||
          "Une erreur inattendue est survenue. Vérifie ta connexion et réessaie."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const Progress = () => (
    <div className="flex justify-center items-center gap-3 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-12 rounded-full transition-all ${
            step >= i ? "bg-poopay-active" : "bg-poopay-pill"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-poopay-bg flex items-center justify-center px-5">
      <div className="w-full max-w-xl text-center">
        {/* Header */}
        <div className="mb-8">
          <img
            src={logo}
            alt="Logo Poopay"
            className="mx-auto w-20 h-20 object-contain"
          />
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-poopay-text">
            POOPAY
          </h1>
          <p className="mt-1 text-poopay-text/70">
            Combien vaut ta pause&nbsp;?
          </p>
        </div>

        <div className=" px-6 py-7 text-left ">
          <Progress />

          {err && (
            <p
              aria-live="assertive"
              className="mb-4 text-sm text-red-600 bg-red-50/70 rounded-2xl px-3 py-2"
            >
              {err}
            </p>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-poopay-active mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="ton.email@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-3xl bg-white text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition"
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-poopay-active mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Min 12 caractères + 1 symbole"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={data.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="w-full rounded-3xl bg-white text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-poopay-mute hover:text-poopay-text"
                    aria-label={
                      showPwd
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-poopay-active mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    placeholder="Répète ton mot de passe"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={data.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    className="w-full rounded-3xl bg-white text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-poopay-mute hover:text-poopay-text"
                    aria-label={
                      showConfirmPwd
                        ? "Masquer la confirmation"
                        : "Afficher la confirmation"
                    }
                  >
                    {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-poopay-active mb-2">
                  Nom d’utilisateur
                </label>
                <input
                  type="text"
                  placeholder="TonPseudo"
                  disabled={isLoading}
                  value={data.username}
                  onChange={(e) => update("username", e.target.value)}
                  className="w-full rounded-3xl bg-white text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition"
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-poopay-active mb-2">
                  Département
                </label>
                <input
                  type="text"
                  placeholder="Rechercher un département (code ou nom)…"
                  disabled={isLoading}
                  value={searchDept}
                  onChange={(e) => setSearchDept(e.target.value)}
                  className="w-full rounded-3xl bg-white text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition"
                />
                <div className="mt-3 max-h-56 overflow-auto rounded-2xl ring-1 ring-poopay-pill bg-white">
                  {filteredDepartments.map((item) => {
                    const selected = data.departmentCode === item.code;
                    return (
                      <button
                        type="button"
                        key={item.code}
                        onClick={() => {
                          update("departmentCode", item.code);
                          setSearchDept(`${item.code} - ${item.nom}`);
                        }}
                        className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition ${
                          selected
                            ? "bg-poopay-active/10 text-poopay-text font-semibold"
                            : "hover:bg-poopay-active/5 text-poopay-text"
                        }`}
                      >
                        {item.code} — {item.nom}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-poopay-active mb-2">
                  Catégorie professionnelle
                </label>
                <input
                  type="text"
                  placeholder="Rechercher une catégorie…"
                  disabled={isLoading}
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full rounded-3xl bg-white text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition"
                />
                <div className="mt-3 max-h-56 overflow-auto rounded-2xl ring-1 ring-poopay-pill bg-white">
                  {(searchCategory ? filteredCategories : categories).map(
                    (item) => {
                      const selected = data.categoryId === item.id;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => {
                            update("categoryId", item.id);
                            setSearchCategory(item.name);
                          }}
                          className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition ${
                            selected
                              ? "bg-poopay-active/10 text-poopay-text font-semibold"
                              : "hover:bg-poopay-active/5 text-poopay-text"
                          }`}
                        >
                          {item.name}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-poopay-active mb-2">
                  Salaire mensuel NET (€)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 1850"
                  disabled={isLoading}
                  value={data.monthlySalary}
                  onChange={(e) =>
                    update("monthlySalary", e.target.value.replace(",", "."))
                  }
                  className="w-full rounded-3xl bg-white text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition"
                />
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-poopay-active mb-2">
                  Heures mensuelles
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 151"
                  disabled={isLoading}
                  value={data.monthlyHours}
                  onChange={(e) =>
                    update("monthlyHours", e.target.value.replace(",", "."))
                  }
                  className="w-full rounded-3xl bg-white text-poopay-text placeholder:text-poopay-mute/80 px-4 py-3 outline-none ring-1 ring-poopay-pill focus:ring-2 focus:ring-poopay-active transition"
                />
              </div>

              <div className="bg-poopay-active/10 border border-poopay-active/30 rounded-2xl p-4 text-sm text-poopay-text">
                💡 <span className="font-semibold">Astuce :</span> tu trouves
                ces infos sur ta fiche de paie. 35h/sem ≈ 151h/mois. Exemple : 1
                850€ net pour 151h.
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-5">
              <section className="bg-white rounded-2xl ring-1 ring-poopay-pill p-4">
                <h3 className="font-semibold text-poopay-text mb-2">
                  ⚠️ Disclaimer Santé
                </h3>
                <p className="text-sm text-poopay-text/80">
                  POOPAY est une appli ludique de gestion financière. Elle ne
                  fournit pas de conseils médicaux. En cas de douleurs ou
                  symptômes, consulte un professionnel de santé. L’app ne
                  remplace pas un avis médical.
                </p>
                <label className="mt-3 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-poopay-active"
                    checked={data.acceptedHealth}
                    onChange={(e) => update("acceptedHealth", e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-poopay-text">
                    J’ai lu et j’accepte le disclaimer santé
                  </span>
                </label>
              </section>

              <section className="bg-white rounded-2xl ring-1 ring-poopay-pill p-4">
                <h3 className="font-semibold text-poopay-text mb-2">
                  📋 Conditions d’utilisation
                </h3>
                <p className="text-sm text-poopay-text/80">
                  En créant un compte, tu t’engages à fournir des infos exactes,
                  à utiliser l’app de manière responsable et à respecter la vie
                  privée des autres. Tes données sont traitées selon notre
                  politique de confidentialité.
                </p>
                <label className="mt-3 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-poopay-active"
                    checked={data.acceptedTerms}
                    onChange={(e) => update("acceptedTerms", e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-poopay-text">
                    J’accepte les conditions d’utilisation
                  </span>
                </label>
              </section>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={back}
              className="flex-1 rounded-3xl px-5 py-3 font-semibold text-poopay-text bg-white ring-1 ring-poopay-pill hover:bg-poopay-active/5 transition"
              disabled={isLoading}
            >
              {step === 1 ? "Annuler" : "Retour"}
            </button>

            <button
              type="button"
              onClick={next}
              disabled={isLoading}
              className={`flex-1 rounded-3xl px-5 py-3 font-semibold text-white shadow-soft transition
                ${
                  isLoading
                    ? "bg-poopay-active/70"
                    : "bg-poopay-active hover:opacity-95"
                }`}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <Hourglass className="animate-pulse" size={18} />
                  Chargement…
                </span>
              ) : step === 5 ? (
                "Créer mon compte"
              ) : (
                "Suivant"
              )}
            </button>
          </div>

          <div className="mt-5 text-center text-sm">
            <a
              href="/login"
              className="text-poopay-text/90 hover:opacity-80 underline"
            >
              Déjà un compte ? Se connecter
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs italic text-poopay-mute">
          Prêt(e) à devenir un(e) expert(e) du transit ?
        </p>
      </div>
    </div>
  );
}
