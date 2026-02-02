type TrapInputProps = {
  priorityName?: string
  tokenName?: string
}

export function TrapInput({
  priorityName = "user_system_priority",
  tokenName = "admin_validation_token",
}: TrapInputProps) {
  return (
    <>
      <input
        type="text"
        name={priorityName}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] opacity-[0.0001] pointer-events-none"
      />
      <input
        type="text"
        name={tokenName}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] opacity-[0.0001] pointer-events-none"
      />
    </>
  )
}
