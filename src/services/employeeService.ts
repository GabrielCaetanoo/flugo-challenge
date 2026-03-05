// src/services/employeeService.ts
import {
  collection, addDoc, getDocs, query, where,
  doc, deleteDoc, writeBatch, getDoc, updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployeeData {
  name: string;
  email: string;
  department: string;
  isActive: boolean;
  cargo?: string;
  dataAdmissao?: string;
  nivel?: string;
  gestorResponsavel?: string;
  salario?: string;
}

export type EmployeeWithId = EmployeeData & { id: string };

// ─── Collection Reference ─────────────────────────────────────────────────────

const employeesRef = collection(db, 'employees');

// ─── Service Functions ────────────────────────────────────────────────────────

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const snapshot = await getDocs(query(employeesRef, where('email', '==', email)));
  return !snapshot.empty;
};

export const createEmployee = async (data: EmployeeData): Promise<string> => {
  try {
    const docRef = await addDoc(employeesRef, data);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar colaborador:', error);
    throw error;
  }
};

export const getEmployees = async (): Promise<EmployeeWithId[]> => {
  try {
    const snapshot = await getDocs(employeesRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EmployeeWithId));
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    throw error;
  }
};

export const getEmployeeById = async (id: string): Promise<EmployeeData> => {
  try {
    const docSnap = await getDoc(doc(db, 'employees', id));

    if (!docSnap.exists()) throw new Error('Colaborador não encontrado');

    return docSnap.data() as EmployeeData;
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error);
    throw error;
  }
};

export const updateEmployee = async (id: string, data: Partial<EmployeeData>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'employees', id), data);
  } catch (error) {
    console.error('Erro ao atualizar colaborador:', error);
    throw error;
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'employees', id));
  } catch (error) {
    console.error('Erro ao excluir colaborador:', error);
    throw error;
  }
};

export const deleteMultipleEmployees = async (ids: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    ids.forEach((id) => batch.delete(doc(db, 'employees', id)));
    await batch.commit();
  } catch (error) {
    console.error('Erro ao excluir múltiplos colaboradores:', error);
    throw error;
  }
};