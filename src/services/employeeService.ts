// src/services/employeeService.ts
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, writeBatch, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface EmployeeData {
  name: string;
  email: string;
  department: string;
  isActive: boolean;
  // Campos adicionados no Desafio 2
  cargo?: string;
  dataAdmissao?: string;
  nivel?: string;
  gestorResponsavel?: string;
  salario?: string;
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

// ==========================================
// NOVAS FUNÇÕES: DESAFIO 2
// ==========================================

// Exclusão Individual
export const deleteEmployee = async (id: string) => {
  try {
    const employeeDoc = doc(db, "employees", id);
    await deleteDoc(employeeDoc);
  } catch (error) {
    console.error("Erro ao excluir colaborador:", error);
    throw error;
  }
};

// Exclusão em Massa (Usando Batch para segurança)
export const deleteMultipleEmployees = async (ids: string[]) => {
  try {
    const batch = writeBatch(db);
    
    ids.forEach((id) => {
      const employeeDoc = doc(db, "employees", id);
      batch.delete(employeeDoc);
    });
    
    // Executa todas as exclusões engatilhadas de uma só vez
    await batch.commit(); 
  } catch (error) {
    console.error("Erro ao excluir múltiplos colaboradores:", error);
    throw error;
  }
};

// Busca UM colaborador específico pelo ID
export const getEmployeeById = async (id: string) => {
  try {
    const docRef = doc(db, "employees", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as EmployeeData;
    } else {
      throw new Error("Colaborador não encontrado!");
    }
  } catch (error) {
    console.error("Erro ao buscar colaborador:", error);
    throw error;
  }
};

// Atualiza os dados de um colaborador existente
export const updateEmployee = async (id: string, data: Partial<EmployeeData>) => {
  try {
    const docRef = doc(db, "employees", id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Erro ao atualizar colaborador:", error);
    throw error;
  }
};