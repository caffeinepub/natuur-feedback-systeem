import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Download,
  FileText,
  Filter,
  Key,
  Leaf,
  List,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  TreePine,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type {
  Activity,
  ContextExample,
  FeedbackEntry,
  Question,
} from "../backend.d";
import { useAdminSession } from "../hooks/useAdminSession";
import {
  useAddActivity,
  useAddContextExample,
  useAddQuestion,
  useAdminLogout,
  useAllActivities,
  useAllContextExamples,
  useAllFeedback,
  useAllQuestions,
  useChangeAdminPassword,
  useDeleteActivity,
  useDeleteContextExample,
  useDeleteQuestion,
  useSeedInitialData,
  useUpdateActivity,
  useUpdateContextExample,
  useUpdateQuestion,
} from "../hooks/useQueries";

const SCHOOLS = ["Klavertje Vier", "Droomboom", "Leidstar"];
const CLASSES = [
  "Kleuters",
  "1ste leerjaar",
  "2de leerjaar",
  "3de leerjaar",
  "4de leerjaar",
];

const CHART_COLORS = [
  "oklch(0.38 0.10 145)", // forest green
  "oklch(0.70 0.12 55)", // autumn brown
  "oklch(0.78 0.14 85)", // golden yellow
  "oklch(0.55 0.10 165)", // moss green
  "oklch(0.65 0.15 35)", // rust orange
];

const QUESTION_LABELS = [
  "Pedagogische aansluiting",
  "Interactie & Methodiek",
  "Zintuiglijke Beleving",
  "Kennisoverdracht",
];

