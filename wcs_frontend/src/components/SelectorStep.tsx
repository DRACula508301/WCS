import type { ReactNode } from 'react'

type SelectorStepProps = {
    key: string,
    title: string,
    active: boolean,
    children: ReactNode
}

export default function SelectorStep({key, title, active, value}: SelectorStepProps) {
    return active ? (
        <div className="selector-step">
            <h3>{key}</h3>
            <p>{title}</p>
            {value}
        </div>
    ) : null
}