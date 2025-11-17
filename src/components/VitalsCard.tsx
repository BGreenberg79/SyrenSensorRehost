import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';

type HealthSnapshot = {
  pulse: number;
  spO2: number;
  skinTemp: number;
  timestamp: number | null;
};

type Props = { className?: string };

export default function VitalsCard({ className = "" }: Props) {
  const { user } = useAuthenticator();
  const [latestSnapshot, setLatestSnapshot] = useState<HealthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

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
        const idToken = await getAuthToken();
        const url = `https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/vitals?email=${encodeURIComponent(user.signInDetails?.loginId ?? "")}`;
        
        console.log("🫀 VitalsCard: Fetching from", url);

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("🫀 VitalsCard: Error response", errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("🫀 VitalsCard: Raw data:", data);

        // Handle different response formats
        let vitals: HealthSnapshot;

        if (data.pulse !== undefined) {
          // Direct vitals object
          vitals = {
            pulse: data.pulse || 0,
            spO2: data.spO2 || 0,
            skinTemp: data.skinTemp || 0,
            timestamp: data.timestamp || null,
          };
        } else if (Array.isArray(data) && data.length > 0) {
          // Array response - take the last item
          const latest = data[data.length - 1];
          vitals = {
            pulse: latest.pulse || 0,
            spO2: latest.spO2 || 0,
            skinTemp: latest.skinTemp || 0,
            timestamp: latest.timestamp || null,
          };
        } else {
          console.error("🫀 VitalsCard: Unexpected response format");
          return;
        }

        console.log("🫀 VitalsCard: Parsed vitals:", vitals);
        setLatestSnapshot(vitals);
      } catch (err) {
        console.error("🫀 VitalsCard: Error fetching vitals:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVitals();
  }, [user]);

  if (loading) {
    return <p className={`${className} text-white`}>Loading latest vitals...</p>;
  }

  if (!latestSnapshot || (latestSnapshot.pulse === 0 && latestSnapshot.spO2 === 0)) {
    return <p className={`${className} text-white`}>No vitals data available</p>;
  }

  return (
    <div id="vitals-title" className={`${className} text-white`}>
      <h2 className="text-base sm:text-lg font-semibold mb-2">Latest Vitals</h2>
      <p>Heart Rate: <span className="font-bold">{latestSnapshot.pulse} bpm</span></p>
      <p>Oxygen Level: <span className="font-bold">{latestSnapshot.spO2}%</span></p>
      <p>Skin Temperature: <span className="font-bold">{latestSnapshot.skinTemp}°F</span></p>
      {latestSnapshot.timestamp && (
        <p className="text-sm text-gray-400">
          {new Date(latestSnapshot.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}