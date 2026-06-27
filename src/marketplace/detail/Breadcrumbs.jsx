import { useNavigate } from 'react-router-dom'

export default function Breadcrumbs({ category, name }) {
  const navigate = useNavigate()

  return (
    <nav className="flex items-center gap-2 mb-8 text-on-surface-variant font-label-md text-label-md flex-wrap">
      <a
        className="hover:text-secondary transition-colors cursor-pointer"
        onClick={() => navigate('/marketplace')}
      >
        Marketplace
      </a>
      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      <a
        className="hover:text-secondary transition-colors cursor-pointer"
        onClick={() => navigate('/marketplace')}
      >
        {category}
      </a>
      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      <span className="text-primary font-bold">{name}</span>
    </nav>
  )
}
