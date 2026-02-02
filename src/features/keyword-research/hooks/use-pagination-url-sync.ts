"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useKeywordStore } from "../store"
import { selectPagination } from "../store"

export function usePaginationUrlSync() {
  const pagination = useKeywordStore(selectPagination)
  const setPageIndex = useKeywordStore((state) => state.setPageIndex)
  const setPageSize = useKeywordStore((state) => state.setPageSize)

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const lastUrlRef = useRef<string>("")

  // URL -> Store (Back/Forward sync)
  useEffect(() => {
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const currentUrl = searchParams.toString()

    if (lastUrlRef.current === currentUrl) {
      return
    }

    let nextPageIndex: number | null = null
    if (pageParam) {
      const pageNumber = Number(pageParam)
      if (Number.isFinite(pageNumber) && pageNumber >= 1) {
        nextPageIndex = Math.floor(pageNumber) - 1
      }
    }

    let nextPageSize: number | null = null
    if (limitParam) {
      const limitNumber = Number(limitParam)
      if (Number.isFinite(limitNumber) && limitNumber >= 1) {
        nextPageSize = Math.floor(limitNumber)
      }
    }

    if (nextPageSize !== null && nextPageSize !== pagination.pageSize) {
      setPageSize(nextPageSize)
    }

    if (nextPageIndex !== null && nextPageIndex !== pagination.pageIndex) {
      setPageIndex(nextPageIndex)
    }
    lastUrlRef.current = currentUrl
  }, [pagination.pageIndex, pagination.pageSize, searchParams, setPageIndex, setPageSize])

  // Store -> URL
  useEffect(() => {
    const pageValue = pagination.pageIndex + 1
    const limitValue = pagination.pageSize

    const currentPage = Number(searchParams.get("page"))
    const currentLimit = Number(searchParams.get("limit"))

    if (currentPage === pageValue && currentLimit === limitValue) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(pageValue))
    params.set("limit", String(limitValue))

    const nextUrl = params.toString()
    lastUrlRef.current = nextUrl
    router.replace(`${pathname}?${nextUrl}`, { scroll: false })
  }, [pagination.pageIndex, pagination.pageSize, pathname, router, searchParams])
}
