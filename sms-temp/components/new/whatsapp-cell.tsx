"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, MessageCirclePlus } from "lucide-react";

const supabase = createClient();

interface WhatsAppCellProps {
  phone: string | null;
  studentName: string;
}

export function WhatsAppCell({ phone, studentName }: WhatsAppCellProps) {
  const [handlerName, setHandlerName] = useState("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setHandlerName(
          data.user.user_metadata?.full_name ?? data.user.email ?? "SST"
        );
      }
    });
  }, []);

  const formattedPhone = phone?.replace(/[^0-9]/g, "") ?? "";
  const waBase = `https://wa.me/6${formattedPhone}`;

  const welcomeMsg = `Hi ${studentName} 😊
Good day!

Welcome to UNITAR International University! 🎉 We are so excited to have you in our family!

My name is ${handlerName || "SST"} from the Student Success Team (SST). I'm here to support and guide you throughout your uni journey to make it as smooth and enjoyable as possible. ✨

If you are facing any challenges, feeling unsure, or just need someone to talk to—please don't keep it to yourself.

👉 Need help with anything? Just click here: https://firststeps.unitar.my/help
👉 Or just reply directly to this message!`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    window.open(waBase, "_blank", "noopener,noreferrer");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const openWhatsApp = (message: string | null) => {
    const url = message
      ? `${waBase}?text=${encodeURIComponent(message)}`
      : waBase;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={(e) => e.stopPropagation()}
        >
          {copied
            ? <Check className="w-4 h-4 text-green-500" />
            : <MessageCirclePlus className="w-5 h-5 text-green-500" />
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-1.5 bg-white dark:bg-black rounded-md border shadow-md"
        align="start"
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-0.5">
          <button
            onClick={() => copyToClipboard(welcomeMsg)}
            className="w-full flex flex-col rounded-md px-3 py-2 hover:bg-muted transition-colors cursor-pointer text-left"
          >
            <span className="text-sm font-medium text-foreground">Copy Message</span>
            <span className="text-xs text-muted-foreground">Copy welcome text to clipboard</span>
          </button>
          <button
            onClick={() => openWhatsApp(null)}
            className="w-full flex flex-col rounded-md px-3 py-2 hover:bg-muted transition-colors cursor-pointer text-left"
          >
            <span className="text-sm font-medium text-foreground">Open WhatsApp</span>
            <span className="text-xs text-muted-foreground">No pre-filled message</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
