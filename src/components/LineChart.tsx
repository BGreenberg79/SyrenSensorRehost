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

type HealthSnapshot = {
  userID: string;
  heartRate: number;
  oxygenLevel: number;
  timestamp: string | number;
};

export default function VitalsChart() {
  const { user } = useAuthenticator();
  const [vitalsData, setVitalsData] = useState<HealthSnapshot[]>([]);

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

        const res = await fetch(`https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/vitals?userID=${encodeURIComponent(userID)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        const sorted = data.sort((a: HealthSnapshot, b: HealthSnapshot) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const formatted = sorted.map((entry:HealthSnapshot) => ({
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
          <YAxis yAxisId="left" label={{ value: 'Heart Rate', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Oxygen Level', angle: -90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#8884d8" name="Heart Rate (bpm)" />
          <Line yAxisId="right" type="monotone" dataKey="oxygenLevel" stroke="#82ca9d" name="Oxygen Level (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