function formatDate(tsBigint: bigint) {
  const ms = Number(tsBigint) / 1_000_000;
  return new Date(ms).toLocaleDateString("nl-BE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getScores(entry: FeedbackEntry) {
  return [
    Number(entry.pedagogicalAlignment),
    Number(entry.interactionMethod),
    Number(entry.sensoryExperience),
    Number(entry.knowledgeTransfer),
  ];
}

// ── Statistics Tab ────────────────────────────────────────────────────────────

function StatisticsTab({ feedback }: { feedback: FeedbackEntry[] }) {
  const barData = SCHOOLS.map((school) => {
    const entries = feedback.filter((f) => f.school === school);
    if (entries.length === 0)
      return {
        school,
        ...Object.fromEntries(QUESTION_LABELS.map((q) => [q, 0])),
      };
    const avg = (key: keyof FeedbackEntry) =>
      entries.reduce((sum, e) => sum + Number(e[key] as bigint), 0) /
      entries.length;
    return {
      school: school === "Klavertje Vier" ? "Klavertje\nVier" : school,
      [QUESTION_LABELS[0]]: Number.parseFloat(
        avg("pedagogicalAlignment").toFixed(2),
      ),
      [QUESTION_LABELS[1]]: Number.parseFloat(
        avg("interactionMethod").toFixed(2),
      ),
      [QUESTION_LABELS[2]]: Number.parseFloat(
        avg("sensoryExperience").toFixed(2),
      ),
      [QUESTION_LABELS[3]]: Number.parseFloat(
        avg("knowledgeTransfer").toFixed(2),
      ),
    };
  });

  const pieDatas = (
    [
      "pedagogicalAlignment",
      "interactionMethod",
      "sensoryExperience",
      "knowledgeTransfer",
    ] as const
  ).map((key, i) => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const f of feedback) {
      const v = Number(f[key]);
      if (v >= 1 && v <= 5) counts[v]++;
    }
    const total = feedback.length || 1;
    return {
      label: QUESTION_LABELS[i],
      data: Object.entries(counts).map(([star, count]) => ({
        name: `${star} ster${Number(star) > 1 ? "ren" : ""}`,
        value: Number.parseFloat(((count / total) * 100).toFixed(1)),
        count,
      })),
    };
  });

  if (feedback.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Nog geen feedback beschikbaar voor statistieken.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="nature-card p-6">
        <h3 className="font-display text-lg font-semibold mb-1">
          Gemiddelde scores per school
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Vergelijking van de 4 beoordelingscriteria
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={barData}
            margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.84 0.04 75)" />
            <XAxis dataKey="school" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.985 0.012 80)",
                border: "1px solid oklch(0.84 0.04 75)",
                borderRadius: "8px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            {QUESTION_LABELS.map((label, i) => (
              <Bar
                key={label}
                dataKey={label}
                fill={CHART_COLORS[i]}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pieDatas.map((pieInfo) => (
          <div key={pieInfo.label} className="nature-card p-5">
            <h4 className="font-semibold text-sm mb-4">{pieInfo.label}</h4>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie
                    data={pieInfo.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    dataKey="value"
                    strokeWidth={1}
                  >
                    {pieInfo.data.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          CHART_COLORS[
                            pieInfo.data.indexOf(entry) % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v}%`]}
                    contentStyle={{
                      background: "oklch(0.985 0.012 80)",
                      border: "1px solid oklch(0.84 0.04 75)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1">
                {pieInfo.data.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          CHART_COLORS[
                            pieInfo.data.indexOf(d) % CHART_COLORS.length
                          ],
                      }}
                    />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-medium">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feedback Overview Tab ─────────────────────────────────────────────────────

function FeedbackTab({ token }: { token: string }) {
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const allFeedbackQuery = useAllFeedback(token);

  const filteredFeedback = (() => {
    let data = allFeedbackQuery.data ?? [];
    if (schoolFilter && schoolFilter !== "all") {
      data = data.filter((f) => f.school === schoolFilter);
    }
    if (dateFrom) {
      const fromMs = new Date(dateFrom).getTime();
      data = data.filter((f) => Number(f.timestamp) / 1_000_000 >= fromMs);
    }
    if (dateTo) {
      const toMs = new Date(dateTo).getTime() + 86400000;
      data = data.filter((f) => Number(f.timestamp) / 1_000_000 <= toMs);
    }
    return data;
  })();

  const exportCSV = () => {
    const headers = [
      "School",
      "Klas",
      "Pedagogische aansluiting",
      "Interactie & Methodiek",
      "Zintuiglijke Beleving",
      "Kennisoverdracht",
      "Impact-moment",
      "Milieuzorg op school",
      "Extra opmerkingen",
      "Datum",
    ];
    const rows = filteredFeedback.map((f) => [
      `"${f.school}"`,
      `"${f.targetClass}"`,
      Number(f.pedagogicalAlignment),
      Number(f.interactionMethod),
      Number(f.sensoryExperience),
      Number(f.knowledgeTransfer),
      `"${f.impactMoment.replace(/"/g, '""')}"`,
      `"${f.environmentalContribution.replace(/"/g, '""')}"`,
      `"${f.additionalComments.replace(/"/g, '""')}"`,
      formatDate(f.timestamp),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `natuur-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV gedownload voor subsidiedossier!");
  };

  return (
    <div className="space-y-5">
      <div className="nature-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-forest" />
          <span className="font-semibold">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">School</Label>
            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger data-ocid="admin.school_select">
                <SelectValue placeholder="Alle scholen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle scholen</SelectItem>
                {SCHOOLS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Datum van</Label>
            <Input
              data-ocid="admin.date_from_input"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Datum tot</Label>
            <Input
              data-ocid="admin.date_to_input"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border-border bg-background"
            />
          </div>
        </div>
      </div>

      <Button
        data-ocid="admin.export_button"
        onClick={exportCSV}
        size="lg"
        className="w-full bg-[oklch(0.45_0.10_55)] text-primary-foreground hover:bg-[oklch(0.45_0.10_55_/_0.9)] text-base font-semibold rounded-xl shadow-nature py-6"
      >
        <Download className="mr-2 h-5 w-5" />
        Data downloaden voor subsidiedossier
        <span className="ml-2 text-xs opacity-70">
          ({filteredFeedback.length}{" "}
          {filteredFeedback.length === 1 ? "item" : "items"})
        </span>
      </Button>

      {allFeedbackQuery.isLoading ? (
        <div
          data-ocid="admin.loading_state"
          className="flex justify-center py-10"
        >
          <Loader2 className="w-6 h-6 animate-spin text-forest" />
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div
          data-ocid="admin.empty_state"
          className="text-center py-12 text-muted-foreground nature-card"
        >
          <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Geen feedback gevonden met de huidige filters.</p>
        </div>
      ) : (
        <div className="nature-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table data-ocid="admin.table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>School</TableHead>
                  <TableHead>Klas</TableHead>
                  <TableHead className="text-center">Ped.</TableHead>
                  <TableHead className="text-center">Int.</TableHead>
                  <TableHead className="text-center">Zint.</TableHead>
                  <TableHead className="text-center">Ken.</TableHead>
                  <TableHead>Impact-moment</TableHead>
                  <TableHead>Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((entry, i) => (
                  <TableRow
                    key={entry.id.toString()}
                    data-ocid={`admin.feedback.row.${i + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {entry.school}
                    </TableCell>
                    <TableCell>{entry.targetClass}</TableCell>
                    {getScores(entry).map((score, j) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: score columns have fixed order
                      <TableCell key={j} className="text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[oklch(0.38_0.10_145_/_0.12)] text-forest text-xs font-bold">
                          {score}
                        </span>
                      </TableCell>
                    ))}
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {entry.impactMoment || "—"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(entry.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Questions Management Tab ───────────────────────────────────────────────────

function QuestionsTab({ token }: { token: string }) {
  const { data: questions, isLoading: qLoading } = useAllQuestions();
  const { data: examples, isLoading: exLoading } = useAllContextExamples();

  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const addExample = useAddContextExample();
  const updateExample = useUpdateContextExample();
  const deleteExample = useDeleteContextExample();

  const [editingQ, setEditingQ] = useState<{
    id: bigint;
    title: string;
    description: string;
  } | null>(null);
  const [newQ, setNewQ] = useState({ title: "", description: "" });
  const [showNewQ, setShowNewQ] = useState(false);

  const [editingEx, setEditingEx] = useState<{
    id: bigint;
    school: string;
    targetClass: string;
    exampleText: string;
  } | null>(null);
  const [newEx, setNewEx] = useState({
    school: "",
    targetClass: "",
    exampleText: "",
  });
  const [showNewEx, setShowNewEx] = useState(false);

  const handleSaveQuestion = async () => {
    if (!editingQ) return;
    try {
      await updateQuestion.mutateAsync({
        token,
        id: editingQ.id,
        title: editingQ.title,
        description: editingQ.description,
      });
      setEditingQ(null);
      toast.success("Vraag bijgewerkt.");
    } catch {
      toast.error("Fout bij bijwerken.");
    }
  };

  const handleDeleteQuestion = async (id: bigint) => {
    if (!confirm("Bent u zeker dat u deze vraag wilt verwijderen?")) return;
    try {
      await deleteQuestion.mutateAsync({ token, id });
      toast.success("Vraag verwijderd.");
    } catch {
      toast.error("Fout bij verwijderen.");
    }
  };

  const handleAddQuestion = async () => {
    if (!newQ.title.trim()) {
      toast.error("Voer een titel in.");
      return;
    }
    try {
      await addQuestion.mutateAsync({ token, ...newQ });
      setNewQ({ title: "", description: "" });
      setShowNewQ(false);
      toast.success("Vraag toegevoegd.");
    } catch {
      toast.error("Fout bij toevoegen.");
    }
  };

  const handleSaveExample = async () => {
    if (!editingEx) return;
    try {
      await updateExample.mutateAsync({ token, ...editingEx });
      setEditingEx(null);
      toast.success("Voorbeeld bijgewerkt.");
    } catch {
      toast.error("Fout bij bijwerken.");
    }
  };

  const handleDeleteExample = async (id: bigint) => {
    if (!confirm("Bent u zeker dat u dit voorbeeld wilt verwijderen?")) return;
    try {
      await deleteExample.mutateAsync({ token, id });
      toast.success("Voorbeeld verwijderd.");
    } catch {
      toast.error("Fout bij verwijderen.");
    }
  };

  const handleAddExample = async () => {
    if (!newEx.school || !newEx.targetClass || !newEx.exampleText.trim()) {
      toast.error("Vul alle velden in.");
      return;
    }
    try {
      await addExample.mutateAsync({ token, ...newEx });
      setNewEx({ school: "", targetClass: "", exampleText: "" });
      setShowNewEx(false);
      toast.success("Voorbeeld toegevoegd.");
    } catch {
      toast.error("Fout bij toevoegen.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Questions section */}
      <div className="nature-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold">Vragenlijst</h3>
          <Button
            data-ocid="admin.add_question_button"
            onClick={() => setShowNewQ(!showNewQ)}
            size="sm"
            className="bg-forest text-primary-foreground hover:bg-forest/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nieuwe vraag
          </Button>
        </div>

        {showNewQ && (
          <div className="mb-5 p-4 rounded-xl bg-[oklch(0.38_0.10_145_/_0.06)] border border-[oklch(0.38_0.10_145_/_0.20)] space-y-3">
            <Input
              placeholder="Titel van de vraag"
              value={newQ.title}
              onChange={(e) =>
                setNewQ((p) => ({ ...p, title: e.target.value }))
              }
              className="border-border bg-background"
            />
            <Textarea
              placeholder="Beschrijving / toelichting"
              value={newQ.description}
              onChange={(e) =>
                setNewQ((p) => ({ ...p, description: e.target.value }))
              }
              rows={2}
              className="resize-none border-border bg-background"
            />
            <div className="flex gap-2">
              <Button
                data-ocid="admin.question.save_button"
                onClick={handleAddQuestion}
                size="sm"
                disabled={addQuestion.isPending}
                className="bg-forest text-primary-foreground hover:bg-forest/90"
              >
                {addQuestion.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                Opslaan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewQ(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Annuleer
              </Button>
            </div>
          </div>
        )}

        {qLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-forest" />
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q: Question, i: number) => (
              <div
                key={q.id.toString()}
                data-ocid={`admin.question.item.${i + 1}`}
                className="p-4 rounded-xl border border-border bg-background"
              >
                {editingQ?.id === q.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editingQ.title}
                      onChange={(e) =>
                        setEditingQ((p) => p && { ...p, title: e.target.value })
                      }
                      className="border-border"
                    />
                    <Textarea
                      value={editingQ.description}
                      onChange={(e) =>
                        setEditingQ(
                          (p) => p && { ...p, description: e.target.value },
                        )
                      }
                      rows={2}
                      className="resize-none border-border"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveQuestion}
                        disabled={updateQuestion.isPending}
                        className="bg-forest text-primary-foreground hover:bg-forest/90"
                      >
                        {updateQuestion.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        Opslaan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingQ(null)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Annuleer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{q.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {q.description}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        data-ocid={`admin.question.edit_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingQ({
                            id: q.id,
                            title: q.title,
                            description: q.description,
                          })
                        }
                        className="h-8 w-8 p-0 hover:text-forest"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        data-ocid={`admin.question.delete_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="h-8 w-8 p-0 hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Geen vragen gevonden.
          </p>
        )}
      </div>

      {/* Context examples section */}
      <div className="nature-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold">
            Context-voorbeelden
          </h3>
          <Button
            data-ocid="admin.add_example_button"
            onClick={() => setShowNewEx(!showNewEx)}
            size="sm"
            className="bg-forest text-primary-foreground hover:bg-forest/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nieuw voorbeeld
          </Button>
        </div>

        {showNewEx && (
          <div className="mb-5 p-4 rounded-xl bg-[oklch(0.38_0.10_145_/_0.06)] border border-[oklch(0.38_0.10_145_/_0.20)] space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">School</Label>
                <Select
                  value={newEx.school}
                  onValueChange={(v) => setNewEx((p) => ({ ...p, school: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="School..." />
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
              <div>
                <Label className="text-xs">Klas</Label>
                <Select
                  value={newEx.targetClass}
                  onValueChange={(v) =>
                    setNewEx((p) => ({ ...p, targetClass: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Klas..." />
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
            <Textarea
              placeholder="Voorbeeld tekst (bv. de herfstbingo)"
              value={newEx.exampleText}
              onChange={(e) =>
                setNewEx((p) => ({ ...p, exampleText: e.target.value }))
              }
              rows={2}
              className="resize-none border-border bg-background"
            />
            <div className="flex gap-2">
              <Button
                data-ocid="admin.example.save_button"
                onClick={handleAddExample}
                size="sm"
                disabled={addExample.isPending}
                className="bg-forest text-primary-foreground hover:bg-forest/90"
              >
                {addExample.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                Opslaan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewEx(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Annuleer
              </Button>
            </div>
          </div>
        )}

        {exLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-forest" />
          </div>
        ) : examples && examples.length > 0 ? (
          <div className="space-y-3">
            {examples.map((ex: ContextExample, i: number) => (
              <div
                key={ex.id.toString()}
                data-ocid={`admin.example.item.${i + 1}`}
                className="p-4 rounded-xl border border-border bg-background"
              >
                {editingEx?.id === ex.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={editingEx.school}
                        onValueChange={(v) =>
                          setEditingEx((p) => p && { ...p, school: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCHOOLS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={editingEx.targetClass}
                        onValueChange={(v) =>
                          setEditingEx((p) => p && { ...p, targetClass: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                    <Textarea
                      value={editingEx.exampleText}
                      onChange={(e) =>
                        setEditingEx(
                          (p) => p && { ...p, exampleText: e.target.value },
                        )
                      }
                      rows={2}
                      className="resize-none border-border"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveExample}
                        disabled={updateExample.isPending}
                        className="bg-forest text-primary-foreground hover:bg-forest/90"
                      >
                        {updateExample.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        Opslaan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingEx(null)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Annuleer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium bg-[oklch(0.38_0.10_145_/_0.10)] text-forest px-2 py-0.5 rounded-full">
                          {ex.school}
                        </span>
                        <span className="text-xs font-medium bg-[oklch(0.70_0.12_55_/_0.10)] text-autumn px-2 py-0.5 rounded-full">
                          {ex.targetClass}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {ex.exampleText}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        data-ocid={`admin.example.edit_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingEx({
                            id: ex.id,
                            school: ex.school,
                            targetClass: ex.targetClass,
                            exampleText: ex.exampleText,
                          })
                        }
                        className="h-8 w-8 p-0 hover:text-forest"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        data-ocid={`admin.example.delete_button.${i + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExample(ex.id)}
                        className="h-8 w-8 p-0 hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Geen voorbeelden gevonden.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Activities Tab ────────────────────────────────────────────────────────────

function ActivitiesTab({ token }: { token: string }) {
  const { data: activities, isLoading: actLoading } = useAllActivities();

  const addActivity = useAddActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  const [editingAct, setEditingAct] = useState<{
    id: bigint;
    school: string;
    targetClass: string;
    name: string;
    description: string;
  } | null>(null);
  const [newAct, setNewAct] = useState({
    school: "",
    targetClass: "",
    name: "",
    description: "",
  });
  const [showNewAct, setShowNewAct] = useState(false);

  const handleAddActivity = async () => {
    if (!newAct.school || !newAct.targetClass || !newAct.name.trim()) {
      toast.error("Vul school, klas en naam in.");
      return;
    }
    try {
      await addActivity.mutateAsync({ token, ...newAct });
      setNewAct({ school: "", targetClass: "", name: "", description: "" });
      setShowNewAct(false);
      toast.success("Activiteit toegevoegd.");
    } catch {
      toast.error("Fout bij toevoegen.");
    }
  };

  const handleSaveActivity = async () => {
    if (!editingAct) return;
    try {
      await updateActivity.mutateAsync({ token, ...editingAct });
      setEditingAct(null);
      toast.success("Activiteit bijgewerkt.");
    } catch {
      toast.error("Fout bij bijwerken.");
    }
  };

  const handleDeleteActivity = async (id: bigint) => {
    if (!confirm("Bent u zeker dat u deze activiteit wilt verwijderen?"))
      return;
    try {
      await deleteActivity.mutateAsync({ token, id });
      toast.success("Activiteit verwijderd.");
    } catch {
      toast.error("Fout bij verwijderen.");
    }
  };

  return (
    <div className="nature-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-lg font-semibold">
            Activiteiten Beheer
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Beheer de activiteiten die als geheugensteuntje worden getoond aan
            leerkrachten.
          </p>
        </div>
        <Button
          data-ocid="admin.add_activity_button"
          onClick={() => setShowNewAct(!showNewAct)}
          size="sm"
          className="bg-forest text-primary-foreground hover:bg-forest/90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nieuwe activiteit
        </Button>
      </div>

      {showNewAct && (
        <div className="mb-5 p-4 rounded-xl bg-[oklch(0.38_0.10_145_/_0.06)] border border-[oklch(0.38_0.10_145_/_0.20)] space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">School</Label>
              <Select
                value={newAct.school}
                onValueChange={(v) => setNewAct((p) => ({ ...p, school: v }))}
              >
                <SelectTrigger
                  data-ocid="admin.activity.school_select"
                  className="mt-1"
                >
                  <SelectValue placeholder="School..." />
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
            <div>
              <Label className="text-xs">Klas</Label>
              <Select
                value={newAct.targetClass}
                onValueChange={(v) =>
                  setNewAct((p) => ({ ...p, targetClass: v }))
                }
              >
                <SelectTrigger
                  data-ocid="admin.activity.class_select"
                  className="mt-1"
                >
                  <SelectValue placeholder="Klas..." />
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
          <Input
            data-ocid="admin.activity.name_input"
            placeholder="Naam van de activiteit (bv. Herfstbingo)"
            value={newAct.name}
            onChange={(e) => setNewAct((p) => ({ ...p, name: e.target.value }))}
            className="border-border bg-background"
          />
          <Textarea
            data-ocid="admin.activity.description_textarea"
            placeholder="Korte beschrijving (optioneel)"
            value={newAct.description}
            onChange={(e) =>
              setNewAct((p) => ({ ...p, description: e.target.value }))
            }
            rows={2}
            className="resize-none border-border bg-background"
          />
          <div className="flex gap-2">
            <Button
              data-ocid="admin.activity.save_button"
              onClick={handleAddActivity}
              size="sm"
              disabled={addActivity.isPending}
              className="bg-forest text-primary-foreground hover:bg-forest/90"
            >
              {addActivity.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Opslaan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewAct(false)}
            >
              <X className="w-4 h-4 mr-1" />
              Annuleer
            </Button>
          </div>
        </div>
      )}

      {actLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-forest" />
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((act: Activity, i: number) => (
            <div
              key={act.id.toString()}
              data-ocid={`admin.activity.item.${i + 1}`}
              className="p-4 rounded-xl border border-border bg-background"
            >
              {editingAct?.id === act.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={editingAct.school}
                      onValueChange={(v) =>
                        setEditingAct((p) => p && { ...p, school: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOLS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={editingAct.targetClass}
                      onValueChange={(v) =>
                        setEditingAct((p) => p && { ...p, targetClass: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  <Input
                    value={editingAct.name}
                    onChange={(e) =>
                      setEditingAct((p) => p && { ...p, name: e.target.value })
                    }
                    placeholder="Naam"
                    className="border-border"
                  />
                  <Textarea
                    value={editingAct.description}
                    onChange={(e) =>
                      setEditingAct(
                        (p) => p && { ...p, description: e.target.value },
                      )
                    }
                    rows={2}
                    placeholder="Beschrijving"
                    className="resize-none border-border"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveActivity}
                      disabled={updateActivity.isPending}
                      className="bg-forest text-primary-foreground hover:bg-forest/90"
                    >
                      {updateActivity.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      Opslaan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAct(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Annuleer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-[oklch(0.38_0.10_145_/_0.10)] text-forest px-2 py-0.5 rounded-full">
                        {act.school}
                      </span>
                      <span className="text-xs font-medium bg-[oklch(0.70_0.12_55_/_0.10)] text-autumn px-2 py-0.5 rounded-full">
                        {act.targetClass}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">{act.name}</p>
                    {act.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {act.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      data-ocid={`admin.activity.edit_button.${i + 1}`}
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingAct({
                          id: act.id,
                          school: act.school,
                          targetClass: act.targetClass,
                          name: act.name,
                          description: act.description,
                        })
                      }
                      className="h-8 w-8 p-0 hover:text-forest"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      data-ocid={`admin.activity.delete_button.${i + 1}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteActivity(act.id)}
                      className="h-8 w-8 p-0 hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          data-ocid="admin.activity.empty_state"
          className="text-center py-10 text-muted-foreground"
        >
          <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Nog geen activiteiten. Voeg er een toe via de knop hierboven.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const seedMutation = useSeedInitialData();
  const changePasswordMutation = useChangeAdminPassword();

  // Password change form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSeed = async () => {
    if (
      !confirm(
        "Dit zal de initiële data opnieuw laden. Weet u zeker dat u wilt doorgaan?",
      )
    )
      return;
    try {
      await seedMutation.mutateAsync(token);
      toast.success("Initiële data succesvol geladen!");
    } catch {
      toast.error("Fout bij laden van initiële data.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (!newUsername.trim()) {
      setPwError("Voer een gebruikersnaam in.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Wachtwoorden komen niet overeen.");
      return;
    }

    try {
      const success = await changePasswordMutation.mutateAsync({
        token,
        newUsername,
        newPassword,
      });
      if (success) {
        setPwSuccess(true);
        setNewUsername("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Inloggegevens bijgewerkt.");
      } else {
        setPwError("Kon inloggegevens niet bijwerken. Controleer uw sessie.");
      }
    } catch {
      setPwError("Fout bij bijwerken van inloggegevens.");
    }
  };

  return (
    <div className="space-y-5 max-w-lg">
      {/* Change password */}
      <div className="nature-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-forest" />
          <h3 className="font-display text-base font-semibold">
            Inloggegevens wijzigen
          </h3>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Nieuwe gebruikersnaam</Label>
            <Input
              data-ocid="admin.new_username_input"
              type="text"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setPwError("");
              }}
              placeholder="Nieuwe gebruikersnaam"
              autoComplete="username"
              className="border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Nieuw wachtwoord</Label>
            <Input
              data-ocid="admin.new_password_input"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwError("");
              }}
              placeholder="Minimaal 8 tekens"
              autoComplete="new-password"
              className="border-border bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Bevestig wachtwoord</Label>
            <Input
              data-ocid="admin.confirm_password_input"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPwError("");
              }}
              placeholder="Herhaal wachtwoord"
              autoComplete="new-password"
              className="border-border bg-background"
            />
          </div>
          {pwError && (
            <p
              data-ocid="admin.password.error_state"
              className="text-sm text-destructive"
            >
              {pwError}
            </p>
          )}
          {pwSuccess && (
            <p
              data-ocid="admin.password.success_state"
              className="text-sm text-forest"
            >
              Inloggegevens succesvol bijgewerkt!
            </p>
          )}
          <Button
            data-ocid="admin.password.save_button"
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="bg-forest text-primary-foreground hover:bg-forest/90"
          >
            {changePasswordMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Opslaan
          </Button>
        </form>
      </div>

      {/* Seed data */}
      <div className="nature-card p-5">
        <h3 className="font-display text-base font-semibold mb-2">
          Initiële data laden
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Herlaad de standaard vragen en context-voorbeelden. Dit overschrijft
          bestaande data niet, maar vult eventueel ontbrekende data aan.
        </p>
        <Button
          data-ocid="admin.seed_button"
          onClick={handleSeed}
          disabled={seedMutation.isPending}
          variant="outline"
          className="border-forest text-forest hover:bg-[oklch(0.38_0.10_145_/_0.08)]"
        >
          {seedMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Initiële data laden
        </Button>
      </div>

      {/* Logout */}
      <div className="nature-card p-5">
        <h3 className="font-display text-base font-semibold mb-2">Uitloggen</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Keer terug naar het leerkrachtenportaal.
        </p>
        <Button
          data-ocid="admin.logout_button"
          onClick={onLogout}
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/5"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Uitloggen
        </Button>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, clearToken } = useAdminSession();
  const logoutMutation = useAdminLogout();

  const { data: allFeedback, isLoading: feedbackLoading } =
    useAllFeedback(token);
  const { data: questions, isLoading: questionsLoading } = useAllQuestions();
  const seedMutation = useSeedInitialData();
  const [seeded, setSeeded] = useState(false);

  // Redirect if no token
  useEffect(() => {
    if (token === null) {
      navigate({ to: "/admin/login" });
    }
  }, [token, navigate]);

  // Seed on first login if no questions
  useEffect(() => {
    if (
      token &&
      !seeded &&
      !questionsLoading &&
      questions &&
      questions.length === 0
    ) {
      setSeeded(true);
      seedMutation.mutateAsync(token).catch(() => {});
    }
  }, [questions, questionsLoading, seeded, seedMutation, token]);

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation.mutateAsync(token);
      } catch {
        // ignore logout errors
      }
    }
    clearToken();
    navigate({ to: "/" });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-forest" />
          <p>Omleiding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TreePine className="w-6 h-6 text-forest" />
              <span className="font-display text-xl font-semibold text-forest">
                Natuur-Feedback
              </span>
            </div>
            <span className="text-xs font-medium bg-[oklch(0.38_0.10_145_/_0.12)] text-forest px-2 py-0.5 rounded-full border border-[oklch(0.38_0.10_145_/_0.25)]">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              ← Portaal
            </Link>
            <Button
              data-ocid="admin.header_logout_button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-semibold text-foreground mb-1">
            Beheerderspaneel
          </h1>
          <p className="text-muted-foreground text-sm">
            {allFeedback
              ? `${allFeedback.length} feedback-reactie${allFeedback.length !== 1 ? "s" : ""} totaal`
              : "Laden..."}
          </p>
        </motion.div>

        <Tabs defaultValue="stats">
          <TabsList className="mb-6 bg-card border border-border p-1 rounded-xl h-auto">
            <TabsTrigger
              data-ocid="admin.stats_tab"
              value="stats"
              className="rounded-lg data-[state=active]:bg-forest data-[state=active]:text-primary-foreground gap-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistieken</span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.feedback_tab"
              value="feedback"
              className="rounded-lg data-[state=active]:bg-forest data-[state=active]:text-primary-foreground gap-1.5"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.questions_tab"
              value="questions"
              className="rounded-lg data-[state=active]:bg-forest data-[state=active]:text-primary-foreground gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Vragenlijst</span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.activities_tab"
              value="activities"
              className="rounded-lg data-[state=active]:bg-forest data-[state=active]:text-primary-foreground gap-1.5"
            >
              <Leaf className="w-4 h-4" />
              <span className="hidden sm:inline">Activiteiten</span>
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.settings_tab"
              value="settings"
              className="rounded-lg data-[state=active]:bg-forest data-[state=active]:text-primary-foreground gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Instellingen</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            {feedbackLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-forest" />
              </div>
            ) : (
              <StatisticsTab feedback={allFeedback ?? []} />
            )}
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackTab token={token} />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionsTab token={token} />
          </TabsContent>

          <TabsContent value="activities">
            <ActivitiesTab token={token} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab token={token} onLogout={handleLogout} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-10 text-center text-xs text-muted-foreground">
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
