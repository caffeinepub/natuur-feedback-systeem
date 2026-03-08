import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Leaf, Loader2, TreePine } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { StarRating } from "../components/StarRating";
import {
  useActivitiesBySchoolAndClass,
  useSubmitFeedback,
} from "../hooks/useQueries";

const SCHOOLS = ["Klavertje Vier", "Droomboom", "Leidstar"];
const CLASSES = [
  "Kleuters",
  "1ste leerjaar",
  "2de leerjaar",
  "3de leerjaar",
  "4de leerjaar",
];

const QUESTIONS = [
  {
    key: "pedagogicalAlignment" as const,
    title: "Pedagogische aansluiting",
    description:
      "Hoe goed sloot de animatie aan bij de leefwereld en het niveau van de leerlingen?",
  },
  {
    key: "interactionMethod" as const,
    title: "Interactie & Methodiek",
    description: "Was er een goede balans tussen observatie en actie?",
  },
  {
    key: "sensoryExperience" as const,
    title: "Zintuiglijke Beleving",
    description: "In welke mate werden de zintuigen geprikkeld?",
  },
  {
    key: "knowledgeTransfer" as const,
    title: "Kennisoverdracht",
    description:
      "Hoe effectief werd de natuurkennis (kringloop, biodiversiteit) overgebracht?",
  },
];

type Scores = {
  pedagogicalAlignment: number;
  interactionMethod: number;
  sensoryExperience: number;
  knowledgeTransfer: number;
};

