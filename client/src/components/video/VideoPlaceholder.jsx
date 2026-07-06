import { VideoIcon, PlusIcon } from "../../lib/icons.jsx";
import { Button } from "../ui/button.jsx";

export default function VideoPlaceholder({ onAddVideo }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-card">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-border">
          <VideoIcon size={32} />
        </div>
        <p className="text-sm text-text-secondary">No video playing</p>
        <Button onClick={onAddVideo} className="gap-2">
          <PlusIcon size={16} />
          Add a video
        </Button>
      </div>
    </div>
  );
}
