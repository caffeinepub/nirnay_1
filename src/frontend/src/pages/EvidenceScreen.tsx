import type { EvidenceRecord } from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddEvidence,
  useDeleteEvidence,
  useEvidenceRecords,
} from "@/hooks/useQueries";
import {
  FileText,
  FolderOpen,
  Loader2,
  MapPin,
  Mic,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const INCIDENT_TYPES = [
  { value: "audio", label: "Audio Recording", icon: Mic },
  { value: "video", label: "Video Recording", icon: Video },
  { value: "note", label: "Written Note", icon: FileText },
  { value: "location", label: "Location Record", icon: MapPin },
];

function getTypeConfig(type: string) {
  return INCIDENT_TYPES.find((t) => t.value === type) ?? INCIDENT_TYPES[2];
}

function formatTimestamp(ts: bigint): string {
  try {
    return new Date(Number(ts / 1_000_000n)).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown date";
  }
}

const typeColors: Record<string, string> = {
  audio: "bg-info/20 text-info border-info/30",
  video: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  note: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  location: "bg-safe/20 text-safe border-safe/30",
};

const ocidKeys = [
  "evidence.item.1",
  "evidence.item.2",
  "evidence.item.3",
] as const;

function EvidenceCard({
  record,
  index,
  onDelete,
}: {
  record: EvidenceRecord;
  index: number;
  onDelete: () => void;
}) {
  const typeConf = getTypeConfig(record.incidentType);
  const Icon = typeConf?.icon ?? FileText;
  const colorClass =
    typeColors[record.incidentType] ?? "bg-muted/20 text-muted-foreground";
  const ocid = ocidKeys[index] ?? `evidence.item.${index + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-lg px-4 py-3 card-hover"
      data-ocid={ocid}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClass}`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-foreground text-sm truncate leading-snug">
              {record.description}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 -mt-0.5"
              aria-label="Delete evidence record"
              data-ocid={`evidence.delete_button.${index + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {record.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {record.notes}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className={`text-xs ${colorClass} border`}>
              {typeConf?.label ?? record.incidentType}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(record.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function EvidenceScreen() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EvidenceRecord | null>(null);
  const [incidentType, setIncidentType] = useState("note");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const { data: records, isLoading } = useEvidenceRecords();
  const addEvidence = useAddEvidence();
  const deleteEvidence = useDeleteEvidence();

  const handleAdd = () => {
    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }
    addEvidence.mutate(
      {
        incidentType,
        description: description.trim(),
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Evidence record saved");
          setIncidentType("note");
          setDescription("");
          setNotes("");
          setDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to save evidence record");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteEvidence.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Evidence record deleted");
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Failed to delete record");
        setDeleteTarget(null);
      },
    });
  };

  const sorted = [...(records ?? [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <div className="flex flex-col flex-1 px-4 py-6 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            Evidence Records
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Encrypted incident documentation
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          size="icon"
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-emergency"
          aria-label="Add evidence record"
          data-ocid="evidence.add_button"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center flex-1 gap-4 py-16 text-center"
          data-ocid="evidence.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              No evidence recorded
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Document incidents with audio, video, notes, or location records.
              All records are encrypted.
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            variant="outline"
            className="gap-2 border-primary/40 text-primary"
            data-ocid="evidence.add_button"
          >
            <Plus className="w-4 h-4" />
            Add First Record
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col gap-3">
            {sorted.map((record, i) => (
              <EvidenceCard
                key={record.id.toString()}
                record={record}
                index={i}
                onDelete={() => setDeleteTarget(record)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Count */}
      {sorted.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {sorted.length} record{sorted.length !== 1 ? "s" : ""} stored securely
        </p>
      )}

      {/* Add Evidence Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-popover border-border max-w-sm mx-auto w-[calc(100vw-2rem)]"
          data-ocid="evidence.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Document Incident
            </DialogTitle>
            <DialogDescription className="text-sm">
              Record evidence securely. All records are encrypted on-chain.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Type of Evidence</Label>
              <Select value={incidentType} onValueChange={setIncidentType}>
                <SelectTrigger className="w-full" data-ocid="evidence.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {t.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ev-description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ev-description"
                placeholder="Brief description of the incident"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-ocid="evidence.input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ev-notes" className="text-sm font-medium">
                Additional Notes{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="ev-notes"
                placeholder="Any additional details, witness info, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
                data-ocid="evidence.textarea"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 mt-2">
            <Button
              onClick={handleAdd}
              disabled={addEvidence.isPending || !description.trim()}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              data-ocid="evidence.submit_button"
            >
              {addEvidence.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {addEvidence.isPending ? "Saving…" : "Save Record"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDialogOpen(false);
                setDescription("");
                setNotes("");
                setIncidentType("note");
              }}
              className="w-full text-muted-foreground"
              data-ocid="evidence.cancel_button"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="bg-popover border-border max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This evidence record will be permanently deleted. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border"
              data-ocid="evidence.cancel_button"
            >
              Keep
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="evidence.delete_button.1"
            >
              {deleteEvidence.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