export default function TeacherPortal() {
  const [school, setSchool] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [scores, setScores] = useState<Scores>({
    pedagogicalAlignment: 0,
    interactionMethod: 0,
    sensoryExperience: 0,
    knowledgeTransfer: 0,
  });
  const [impactMoment, setImpactMoment] = useState("");
  const [environmentalContribution, setEnvironmentalContribution] =
    useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: activities, isLoading: activitiesLoading } =
    useActivitiesBySchoolAndClass(school, targetClass);

  const submitMutation = useSubmitFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!school || !targetClass) {
      toast.error("Selecteer eerst een school en doelgroep.");
      return;
    }
    const scoreValues = Object.values(scores);
    if (scoreValues.some((v) => v === 0)) {
      toast.error("Geef voor alle vragen een beoordeling van 1-5 sterren.");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        school,
        targetClass,
        pedagogicalAlignment: BigInt(scores.pedagogicalAlignment),
        interactionMethod: BigInt(scores.interactionMethod),
        sensoryExperience: BigInt(scores.sensoryExperience),
        knowledgeTransfer: BigInt(scores.knowledgeTransfer),
        impactMoment,
        environmentalContribution,
        additionalComments,
      });
      setSubmitted(true);
    } catch {
      toast.error("Er ging iets mis bij het versturen. Probeer opnieuw.");
    }
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        data-ocid="teacher.success_state"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="nature-card max-w-lg w-full p-10 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[oklch(0.38_0.10_145_/_0.12)] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-forest" />
            </div>
          </div>
          <h2 className="font-display text-3xl font-semibold text-forest mb-3">
            Hartelijk dank!
          </h2>
          <p className="text-foreground/70 mb-2 text-base leading-relaxed">
            Uw feedback is succesvol verstuurd. Samen bouwen we aan een rijkere
            natuurbeleving voor elke leerling.
          </p>
          <p className="text-foreground/50 text-sm italic mb-8">
            "Elk kind dat de natuur leert kennen, draagt haar voort."
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setSchool("");
              setTargetClass("");
              setScores({
                pedagogicalAlignment: 0,
                interactionMethod: 0,
                sensoryExperience: 0,
                knowledgeTransfer: 0,
              });
              setImpactMoment("");
              setEnvironmentalContribution("");
              setAdditionalComments("");
            }}
            className="bg-forest text-primary-foreground hover:bg-forest/90"
          >
            Nieuw formulier invullen
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-forest" />
            <span className="font-display text-xl font-semibold text-forest">
              Natuur-Feedback
            </span>
          </div>
          <Link
            to="/admin/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(0.38_0.10_145_/_0.10)] text-forest text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            Leerkrachten Portaal
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4 leading-tight">
            Deel uw ervaring met de{" "}
            <span className="text-forest">natuuranimatie</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Uw feedback helpt ons de animaties nog beter af te stemmen op de
            leefwereld van uw leerlingen.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sectie 1: Selectie */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="nature-card p-6"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-forest text-primary-foreground text-sm flex items-center justify-center font-sans font-bold">
                1
              </span>
              Selectie
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-medium text-foreground/80">School</Label>
                <Select
                  value={school}
                  onValueChange={(v) => {
                    setSchool(v);
                    setTargetClass("");
                  }}
                >
                  <SelectTrigger
                    data-ocid="teacher.school_select"
                    className="border-border bg-background"
                  >
                    <SelectValue placeholder="Kies uw school..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOLS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-foreground/80">
                  Doelgroep
                </Label>
                <Select
                  value={targetClass}
                  onValueChange={setTargetClass}
                  disabled={!school}
                >
                  <SelectTrigger
                    data-ocid="teacher.class_select"
                    className="border-border bg-background"
                  >
                    <SelectValue placeholder="Kies de klas..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.section>

          {/* Sectie 2: Beoordeling (reminder + sterren + open vragen) */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="nature-card p-6"
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-forest text-primary-foreground text-sm flex items-center justify-center font-sans font-bold">
                2
              </span>
              Beoordeling van het traject
            </h2>

            {/* Activiteiten herinnering */}
            <AnimatePresence>
              {school && targetClass && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-7 overflow-hidden"
                >
                  <div
                    data-ocid="teacher.activities_list"
                    className="rounded-xl bg-[oklch(0.38_0.10_145_/_0.07)] border border-[oklch(0.38_0.10_145_/_0.20)] p-4"
                  >
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-forest mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-forest mb-2">
                          Ter herinnering: Dit hebben we dit jaar samen gedaan
                        </p>
                        <p className="text-xs text-forest/70 mb-3">
                          {school} — {targetClass}
                        </p>
                        {activitiesLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Activiteiten laden...
                          </div>
                        ) : activities && activities.length > 0 ? (
                          <ul className="space-y-1.5">
                            {activities.map((act) => (
                              <li
                                key={act.id.toString()}
                                className="flex items-start gap-2 text-sm text-foreground/75"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 flex-shrink-0" />
                                <span>
                                  <span className="font-medium text-foreground/85">
                                    {act.name}
                                  </span>
                                  {act.description && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      — {act.description}
                                    </span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Geen activiteiten gevonden voor deze combinatie.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sterren beoordeling */}
            <div className="mb-7">
              <p className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-4">
                Uw totaalbeoordeling
              </p>
              <div className="space-y-7">
                {QUESTIONS.map((q, idx) => (
                  <div
                    key={q.key}
                    data-ocid={`teacher.question.${idx + 1}`}
                    className="pb-6 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[oklch(0.38_0.10_145_/_0.12)] text-forest text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-foreground">{q.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 ml-7 leading-relaxed">
                      {q.description}
                    </p>
                    <div className="ml-7">
                      <StarRating
                        value={scores[q.key]}
                        onChange={(v) =>
                          setScores((prev) => ({ ...prev, [q.key]: v }))
                        }
                      />
                      {scores[q.key] > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {scores[q.key]} van 5 sterren
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open feedback */}
            <div>
              <p className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-4">
                Open feedback
              </p>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-medium text-foreground/80">
                    Impact-moment
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Beschrijf een specifiek impact-moment bij een leerling (bv.
                    een ontdekking in de bodem).
                  </p>
                  <Textarea
                    data-ocid="teacher.impact_textarea"
                    value={impactMoment}
                    onChange={(e) => setImpactMoment(e.target.value)}
                    placeholder="Vertel ons over een bijzonder moment..."
                    rows={3}
                    className="resize-none border-border bg-background focus:border-forest"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-foreground/80">
                    Milieuzorg op school
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Hoe draagt dit traject bij aan de milieuzorg op uw school?
                  </p>
                  <Textarea
                    data-ocid="teacher.environmental_textarea"
                    value={environmentalContribution}
                    onChange={(e) =>
                      setEnvironmentalContribution(e.target.value)
                    }
                    placeholder="Beschrijf de impact op het schoolklimaat..."
                    rows={3}
                    className="resize-none border-border bg-background focus:border-forest"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-foreground/80">
                    Extra opmerkingen
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Ruimte voor extra opmerkingen of quotes van leerlingen.
                  </p>
                  <Textarea
                    data-ocid="teacher.comments_textarea"
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="Mooie quotes, suggesties of andere gedachten..."
                    rows={3}
                    className="resize-none border-border bg-background focus:border-forest"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center pb-10"
          >
            <Button
              data-ocid="teacher.submit_button"
              type="submit"
              size="lg"
              disabled={submitMutation.isPending}
              className="bg-forest text-primary-foreground hover:bg-forest/90 px-10 py-3 text-base font-semibold rounded-xl shadow-nature transition-all hover:shadow-nature-lg"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Versturen...
                </>
              ) : (
                <>
                  <Leaf className="mr-2 h-4 w-4" />
                  Feedback versturen
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Gebouwd met{" "}
        <span className="text-autumn">♥</span> via{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
