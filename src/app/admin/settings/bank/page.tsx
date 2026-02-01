"use client";

import * as React from "react";
import { Loader2, RefreshCw, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import http from "@/lib/http";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BankProvider = "INTER" | "FDBANK";

type BankSettings = {
  activeBankProvider: BankProvider;
  interEnabled: boolean;
  fdbankEnabled: boolean;
  updatedAt: string;
};

const BANK_LABELS: Record<BankProvider, string> = {
  INTER: "Inter Bank",
  FDBANK: "FDBank",
};

/** Sync the active bank to the Next.js server-side cache so the PIX proxy
 *  routes customer requests to the correct bank endpoint. */
async function syncBankCache(provider: string) {
  try {
    await fetch("/api/bank-provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
  } catch {
    // Non-critical – the proxy will lazily initialise from the backend.
  }
}

export default function BankSettingsPage() {
  const [settings, setSettings] = React.useState<BankSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [switching, setSwitching] = React.useState(false);
  const [togglingInter, setTogglingInter] = React.useState(false);
  const [togglingFdbank, setTogglingFdbank] = React.useState(false);

  const fetchSettings = React.useCallback(async () => {
    try {
      const res = await http.get<BankSettings>("/admin/settings/bank");
      setSettings(res.data);
      // Keep the server-side PIX proxy cache in sync.
      syncBankCache(res.data.activeBankProvider);
    } catch {
      toast.error("Failed to load bank settings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSwitchActive = async (provider: BankProvider) => {
    if (!settings || provider === settings.activeBankProvider) return;
    setSwitching(true);
    try {
      const res = await http.put<{
        message: string;
        activeBankProvider: BankProvider;
      }>("/admin/settings/bank/active", { provider });
      setSettings((prev) =>
        prev
          ? { ...prev, activeBankProvider: res.data.activeBankProvider }
          : prev
      );
      // Update the server-side PIX proxy cache immediately.
      syncBankCache(res.data.activeBankProvider);
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to switch active bank");
    } finally {
      setSwitching(false);
    }
  };

  const handleToggle = async (provider: BankProvider, enabled: boolean) => {
    if (!settings) return;
    const setToggling =
      provider === "INTER" ? setTogglingInter : setTogglingFdbank;
    setToggling(true);
    try {
      const res = await http.put<{
        message: string;
        activeBankProvider: BankProvider;
        interEnabled: boolean;
        fdbankEnabled: boolean;
      }>("/admin/settings/bank/toggle", { provider, enabled });
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              activeBankProvider: res.data.activeBankProvider,
              interEnabled: res.data.interEnabled,
              fdbankEnabled: res.data.fdbankEnabled,
            }
          : prev
      );
      toast.success(res.data.message);
    } catch {
      toast.error(`Failed to toggle ${BANK_LABELS[provider]}`);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Failed to load bank settings.</p>
        <Button variant="outline" onClick={() => { setLoading(true); fetchSettings(); }}>
          <RefreshCw className="mr-2 size-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage bank provider configuration and availability.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setLoading(true); fetchSettings(); }}
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Active Bank Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Active Bank Provider
          </CardTitle>
          <CardDescription>
            Select which bank provider processes transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={settings.activeBankProvider}
              onValueChange={(val) => handleSwitchActive(val as BankProvider)}
              disabled={switching}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTER">Inter Bank</SelectItem>
                <SelectItem value="FDBANK">FDBank</SelectItem>
              </SelectContent>
            </Select>
            {switching && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bank Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Availability</CardTitle>
          <CardDescription>
            Enable or disable individual bank providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inter Bank */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">Inter Bank</Label>
                  {settings.activeBankProvider === "INTER" && (
                    <Badge className="bg-green-600 text-white text-xs">
                      <CheckCircle2 className="mr-1 size-3" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {settings.interEnabled ? "Enabled" : "Disabled"} — Provider
                  code: INTER
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {togglingInter && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.interEnabled}
                onCheckedChange={(checked) => handleToggle("INTER", checked)}
                disabled={togglingInter}
              />
            </div>
          </div>

          {/* FDBank */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">FDBank</Label>
                  {settings.activeBankProvider === "FDBANK" && (
                    <Badge className="bg-green-600 text-white text-xs">
                      <CheckCircle2 className="mr-1 size-3" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {settings.fdbankEnabled ? "Enabled" : "Disabled"} — Provider
                  code: FDBANK
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {togglingFdbank && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.fdbankEnabled}
                onCheckedChange={(checked) => handleToggle("FDBANK", checked)}
                disabled={togglingFdbank}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      {settings.updatedAt && (
        <p className="text-xs text-muted-foreground">
          Last updated:{" "}
          {new Date(settings.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
