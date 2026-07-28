import { announcementBarMessage } from "@/lib/site-config";

/** Subtle credibility strip. Set to `null` in Header.tsx if it ever feels distracting. */
export function AnnouncementBar() {
  return (
    <div className="bg-ink-900 py-2 text-center text-xs font-medium tracking-wide text-paper-300">
      {announcementBarMessage}
    </div>
  );
}
