type HoneytokenInputProps = {
  name?: string
}

export function HoneytokenInput({ name = "bot_trap" }: HoneytokenInputProps) {
  return (
    <input
      type="text"
      name={name}
      tabIndex={-1}
      autoComplete="off"
      className="absolute w-0 h-0 opacity-0 z-[-1]"
    />
  )
}
