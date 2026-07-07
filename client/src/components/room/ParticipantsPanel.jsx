import AudioCard from "../AudioCard.jsx";
import { VolumeIcon } from "../../lib/icons.jsx";

export default function ParticipantsPanel({ users, myName, soundLevel, isMicOn, masterVolume, onMasterVolumeChange }) {
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
        <VolumeIcon size={18} />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(masterVolume * 100)}
          onChange={(e) => onMasterVolumeChange(e.target.valueAsNumber / 100)}
          className="flex-1 accent-primary"
        />
        <span className="w-8 text-right text-xs tabular-nums text-text-secondary">
          {Math.round(masterVolume * 100)}
        </span>
      </div>
      <div className="space-y-2">
        <AudioCard name={myName} isLocal soundLevel={soundLevel} isMicOn={isMicOn} />
        {Object.entries(users).map(([userId, user]) => (
          <AudioCard key={userId} name={user.name} remoteStream={user.remoteStream} isMicOn={user.micOn} volume={masterVolume} />
        ))}
      </div>
    </div>
  );
}
