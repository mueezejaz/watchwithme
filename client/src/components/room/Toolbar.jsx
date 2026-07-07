import { Button } from "../ui/button.jsx";
import { VideoIcon, MicIcon, MicOffIcon, InviteIcon } from "../../lib/icons.jsx";

export default function Toolbar({ isMicOn, toggleMic, onAddVideo, onInvite, className }) {
  return (
    <div className={className}>
      <Button variant="ghost" size="sm" onClick={onAddVideo} title="Change video">
        <VideoIcon size={16} />
        <span className="hidden sm:inline">Change video</span>
      </Button>

      <Button
        variant={isMicOn ? "ghost" : "secondary"}
        size="sm"
        onClick={toggleMic}
        title={isMicOn ? "Mute microphone" : "Unmute microphone"}
      >
        {isMicOn ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
        <span className="hidden sm:inline">{isMicOn ? "Mute" : "Unmute"}</span>
      </Button>

      <Button variant="ghost" size="sm" onClick={onInvite} title="Invite people">
        <InviteIcon size={16} />
        <span className="hidden sm:inline">Invite</span>
      </Button>
    </div>
  );
}
