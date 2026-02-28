// src/services/employeeService.ts
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export interface EmployeeData {
  name: string;
  email: string;
  department: string;
  isActive: boolean;
}

const employeesCollectionRef = collection(db, "employees");

// Verifica se o e-mail já existe no Firebase!
export const checkEmailExists = async (email: string) => {
  const q = query(employeesCollectionRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // Retorna true se achar algum documento
};

export const createEmployee = async (data: EmployeeData) => {
  try {
    const docRef = await addDoc(employeesCollectionRef, data);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
    throw error;
  }
};

export const getEmployees = async () => {
  try {
    const data = await getDocs(employeesCollectionRef);
    return data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as (EmployeeData & { id: string })[];
  } catch (error) {
    console.error("Erro ao buscar no Firebase:", error);
    throw error;
  }
};