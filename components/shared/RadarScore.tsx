import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {AssessmentResult} from '../../types';

interface RadarScoreProps {
  assessment: AssessmentResult;
}

const RadarScore: React.FC<RadarScoreProps> = ({assessment}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure the container is fully rendered and animated
    // before Recharts tries to measure SVG elements.
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const data = [
    {
      subject: 'Accuracy',
      A: assessment.accuracyScore,
      fullMark: 10,
    },
    {
      subject: 'Naturalness',
      A: assessment.naturalnessScore,
      fullMark: 10,
    },
    {
      subject: 'Complexity',
      A: assessment.complexityScore,
      fullMark: 10,
    },
  ];

  return (
    <div className="w-full h-full">
      {isReady && (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
            />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            <Radar
              name="Skill"
              dataKey="A"
              stroke="#4ed9cc"
              strokeWidth={2}
              fill="#4ed9cc"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RadarScore;
