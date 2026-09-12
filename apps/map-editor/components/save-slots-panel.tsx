"use client";

export type SaveSlot = {
  slot_number: number;
  label: string;
  version_number: number;
  updated_at: string;
};

type Props = {
  open: boolean;
  slots: SaveSlot[];
  busy?: boolean;
  onClose: () => void;
  onSave: (slotNumber: number, label: string) => void | Promise<void>;
  onLoad: (slotNumber: number) => void | Promise<void>;
};

const SLOT_COUNT = 6;

export function SaveSlotsPanel({ open, slots, busy = false, onClose, onSave, onLoad }: Props) {
  if (!open) return null;
  const bySlot = new Map(slots.map(slot => [slot.slot_number, slot]));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(2,6,23,.72)', backdropFilter: 'blur(4px)' }}>
      <section role="dialog" aria-modal="true" aria-label="Save slots" style={{ width: 'min(760px, 100%)', maxHeight: '90vh', overflow: 'auto', border: '1px solid #475569', borderRadius: 16, background: 'linear-gradient(180deg,#111827,#020617)', color: '#f8fafc', boxShadow: '0 24px 80px rgba(0,0,0,.55)', padding: 18 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: '#94a3b8' }}>Vandrith Chronicle</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 26 }}>Save / Load Game</h2>
          </div>
          <button onClick={onClose} disabled={busy} style={buttonStyle(false)}>✕</button>
        </header>
        <p style={{ margin: '0 0 14px', color: '#cbd5e1', fontSize: 13 }}>Choose a save slot. Saving creates a new authoritative map version and stores that exact map state in the selected slot.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10 }}>
          {Array.from({ length: SLOT_COUNT }, (_, index) => {
            const slotNumber = index + 1;
            const slot = bySlot.get(slotNumber);
            return (
              <article key={slotNumber} style={{ border: `1px solid ${slot ? '#475569' : '#334155'}`, borderRadius: 12, padding: 14, background: slot ? '#172033' : '#0b1220', minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Save Slot {slotNumber}</strong>
                    <span style={{ fontSize: 11, color: slot ? '#86efac' : '#64748b' }}>{slot ? 'SAVED' : 'EMPTY'}</span>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 16 }}>{slot?.label || 'Empty Chronicle Slot'}</div>
                  {slot && <div style={{ marginTop: 6, color: '#94a3b8', fontSize: 12 }}>Version {slot.version_number} · {new Date(slot.updated_at).toLocaleString()}</div>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: slot ? '1fr 1fr' : '1fr', gap: 7, marginTop: 14 }}>
                  <button disabled={busy} onClick={() => onSave(slotNumber, slot?.label || `Save Slot ${slotNumber}`)} style={buttonStyle(true)}>Save</button>
                  {slot && <button disabled={busy} onClick={() => onLoad(slotNumber)} style={buttonStyle(false)}>Load</button>}
                </div>
              </article>
            );
          })}
        </div>
        <footer style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #1e293b', color: '#64748b', fontSize: 11 }}>Six slots are enabled now; the database contract supports up to 12 slots without changing the save format.</footer>
      </section>
    </div>
  );
}

function buttonStyle(primary: boolean): React.CSSProperties {
  return { border: `1px solid ${primary ? '#64748b' : '#334155'}`, borderRadius: 8, padding: '8px 10px', background: primary ? '#1e293b' : '#0f172a', color: '#f8fafc', cursor: 'pointer', fontWeight: 600 };
}
