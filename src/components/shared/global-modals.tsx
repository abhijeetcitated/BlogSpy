"use client"

import { AddProjectDialog } from "@/features/dashboard/components/AddProjectDialog"
import { useUIStore } from "@/store/ui-store"
import { useShallow } from "zustand/shallow"

export function GlobalModals() {
  const { createProjectModalOpen, setCreateProjectModalOpen } = useUIStore(
    useShallow((state) => ({
      createProjectModalOpen: state.createProjectModalOpen,
      setCreateProjectModalOpen: state.setCreateProjectModalOpen,
    }))
  )

  return (
    <AddProjectDialog
      open={createProjectModalOpen}
      onOpenChange={setCreateProjectModalOpen}
    />
  )
}
