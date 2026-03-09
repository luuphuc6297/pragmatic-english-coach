import React from 'react';
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
    // Removed border, background, and fixed height to avoid double-border issue.
    // Now it simply fills the parent container provided by ChatInterface.
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Skill"
            dataKey="A"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="#0ea5e9"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarScore;
