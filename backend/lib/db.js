import { db } from './firebase.js';
import { doc, getDocs, setDoc, collection, deleteDoc } from 'firebase/firestore';

export async function fetchTransactions(uid) {
  if (!uid) return [];
  try {
    const txRef = collection(db, `users/${uid}/transactions`);
    const txSnap = await getDocs(txRef);
    const transactions = [];
    txSnap.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (e) {
    console.error("Error fetching transactions:", e);
    return [];
  }
}

export async function addTransaction(uid, transaction) {
  if (!uid) return null;
  try {
    const txRef = doc(collection(db, `users/${uid}/transactions`));
    const newTx = { ...transaction, id: txRef.id };
    await setDoc(txRef, newTx);
    return newTx;
  } catch (e) {
    console.error("Error adding transaction:", e);
    return null;
  }
}

export async function deleteTransaction(uid, id) {
  if (!uid || !id) return false;
  try {
    await deleteDoc(doc(db, `users/${uid}/transactions`, id));
    return true;
  } catch (e) {
    console.error("Error deleting transaction:", e);
    return false;
  }
}

export async function updateTransaction(uid, id, updatedData) {
  if (!uid || !id) return false;
  try {
    const txRef = doc(db, `users/${uid}/transactions`, id);
    await setDoc(txRef, updatedData, { merge: true });
    return true;
  } catch (e) {
    console.error("Error updating transaction:", e);
    return false;
  }
}

export async function fetchBudgetLimit(uid) {
  if (!uid) return null;
  try {
    const docRef = doc(db, `users/${uid}/settings`, 'budget');
    const docSnap = await getDocs(collection(db, `users/${uid}/settings`));
    // Check if the specific budget document exists among settings
    let budget = null;
    docSnap.forEach(d => {
      if (d.id === 'budget') {
        budget = d.data().amount;
      }
    });
    return budget;
  } catch (e) {
    console.error("Error fetching budget limit:", e);
    return null;
  }
}

export async function setBudgetLimit(uid, amount) {
  if (!uid) return false;
  try {
    const docRef = doc(db, `users/${uid}/settings`, 'budget');
    await setDoc(docRef, { amount: Number(amount) });
    return true;
  } catch (e) {
    console.error("Error setting budget limit:", e);
    return false;
  }
}

export async function fetchSavingsGoals(uid) {
  if (!uid) return [];
  try {
    const goalsRef = collection(db, `users/${uid}/goals`);
    const goalsSnap = await getDocs(goalsRef);
    const goals = [];
    goalsSnap.forEach(d => {
      goals.push({ id: d.id, ...d.data() });
    });
    return goals;
  } catch (e) {
    console.error("Error fetching savings goals:", e);
    return [];
  }
}

export async function addSavingsGoal(uid, goal) {
  if (!uid) return null;
  try {
    const goalRef = doc(collection(db, `users/${uid}/goals`));
    const newGoal = { ...goal, id: goalRef.id };
    await setDoc(goalRef, newGoal);
    return newGoal;
  } catch (e) {
    console.error("Error adding savings goal:", e);
    return null;
  }
}

export async function deleteSavingsGoal(uid, id) {
  if (!uid || !id) return false;
  try {
    await deleteDoc(doc(db, `users/${uid}/goals`, id));
    return true;
  } catch (e) {
    console.error("Error deleting savings goal:", e);
    return false;
  }
}
