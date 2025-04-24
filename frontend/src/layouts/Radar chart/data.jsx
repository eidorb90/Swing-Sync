import { useEffect, useState } from 'react';

const defaultStatsData = [
  {
    product: 'Putting',
    'Current Skills': 50,
    'Target Skills': 75,
  },
  {
    product: 'Scoring',
    'Current Skills': 45,
    'Target Skills': 80,
  },
  {
    product: 'Fairways',
    'Current Skills': 40,
    'Target Skills': 75,
  },
  {
    product: 'Greens',
    'Current Skills': 35,
    'Target Skills': 70,
  },
  {
    product: 'Penalties',
    'Current Skills': 60,
    'Target Skills': 90,
  },
];



export default function MainGrid() {
    const [statsData, setStatsData] = useState(defaultStatsData);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchStats = async () => {
        try {
          setIsLoading(true);
          const user_id = localStorage.getItem('userId') || '1';
          const response = await fetch(`http://localhost:8000/api/player/${user_id}/stats`);
          
          if (response.ok) {
            const fetchedData = await response.json();
            
  // Transform the data into the format expected by RadarChart
          const formattedData = [
            {
              product: 'Putting',
              'Current Skills': Math.max(0, 100 - (fetchedData.avg_putts_per_round || 0) * 5),
              'Target Skills': Math.max(0, 100 - (fetchedData.avg_putts_per_round || 0) * 5) + 40, // Target of ~1.5 putts per hole
            },
            {
              product: 'Scoring',
              // For scoring, lower is better, so invert on a 0-100 scale
              'Current Skills': Math.max(0, 100 - ((fetchedData.avg_score_per_round || 72) - 65)),
              'Target Skills': Math.max(0, 100 - ((fetchedData.avg_score_per_round || 72) - 65)) + 40, // Target of ~72 per round
            },
            {
              product: 'Fairways',
              // For fairways, higher percentage is better, already on 0-100 scale
              'Current Skills': fetchedData.fairway_hit_percentage || 0,
              'Target Skills': fetchedData.fairway_hit_percentage + 20, // Professional level target
            },
            {
              product: 'Greens',
              // For GIR, higher percentage is better, already on 0-100 scale
              'Current Skills': fetchedData.gir_percentage || 0,
              'Target Skills': fetchedData.gir_percentage + 20, // Professional level target
            },
            {
              product: 'Penalties',
              // For penalties, lower is better, so invert on a 0-100 scale
              'Current Skills': Math.max(0, 100 - (fetchedData.avg_penalities_per_round || 0) * 20),
              'Target Skills': Math.max(0, 100 - (fetchedData.avg_penalities_per_round || 0) * 20) + 40, // Target of ~0.5 penalties per round
            },
          ];
            
            setStatsData(formattedData);
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setIsLoading(false);
        }
        };
              fetchStats();
            }, []);
      
          return (
            <div>
              {isLoading ? <p>Loading...</p> : <pre>{JSON.stringify(statsData, null, 2)}</pre>}
            </div>
          );
      }
    
  
    
