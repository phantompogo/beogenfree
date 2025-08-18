
import React from 'react';

interface NeonCardProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}

export const NeonCard: React.FC<NeonCardProps> = ({ children, style, className }) => {
    return (
        <aside className={`neon-card ${className || ''}`} style={style}>
            <span className="shine shine-top"></span>
            <span className="shine shine-bottom"></span>
            <span className="glow glow-top"></span>
            <span className="glow glow-bottom"></span>
            <span className="glow glow-bright glow-top"></span>
            <span className="glow glow-bright glow-bottom"></span>
            <div className="inner">
                {children}
            </div>
        </aside>
    );
};
