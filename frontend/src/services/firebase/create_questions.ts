import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from ".";
import { cidFromJson } from "@/utils/cidFromJson";

/**
 * Upload JSON ke Firestore collection `questions`
 * @param jsonObj - struktur data questions (object)
 * @param ownerAddress - alamat wallet pemilik (opsional)
 * @returns CID dokumen yang disimpan
 */
export async function createQuestions(jsonObj: unknown, ownerAddress?: string) {
  // Hitung CID
  const cid = await cidFromJson(jsonObj);

  // Referensi dokumen
  const ref = doc(db, "questions", cid);

  // Cek apakah dokumen sudah ada
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    // Sudah ada → return CID yang sama tanpa menulis ulang
    return cid;
  }

  // Simpan dokumen baru
  await setDoc(ref, {
    cid,
    ownerAddress: ownerAddress?.toLowerCase() || null,
    content: jsonObj,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return cid;
}
