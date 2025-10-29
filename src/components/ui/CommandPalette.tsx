"use client";

import { Dialog, Combobox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  title: string;
  shortcut?: string;
  href?: string;
  action?: () => void;
}

const DEFAULT_ITEMS: CommandItem[] = [
  { id: "new", title: "New Analysis", shortcut: "N", href: "/my-reports" },
  { id: "reports", title: "My Reports", shortcut: "R", href: "/my-reports" },
  { id: "dashboard", title: "Dashboard", shortcut: "D", href: "/dashboard" },
  { id: "analyst", title: "Analyst Dashboard", shortcut: "A", href: "/analyst-dashboard" },
  { id: "security", title: "Security", shortcut: "S", href: "/security" },
  { id: "help", title: "Help", shortcut: "?", href: "/help" },
  {
    id: "logout",
    title: "Logout",
    shortcut: "L",
    action: async () => {
      try {
        await fetch("/api/auth/clear-session", { method: "POST" });
      } catch {}
      window.location.href = "/";
    },
  },
];

export default function CommandPalette({ items = DEFAULT_ITEMS }: { items?: CommandItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Global hotkey: Ctrl/Cmd + K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const meta = isMac ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q));
  }, [items, query]);

  const onSelect = (item: CommandItem) => {
    setOpen(false);
    if (item.action) return item.action();
    if (item.href) router.push(item.href);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
              <Combobox onChange={onSelect}>
                <div className="relative">
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-4 pr-14 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                    placeholder="Search commands..."
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                  />
                </div>

                <Combobox.Options static className="max-h-80 overflow-y-auto py-2 text-sm">
                  {filtered.length === 0 && (
                    <div className="px-4 py-2 text-gray-500">No matches</div>
                  )}
                  {filtered.map((item) => (
                    <Combobox.Option
                      key={item.id}
                      value={item}
                      className={({ active }: { active: boolean }) =>
                        `flex cursor-pointer items-center justify-between px-4 py-2 ${
                          active ? "bg-blue-50 text-blue-700" : "text-gray-800"
                        }`
                      }
                    >
                      <span>{item.title}</span>
                      {item.shortcut && (
                        <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 border border-gray-200">
                          {item.shortcut}
                        </kbd>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
