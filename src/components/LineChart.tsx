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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function getAuthToken() {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    return idToken;
  }

  useEffect(() => {
    if (!user) return;

    async function fetchVitals() {
      try {
        setLoading(true);
        setError(null);

        const idToken = await getAuthToken();
        const userEmail = user.signInDetails?.loginId ?? "";

        const url = `https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/vitals/history?email=${encodeURIComponent(userEmail)}`;

        
        console.log("📊 LineChart: Fetching from", url);

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        console.log("📊 LineChart: Response status", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("📊 LineChart: Error response", errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const responseData = await res.json();
        console.log("📊 LineChart: Raw response data:", responseData);

        // Handle different response structures
        let vitalsArray: VitalsSnapshot[];

        if (Array.isArray(responseData)) {
          vitalsArray = responseData;
        } else if (responseData.body && typeof responseData.body === 'string') {
          vitalsArray = JSON.parse(responseData.body);
        } else if (responseData.body && Array.isArray(responseData.body)) {
          vitalsArray = responseData.body;
        } else if (responseData.Items && Array.isArray(responseData.Items)) {
          vitalsArray = responseData.Items;
        } else if (responseData.vitalsId !== undefined || responseData.pulse !== undefined) {
          vitalsArray = [responseData];
        } else {
          console.error("📊 LineChart: Unknown response structure:", responseData);
          setError("Unknown API response format");
          return;
        }
        console.log("📊 Step 1: vitalsArray length:", vitalsArray.length);
        console.log("📊 Step 1: vitalsArray sample:", vitalsArray.slice(0, 5));

        if (!Array.isArray(vitalsArray)) {
          console.error("📊 LineChart: Final vitals is not an array");
          setError("Vitals data is not an array");
          return;
        }


        // Normalize timestamps and filter out entries with null timestamps
        const validVitals = vitalsArray
          .map((v) => {
            if (v.timestamp === null || v.timestamp === undefined) return v;

            let ts = v.timestamp;

            // If it's probably seconds (e.g. 1731791676), convert to ms
            if (ts < 10_000_000_000) {
              ts = ts * 1000;
            }

            return { ...v, timestamp: ts };
          })
          .filter((v) => v.timestamp !== null && v.timestamp !== undefined);

        console.log("📊 Step 2: validVitals length:", validVitals.length);
        console.log("📊 Step 2: validVitals sample:", validVitals.slice(0, 5));

        if (validVitals.length === 0) {
          console.warn("📊 LineChart: No valid vitals with timestamps");
          setError("No vitals data with timestamps available");
          return;
        }


        // Sort by timestamp (ascending)
        // Sort by timestamp (ascending)
        const sorted = validVitals.sort((a, b) => a.timestamp - b.timestamp);

        // Format for chart display - show actual dates ONLY
        const formatted: ChartDataPoint[] = sorted.map((entry) => {
          const date = new Date(entry.timestamp);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          return {
            ...entry,
            date: dateStr,
          };
        });

        const uniqueDates = [...new Set(formatted.map((f) => f.date))];
        console.log("📊 Step 3: formatted length:", formatted.length);
        console.log("📊 Step 3: unique date labels:", uniqueDates);

        setVitalsData(formatted);

      } catch (err) {
        console.error('📊 LineChart: Error fetching vitals:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchVitals();
  }, [user]);

  if (loading) return <div className="w-full h-[400px] flex items-center justify-center text-white">Loading chart...</div>;
  
  if (error) return <div className="w-full h-[400px] flex items-center justify-center text-red-500">Error: {error}</div>;

  if (vitalsData.length === 0) {
    return <div className="w-full h-[400px] flex items-center justify-center text-white">No vitals data available</div>;
  }

return (
  <div className="w-full h-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={vitalsData}
        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={5}
        />
        <YAxis
          yAxisId="left"
          label={{ value: 'Pulse (bpm)', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: 'SpO2 (%)', angle: -90, position: 'insideRight' }}
        />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="pulse"
          stroke="#8884d8"
          name="Pulse (bpm)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="spO2"
          stroke="#82ca9d"
          name="SpO2 (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
}