export const LIFE_RACES = ["human", "elf", "dwarf", "orc", "aqua"] as const;
export const LIFE_FACES = ["balanced", "soft", "strong", "sharp"] as const;
export const LIFE_HAIR_STYLES = ["short", "long", "tied", "braid", "wild"] as const;
export const LIFE_FACE_SHAPES = ["oval", "round", "square", "heart"] as const;
export const LIFE_MARKINGS = ["none", "freckles", "stripe", "scar", "aqua"] as const;

export type LifeDraftInput = {
  name: string;
  race: string;
  face: string;
  hair: string;
  hairColor: string;
  eyes: string;
  skin: string;
  faceShape: string;
  marking: string;
};
export type LifeDraft = LifeDraftInput & { id: string; name: string; equipmentIncluded: false };

function requireChoice<T extends readonly string[]>(value: string, allowed: T, label: string): T[number] {
  if (!allowed.includes(value)) throw new Error(`Pilihan ${label} tidak valid.`);
  return value;
}

export function createLifeDraft(input: LifeDraftInput, id = `life-draft-${Date.now().toString(36)}`): LifeDraft {
  const name = input.name.trim() || "Life Baru";
  if (name.length > 48) throw new Error("Nama karakter maksimal 48 karakter.");
  if (!/^life-draft-[a-z0-9-]{1,40}$/i.test(id)) throw new Error("ID draft tidak valid.");
  return {
    id,
    name,
    race: requireChoice(input.race, LIFE_RACES, "ras"),
    face: requireChoice(input.face, LIFE_FACES, "wajah"),
    hair: requireChoice(input.hair, LIFE_HAIR_STYLES, "rambut"),
    hairColor: requireHexColor(input.hairColor, "warna rambut"),
    eyes: requireHexColor(input.eyes, "warna mata"),
    skin: requireHexColor(input.skin, "warna kulit"),
    faceShape: requireChoice(input.faceShape, LIFE_FACE_SHAPES, "bentuk wajah"),
    marking: requireChoice(input.marking, LIFE_MARKINGS, "tanda khas"),
    equipmentIncluded: false,
  };
}

function requireHexColor(value: string, label: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Pilihan ${label} tidak valid.`);
  return value.toLowerCase();
}
