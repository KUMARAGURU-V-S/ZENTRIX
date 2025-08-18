import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

const addTask = async (task) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), task);
    console.log("Task added with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding task: ", e);
  }
};

// Usage:
addTask({ title: "Read a book", completed: false, createdAt: new Date() });
