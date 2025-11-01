import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from ".";

export async function grantAccess(
    contractAddress: string,
    accountAddress: string,
    questionIndex: number
) {
    const key = `${contractAddress}_${accountAddress}_${questionIndex}`.toLowerCase();

    const aclRef = doc(db, "acl", key);
    await setDoc(aclRef, {
        confirmedAt: serverTimestamp()
    });
}

export async function checkAccess(
    contractAddress: string,
    accountAddress: string, 
    questionIndex: number
) {
    const key = `${contractAddress}_${accountAddress}_${questionIndex}`.toLowerCase();

    const aclRef = doc(db, "acl", key);
    const snapshot = await getDoc(aclRef);
    if (!snapshot.exists()) return false;
    return true;
}
