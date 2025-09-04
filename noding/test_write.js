// Import the necessary modules
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
// Note: 'getDoc' is now included in the import statement
import { db } from './firebase.js';

// Define the data to be written
const testData = {
    message: "This is a test write.",
    timestamp: new Date().toISOString()
};

// Define the document reference
const docRef = doc(db, "testCollection", "testDocument");

// Perform the write and confirmation
async function writeDataAndConfirm() {
    try {
        await setDoc(docRef, testData);
        console.log("✅ Data successfully written to Firestore!");
        console.log("Document ID:", docRef.id);
        
        // Optional: Perform a read operation to verify the data
        const docSnap = await getDoc(docRef); // This line will now work
        if (docSnap.exists()) {
            console.log("📋 Verified data:", docSnap.data());
        } else {
            console.log("❌ Document does not exist after writing.");
        }
    } catch (error) {
        console.error("❌ Error writing to Firestore:", error.message);
    }
}

// Call the function to run the test
writeDataAndConfirm();