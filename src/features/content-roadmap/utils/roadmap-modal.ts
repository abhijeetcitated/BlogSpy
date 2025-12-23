// ============================================
// CONTENT ROADMAP - Modal Logic Utility
// ============================================
// Handles: Modal state management, form validation, modal helpers
// ============================================

import type { TaskCard, TaskStatus } from "../types"

export interface ModalState {
  isOpen: boolean
  mode: "add" | "edit"
  editingTask: TaskCard | null
  prefilledDate: string
}

export interface ModalActions {
  openAddModal: (date?: string) => void
  openEditModal: (task: TaskCard) => void
  closeModal: () => void
  setPrefilledDate: (date: string) => void
}

export function createModalHelpers(
  setState: (updater: (prev: ModalState) => ModalState) => void
): ModalActions {
  const openAddModal = (date?: string) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      mode: "add",
      editingTask: null,
      prefilledDate: date || "",
    }))
  }

  const openEditModal = (task: TaskCard) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      mode: "edit",
      editingTask: task,
      prefilledDate: "",
    }))
  }

  const closeModal = () => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      editingTask: null,
      prefilledDate: "",
    }))
  }

  const setPrefilledDate = (date: string) => {
    setState((prev) => ({
      ...prev,
      prefilledDate: date,
    }))
  }

  return {
    openAddModal,
    openEditModal,
    closeModal,
    setPrefilledDate,
  }
}