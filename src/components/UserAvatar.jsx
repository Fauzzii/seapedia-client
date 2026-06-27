export default function UserAvatar({ name = '', size = 'md', className = '' }) {
  const getInitials = (n) => {
    if (!n) return 'U'
    const parts = n.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }

  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-24 h-24 text-3xl',
  }

  return (
    <div
      className={`rounded-full bg-secondary text-white font-extrabold flex items-center justify-center select-none shrink-0 border-2 border-secondary/30 shadow-sm ${sizeMap[size] ?? sizeMap['md']} ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}
