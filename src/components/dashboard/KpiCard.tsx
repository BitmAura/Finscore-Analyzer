"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";

interface KpiCardProps {
  title: string;
  valueA: string | number;
  valueB?: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  valueA,
  valueB,
  change,
  icon = <DollarSign className="w-6 h-6 text-white" />,
  color = "#3B82F6",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 flex items-center space-x-4 shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <div
        className={`p-3 rounded-xl bg-gradient-to-br`}
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <div className="flex items-baseline space-x-2">
          <p className="text-gray-900 text-2xl font-bold">{valueA}</p>
          {valueB && (
            <p className="text-gray-500 text-lg font-medium">vs {valueB}</p>
          )}
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center mt-2 text-sm ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              className={`w-4 h-4 mr-1 ${
                change < 0 ? "rotate-180" : ""
              }`}
            />
            <span>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KpiCard;

