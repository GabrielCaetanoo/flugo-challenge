// src/services/employeeService.ts
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// A tipagem dos dados baseada no formulário do Figma
export interface EmployeeData {
  name: string;
  email: string;
  department: string;
  isActive: boolean;
}

// Referência para a "tabela" (coleção) de funcionários no banco
const employeesCollectionRef = collection(db, "employees");

// Função para SALVAR um novo colaborador (usaremos no final do multi-step)
export const createEmployee = async (data: EmployeeData) => {
  try {
    const docRef = await addDoc(employeesCollectionRef, data);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
    throw error;
  }
};

// Função para BUSCAR todos os colaboradores (usaremos na nossa tela de Lista)
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