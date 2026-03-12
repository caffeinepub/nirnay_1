import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useUpdateDisplayName,
  useUpsertSettings,
  useUserProfile,
} from "@/hooks/useQueries";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
  LogOut,
  Save,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsScreen() {
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();

  const [displayName, setDisplayName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [pinVisible, setPinVisible] = useState(false);

  const updateName = useUpdateDisplayName();
  const upsertSettings = useUpsertSettings();

  // Populate from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setPinEnabled(profile.pinEnabled || false);
    }
  }, [profile]);

  const handleSaveName = () => {
    if (!displayName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    updateName.mutate(displayName.trim(), {
      onSuccess: () => {
        setNameSaved(true);
        toast.success("Display name updated");
        setTimeout(() => setNameSaved(false), 3000);
      },
      onError: () => {
        toast.error("Failed to update name");
      },
    });
  };

  const handlePinToggle = (enabled: boolean) => {
    if (enabled) {
      setPinEnabled(true);
      setShowPinInput(true);
    } else {
      setPinEnabled(false);
      setShowPinInput(false);
      setPin("");
      upsertSettings.mutate(
        {
          displayName: displayName.trim() || "User",
          pinEnabled: false,
          pinHash: "",
        },
        {
          onSuccess: () => toast.success("PIN lock disabled"),
          onError: () => toast.error("Failed to update settings"),
        },
      );
    }
  };

  const handleSavePin = () => {
    if (pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }
    upsertSettings.mutate(
      {
        displayName: displayName.trim() || "User",
        pinEnabled: true,
        pinHash: pin,
      },
      {
        onSuccess: () => {
          toast.success("PIN lock enabled");
          setShowPinInput(false);
          setPin("");
        },
        onError: () => {
          toast.error("Failed to save PIN");
        },
      },
    );
  };

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}…${principal.slice(-4)}`
    : "—";

  return (
    <div className="flex flex-col flex-1 px-4 py-6 gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">
          Settings
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your profile and security
        </p>
      </div>

      {/* Profile Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg overflow-hidden"
        data-ocid="settings.panel"
      >
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Profile
            </span>
          </div>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="display-name" className="text-sm font-medium">
              Display Name
            </Label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                data-ocid="settings.input"
              />
              <Button
                size="icon"
                onClick={handleSaveName}
                disabled={updateName.isPending}
                className={`w-10 h-10 flex-shrink-0 transition-colors ${
                  nameSaved
                    ? "bg-safe hover:bg-safe/90"
                    : "bg-primary hover:bg-primary/90"
                }`}
                data-ocid="settings.save_button"
              >
                {updateName.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                ) : nameSaved ? (
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Save className="w-4 h-4 text-primary-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground font-medium">
              Principal ID
            </p>
            <p className="text-xs font-mono text-foreground/70 bg-muted/30 rounded px-2 py-1">
              {shortPrincipal}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Security Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-card border border-border rounded-lg overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Security
            </span>
          </div>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">PIN Lock</p>
              <p className="text-xs text-muted-foreground">
                Require PIN to open the app
              </p>
            </div>
            <Switch
              checked={pinEnabled}
              onCheckedChange={handlePinToggle}
              data-ocid="settings.switch"
            />
          </div>

          {showPinInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-col gap-3 bg-muted/20 rounded-lg p-3"
            >
              <p className="text-sm font-medium text-foreground">
                Set 4-Digit PIN
              </p>
              <div className="flex items-center gap-2">
                <InputOTP
                  maxLength={4}
                  value={pin}
                  onChange={setPin}
                  type={pinVisible ? "text" : "password"}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPinVisible(!pinVisible)}
                  className="w-8 h-8 text-muted-foreground"
                >
                  {pinVisible ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSavePin}
                  disabled={pin.length !== 4 || upsertSettings.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-xs"
                  data-ocid="settings.save_button"
                >
                  {upsertSettings.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : null}
                  Enable PIN
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowPinInput(false);
                    setPinEnabled(false);
                    setPin("");
                  }}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="bg-card border border-border rounded-lg overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              About Nirnay
            </span>
          </div>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Nirnay</span>{" "}
            (meaning <em>decision</em> in Hindi) is a privacy-first personal
            safety and legal awareness assistant. Our mission is to help people
            make the right decision during danger — providing instant help,
            legal awareness, and privacy-respecting safety tools.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {[
              "One-tap emergency SOS",
              "Legal rights guide",
              "Evidence protection",
              "No data tracking",
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-1.5 text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Privacy Policy Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="bg-card border border-border rounded-lg overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Privacy Policy
            </span>
          </div>
        </div>
        <div className="px-4 py-4">
          <ul className="flex flex-col gap-2.5">
            {[
              "No continuous location tracking — location is only shared during active SOS.",
              "Your data is never sold to third parties or used for advertising.",
              "All sensitive records are encrypted before storage.",
              "You have full control — export or delete your data at any time.",
              "No data collection without explicit user action or consent.",
              "AI features (coming soon) will always require explicit user permission.",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-safe flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground leading-snug">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Logout */}
      <div className="pb-4">
        <Button
          variant="outline"
          onClick={clear}
          className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
