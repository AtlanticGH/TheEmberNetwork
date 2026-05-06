import { useInView } from '../../hooks/useInView'

export function Reveal({ as: As = 'div', className = '', children }) {
  const { ref, inView } = useInView({ once: true, threshold: 0.2 })

  return (
    <As
      ref={ref}
      className={[
        'transition-[opacity,transform] duration-300 ease-out will-change-transform',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        className,
      ].join(' ')}
    >
      {children}
    </As>
  )
}

