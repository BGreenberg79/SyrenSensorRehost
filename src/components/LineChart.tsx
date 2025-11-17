import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type VitalsSnapshot = {
  vitalsId: number;
  skinTemp: number;
  pulse: number;
  spO2: number;
  timestamp: number;
};

type ChartDataPoint = VitalsSnapshot & {
  date: string;
};

export default function VitalsChart() {
  const { user } = useAuthenticator();
  const [vitalsData, setVitalsData] = useState<ChartDataPoint[]>([]);

  async function getAuthToken() {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    return idToken;
  }

  useEffect(() => {
    if (!user) return;

    async function fetchVitals() {
      try {
        const idToken = await getAuthToken();
        const userID = user.signInDetails?.loginId ?? "";

        const res = await fetch(`https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/vitals?email=${encodeURIComponent(userID)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const responseData = await res.json();
        
        // Handle Lambda response structure
        let vitalsArray: VitalsSnapshot[];
        
        if (Array.isArray(responseData)) {
          // Direct array response
          vitalsArray = responseData;
        } else if (responseData.body) {
          // Lambda response with body property (might be stringified)
          vitalsArray = typeof responseData.body === 'string' 
            ? JSON.parse(responseData.body) 
            : responseData.body;
        } else {
          console.error('Unexpected API response structure:', responseData);
          vitalsArray = [];
        }

        // Sort by timestamp (ascending)
        const sorted = vitalsArray.sort((a, b) => a.timestamp - b.timestamp);

        // Format for chart display
        const formatted: ChartDataPoint[] = sorted.map((entry) => ({
          ...entry,
          date: new Date(entry.timestamp).toLocaleDateString(),
        }));

        setVitalsData(formatted);
      } catch (err) {
        console.error('Error fetching 30-day vitals:', err);
      }
    }

    fetchVitals();
  }, [user]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={vitalsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" label={{ value: 'Pulse (bpm)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'SpO2 (%)', angle: -90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="pulse" stroke="#8884d8" name="Pulse (bpm)" />
          <Line yAxisId="right" type="monotone" dataKey="spO2" stroke="#82ca9d" name="SpO2 (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}