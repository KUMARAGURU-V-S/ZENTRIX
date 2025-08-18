import { collection, getDocs } from "firebase/firestore";

const getTasks = async () => {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  const tasks = [];
  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  return tasks;
};

// Usage:
getTasks().then((tasks) => console.log(tasks));
