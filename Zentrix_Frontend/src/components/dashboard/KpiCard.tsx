import React from 'react';
import { FaChartLine, FaCheckCircle, FaCode, FaTrophy } from 'react-icons/fa';
import Card from '../ui/Card';
import '../../styles/components.css';

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'green' | 'blue' | 'yellow';
};

const iconColorClasses = {
  primary: 'text-primary-color',
  green: 'text-green-500',
  blue: 'text-blue-500',
  yellow: 'text-yellow-500',
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card className={`kpi-card ${color}-glow`}>
      <div className="flex items-center">
        <div className={`kpi-icon ${iconColorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="kpi-title">{title}</p>
          <p className="kpi-value">{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default KpiCard;