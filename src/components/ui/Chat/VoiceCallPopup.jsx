import { useEffect, useMemo, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Expand, Phone, PhoneIncoming } from 'lucide-react';
import Avatar from '../Shared/Avatar';

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const VoiceCallPopup = ({
  open,
  conversation,
  currentUser,
  status = 'idle',
  direction = 'outgoing',
  onClose,
  onAccept,
  onReject,
  onHangUp,
  onOpenFullCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const peer = useMemo(() => {
    if (!conversation) return null;
    return conversation.participants?.find((p) => {
      if (currentUser?._id && p._id) return p._id !== currentUser._id;
      if (currentUser?.username && p.username) return p.username !== currentUser.username;
      return p._id !== 'self';
    });
  }, [conversation, currentUser]);

  useEffect(() => {
    if (!open) return undefined;

    setElapsedSeconds(0);
    setIsMuted(false);
    setSpeakerOn(true);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || status !== 'in-call') return undefined;
    const timerId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [open, status]);

  useEffect(() => {
    if (!open) return undefined;

    const shouldRing = status === 'incoming' || status === 'ringing';
    if (!shouldRing) return undefined;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return undefined;

    const audioCtx = new AudioCtx();
    let intervalId;

    const playTone = (frequency, durationMs, gainLevel = 0.018) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + durationMs / 1000 + 0.02);
    };

    const runPattern = () => {
      if (status === 'incoming') {
        playTone(700, 180, 0.024);
        window.setTimeout(() => playTone(820, 180, 0.024), 220);
        window.setTimeout(() => playTone(700, 180, 0.024), 440);
      } else {
        playTone(620, 140, 0.018);
      }
    };

    audioCtx.resume().catch(() => {
      // Browsers can block autoplay. Keep this best-effort.
    });

    runPattern();
    intervalId = window.setInterval(runPattern, status === 'incoming' ? 1700 : 1200);

    return () => {
      window.clearInterval(intervalId);
      audioCtx.close().catch(() => {
        // noop
      });
    };
  }, [open, status, direction]);

  if (!open || !conversation) return null;

  const name = conversation.isGroup ? conversation.name : peer?.name || 'Unknown';
  const canOpenFullCall = status === 'in-call';

  const statusLabel = (() => {
    if (status === 'incoming') return 'Incoming call...';
    if (status === 'ringing') return 'Ringing...';
    if (status === 'in-call') return `In call • ${formatDuration(elapsedSeconds)}`;
    if (status === 'busy') return 'User is busy on another call';
    if (status === 'rejected') return 'Call declined';
    if (status === 'missed') return 'Missed call';
    if (status === 'ended') return 'Call ended';
    if (status === 'unavailable') return 'User unavailable';
    return 'Call';
  })();

  return (
    <div className="voice-call-popup" role="dialog" aria-label="Audio call controls">
      <div className="voice-call-header">
        <Avatar name={name} src={peer?.avatarUrl} size="lg" online={peer?.isOnline} group={conversation.isGroup} />
        <div className="voice-call-meta">
          <p className="voice-call-name">{name}</p>
          <p className="voice-call-status">{statusLabel}</p>
        </div>
      </div>

      <div className="voice-call-controls">
        {status === 'incoming' && (
          <>
            <button
              className="voice-control-btn active"
              onClick={onAccept}
              title="Accept call"
            >
              <PhoneIncoming size={16} />
              <span>Accept</span>
            </button>

            <button
              className="voice-control-btn danger"
              onClick={onReject || onClose}
              title="Decline call"
            >
              <PhoneOff size={16} />
              <span>Decline</span>
            </button>
          </>
        )}

        {status !== 'incoming' && (
          <>
        <button
          className={`voice-control-btn ${isMuted ? 'active' : ''}`}
          onClick={() => setIsMuted((v) => !v)}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          disabled={status !== 'in-call'}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          <span>{isMuted ? 'Muted' : 'Mute'}</span>
        </button>

        <button
          className={`voice-control-btn ${speakerOn ? 'active' : ''}`}
          onClick={() => setSpeakerOn((v) => !v)}
          title={speakerOn ? 'Disable speaker output' : 'Enable speaker output'}
          disabled={status !== 'in-call'}
        >
          {speakerOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{speakerOn ? 'Speaker' : 'Earpiece'}</span>
        </button>

        <button
          className="voice-control-btn"
          onClick={canOpenFullCall ? onOpenFullCall : undefined}
          title="Open full call view"
          disabled={!canOpenFullCall}
        >
          <Expand size={16} />
          <span>Open full</span>
        </button>

        <button
          className="voice-control-btn danger"
          onClick={onHangUp || onClose}
          title={status === 'in-call' ? 'Hang up' : 'Cancel call'}
        >
          {status === 'in-call' ? <PhoneOff size={16} /> : <Phone size={16} />}
          <span>{status === 'in-call' ? 'Hang up' : 'Cancel'}</span>
        </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceCallPopup;
