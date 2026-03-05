// src/services/departmentService.ts
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DepartmentData {
  name: string;
  gestorResponsavel: string;
  descricao?: string;
}

export type DepartmentWithId = DepartmentData & { id: string };

// ─── Collection Reference ─────────────────────────────────────────────────────

const departmentsRef = collection(db, 'departments');

// ─── Service Functions ────────────────────────────────────────────────────────

export const createDepartment = async (data: DepartmentData): Promise<string> => {
  try {
    const docRef = await addDoc(departmentsRef, data);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar departamento:', error);
    throw error;
  }
};

export const getDepartments = async (): Promise<DepartmentWithId[]> => {
  try {
    const snapshot = await getDocs(departmentsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DepartmentWithId));
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error);
    throw error;
  }
};

export const getDepartmentById = async (id: string): Promise<DepartmentData> => {
  try {
    const docRef = doc(db, 'departments', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error('Departamento não encontrado');

    return docSnap.data() as DepartmentData;
  } catch (error) {
    console.error('Erro ao buscar departamento:', error);
    throw error;
  }
};

export const updateDepartment = async (id: string, data: Partial<DepartmentData>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'departments', id), data);
  } catch (error) {
    console.error('Erro ao atualizar departamento:', error);
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'departments', id));
  } catch (error) {
    console.error('Erro ao excluir departamento:', error);
    throw error;
  }
};