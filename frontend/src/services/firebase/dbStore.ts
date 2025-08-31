import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from ".";
import { cidFromJson } from "@/utils/cidFromJson";

type Collection = "questions" | "metadata";

export async function createDb(
  collection: Collection,
  jsonObj: unknown,
  ownerAddress?: string
) {
  const cid = await cidFromJson(jsonObj);

  // Safety: buang nilai undefined di dalam content
  // supaya tidak ada kejutan saat serialize
  const content = JSON.parse(JSON.stringify(jsonObj));

  const coll = collection === "questions" ? "questions" : "metadata";
  const ref = doc(db, coll, cid);

  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return cid;

  await setDoc(ref, {
    cid,
    ownerAddress: ownerAddress ? ownerAddress.toLowerCase() : null,
    content,
    createdAt: serverTimestamp(),
  });

  return cid;
}
