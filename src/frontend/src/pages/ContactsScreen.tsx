import type { EmergencyContact } from "@/backend.d";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddContact,
  useContacts,
  useRemoveContact,
} from "@/hooks/useQueries";
import { Loader2, Phone, Plus, Trash2, User, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ocidKeys = [
  "contacts.item.1",
  "contacts.item.2",
  "contacts.item.3",
] as const;

function ContactCard({
  contact,
  index,
  onDelete,
}: {
  contact: EmergencyContact;
  index: number;
  onDelete: (id: bigint) => void;
}) {
  const initials = contact.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ocid = ocidKeys[index] ?? `contacts.item.${index + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 card-hover"
      data-ocid={ocid}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{contact.name}</p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Phone className="w-3 h-3" />
          <span className="text-xs">{contact.phoneNumber}</span>
        </div>
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(contact.id)}
        className="w-9 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
        aria-label={`Delete contact ${contact.name}`}
        data-ocid={`contacts.delete_button.${index + 1}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

export default function ContactsScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmergencyContact | null>(
    null,
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: contacts, isLoading } = useContacts();
  const addContact = useAddContact();
  const removeContact = useRemoveContact();

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in both name and phone number");
      return;
    }
    addContact.mutate(
      { name: name.trim(), phoneNumber: phone.trim() },
      {
        onSuccess: () => {
          toast.success(`${name} added to emergency contacts`);
          setName("");
          setPhone("");
          setSheetOpen(false);
        },
        onError: () => {
          toast.error("Failed to add contact. Please try again.");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeContact.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`${deleteTarget.name} removed`);
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Failed to remove contact");
        setDeleteTarget(null);
      },
    });
  };

  const sorted = [...(contacts ?? [])].reverse();

  return (
    <div className="flex flex-col flex-1 px-4 py-6 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">
            Emergency Contacts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Notified instantly when SOS is triggered
          </p>
        </div>
        <Button
          onClick={() => setSheetOpen(true)}
          size="icon"
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-emergency"
          aria-label="Add new contact"
          data-ocid="contacts.add_button"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center flex-1 gap-4 py-16 text-center"
          data-ocid="contacts.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              No emergency contacts
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Add trusted contacts to notify during an SOS emergency.
            </p>
          </div>
          <Button
            onClick={() => setSheetOpen(true)}
            variant="outline"
            className="gap-2 border-primary/40 text-primary"
            data-ocid="contacts.add_button"
          >
            <Plus className="w-4 h-4" />
            Add First Contact
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col gap-3">
            {sorted.map((contact, i) => (
              <ContactCard
                key={contact.id.toString()}
                contact={contact}
                index={i}
                onDelete={(id) =>
                  setDeleteTarget(contacts?.find((c) => c.id === id) ?? null)
                }
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Count info */}
      {sorted.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {sorted.length} contact{sorted.length !== 1 ? "s" : ""} in your safety
          network
        </p>
      )}

      {/* Add Contact Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl bg-popover border-border px-5 pb-8"
          data-ocid="contacts.sheet"
        >
          <SheetHeader className="mb-5">
            <SheetTitle className="font-display text-lg">
              Add Emergency Contact
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              This person will receive an alert when you trigger SOS.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contact-name"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  autoComplete="name"
                  onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
                  data-ocid="contacts.input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contact-phone"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  className="pl-10"
                  autoComplete="tel"
                  onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
                  data-ocid="contacts.input"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex-col gap-2">
            <Button
              onClick={handleAdd}
              disabled={addContact.isPending || !name.trim() || !phone.trim()}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              data-ocid="contacts.submit_button"
            >
              {addContact.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {addContact.isPending ? "Adding…" : "Save Contact"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSheetOpen(false);
                setName("");
                setPhone("");
              }}
              className="w-full text-muted-foreground"
              data-ocid="contacts.cancel_button"
            >
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="bg-popover border-border max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              from your emergency contacts? They will no longer be notified
              during an SOS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border"
              data-ocid="contacts.cancel_button"
            >
              Keep
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="contacts.delete_button.1"
            >
              {removeContact.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
