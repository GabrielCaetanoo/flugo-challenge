// src/services/departmentService.ts
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface DepartmentData {
  name: string;
  gestorResponsavel: string; // Vai armazenar o ID do colaborador que é o Gestor
  descricao?: string;
}

const departmentsCollectionRef = collection(db, "departments");

// 1. Criar Departamento
export const createDepartment = async (data: DepartmentData) => {
  try {
    const docRef = await addDoc(departmentsCollectionRef, data);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar departamento:", error);
    throw error;
  }
};

// 2. Listar todos os Departamentos
export const getDepartments = async () => {
  try {
    const data = await getDocs(departmentsCollectionRef);
    return data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as (DepartmentData & { id: string })[];
  } catch (error) {
    console.error("Erro ao buscar departamentos:", error);
    throw error;
  }
};

// 3. Buscar Departamento específico por ID (Para a tela de Edição)
export const getDepartmentById = async (id: string) => {
  try {
    const docRef = doc(db, "departments", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as DepartmentData;
    } else {
      throw new Error("Departamento não encontrado");
    }
  } catch (error) {
    console.error("Erro ao buscar departamento:", error);
    throw error;
  }
};

// 4. Atualizar Departamento
export const updateDepartment = async (id: string, data: Partial<DepartmentData>) => {
  try {
    const docRef = doc(db, "departments", id);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Erro ao atualizar departamento:", error);
    throw error;
  }
};

// 5. Excluir Departamento (A regra de transferência de funcionários vai entrar em ação antes de chamar isso aqui!)
export const deleteDepartment = async (id: string) => {
  try {
    const docRef = doc(db, "departments", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao excluir departamento:", error);
    throw error;
  }
};