import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from ".";
import { cidFromJson } from "@/utils/cidFromJson";


export async function createDb(
  jsonObj: unknown,
  ownerAddress?: string
) {
  const cid = await cidFromJson(jsonObj);
  // Safety: buang nilai undefined di dalam content
  // supaya tidak ada kejutan saat serialize
  const content = JSON.parse(JSON.stringify(jsonObj));

  const ref = doc(db, "ipfs", cid);

  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return cid;

  await setDoc(ref, {
    ownerAddress: ownerAddress ? ownerAddress.toLowerCase() : null,
    content,
    createdAt: serverTimestamp(),
  });

  return cid;
}

export async function getDb(
  cid: string
) {
  const ref = doc(db, "ipfs", cid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data();
}

