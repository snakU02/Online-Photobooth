// WebRTC Peer Connection Manager for DuoSnap Remote Couple Photobooth

export type PeerRole = "host" | "guest";
export type ConnectionStatus = "idle" | "creating" | "waiting" | "connecting" | "connected" | "error" | "disconnected";

interface WebRTCManagerOptions {
  roomCode: string;
  role: PeerRole;
  onRemoteStream: (stream: MediaStream) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onGuestJoined?: () => void;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

const POLL_INTERVAL = 1200; // ms

export class DuoSnapWebRTC {
  private pc: RTCPeerConnection | null = null;
  private roomCode: string;
  private role: PeerRole;
  private onRemoteStream: (stream: MediaStream) => void;
  private onStatusChange: (status: ConnectionStatus) => void;
  private onGuestJoined?: () => void;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastPollTimestamp = 0;
  private localStream: MediaStream | null = null;
  private destroyed = false;

  constructor(options: WebRTCManagerOptions) {
    this.roomCode = options.roomCode;
    this.role = options.role;
    this.onRemoteStream = options.onRemoteStream;
    this.onStatusChange = options.onStatusChange;
    this.onGuestJoined = options.onGuestJoined;
  }

  private async signal(type: string, data: unknown) {
    await fetch("/api/signal/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: this.roomCode, role: this.role, type, data }),
    });
  }

  private createPeerConnection() {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.pc = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && !this.destroyed) {
        this.signal("ice", event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      if (!this.destroyed) {
        this.onRemoteStream(event.streams[0]);
        this.onStatusChange("connected");
      }
    };

    pc.onconnectionstatechange = () => {
      if (this.destroyed) return;
      if (pc.connectionState === "connected") this.onStatusChange("connected");
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this.onStatusChange("disconnected");
      }
    };

    return pc;
  }

  private startPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);

    this.pollTimer = setInterval(async () => {
      if (this.destroyed) return;

      try {
        const resp = await fetch(
          `/api/signal/poll?code=${this.roomCode}&role=${this.role}&since=${this.lastPollTimestamp}`
        );
        const json = await resp.json();

        if (!json.success || this.destroyed) return;

        // Notify host that guest joined
        if (json.guestJoined && this.role === "host" && this.onGuestJoined) {
          this.onGuestJoined();
        }

        for (const msg of json.messages as Array<{ type: string; data: unknown; timestamp: number }>) {
          this.lastPollTimestamp = Math.max(this.lastPollTimestamp, msg.timestamp);
          await this.handleSignalMessage(msg.type, msg.data);
        }
      } catch {
        // Network error, retry silently
      }
    }, POLL_INTERVAL);
  }

  private async handleSignalMessage(type: string, data: unknown) {
    if (!this.pc) return;

    if (type === "offer") {
      await this.pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      await this.signal("answer", answer);
      this.onStatusChange("connecting");
    } else if (type === "answer") {
      await this.pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit));
    } else if (type === "ice") {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit));
      } catch {
        // ignore stale ICE candidates
      }
    } else if (type === "join") {
      // Guest joined, host should now send offer
      if (this.role === "host") {
        await this.sendOffer();
      }
    }
  }

  public async start(localStream: MediaStream) {
    this.localStream = localStream;
    const pc = this.createPeerConnection();

    // Add all local tracks
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    this.startPolling();

    if (this.role === "guest") {
      this.onStatusChange("connecting");
      // Signal host we joined
      await this.signal("join", { roomCode: this.roomCode });
    } else {
      this.onStatusChange("waiting");
    }
  }

  private async sendOffer() {
    if (!this.pc || this.destroyed) return;
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    await this.signal("offer", offer);
    this.onStatusChange("connecting");
  }

  public async addLocalStream(stream: MediaStream) {
    if (!this.pc) return;
    this.localStream = stream;
    stream.getTracks().forEach((track) => this.pc!.addTrack(track, stream));
  }

  public destroy() {
    this.destroyed = true;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }
}
