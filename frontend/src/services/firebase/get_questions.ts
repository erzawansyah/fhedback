
import { doc,  getDoc} from "firebase/firestore";
import { db } from ".";

export type QuestionDoc = {
  cid: string;
  content: unknown;
  createdAt: unknown;
}

export async function getQuestionByCid(cid: string): Promise<QuestionDoc | null> {
  const ref = doc(db, "questions", cid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as QuestionDoc) : null;
}
