
import React from 'react';
import { NeonCard } from './NeonCard';

interface StatusCardProps {
    variant: 'blue' | 'green' | 'red';
    icon: React.ReactNode;
    title: string;
    message: string | React.ReactNode;
    children?: React.ReactNode; 
}

const getVariantStyle = (variant: StatusCardProps['variant']): React.CSSProperties => {
    switch (variant) {
        case 'green':
            return { '--hue1': 145, '--hue2': 160 } as React.CSSProperties;
        case 'red':
            return { '--hue1': 0, '--hue2': 340 } as React.CSSProperties;
        case 'blue':
            return { '--hue1': 222, '--hue2': 255 } as React.CSSProperties;
        default:
            return {};
    }
};


export const StatusCard: React.FC<StatusCardProps> = ({ variant, icon, title, message, children }) => {
    return (
        <NeonCard style={getVariantStyle(variant)} className="status-card">
            <div className="status-card-body">
                <div className="icon">
                    {icon}
                </div>
                <div className="content">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>
            </div>
            {children && (
                <div className="status-card-footer">
                    {children}
                </div>
            )}
        </NeonCard>
    );
};