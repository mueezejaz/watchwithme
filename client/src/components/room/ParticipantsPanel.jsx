import AudioCard from "../AudioCard.jsx";

export default function ParticipantsPanel({ users, myName, soundLevel, isMicOn }) {
  return (
    <div className="space-y-2 p-3">
      <AudioCard name={myName} isLocal soundLevel={soundLevel} isMicOn={isMicOn} />
      {Object.entries(users).map(([userId, user]) => (
        <AudioCard key={userId} name={user.name} remoteStream={user.remoteStream} />
      ))}
    </div>
  );
}
