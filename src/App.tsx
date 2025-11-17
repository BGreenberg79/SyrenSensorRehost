import { Route, Routes, Navigate } from 'react-router-dom';
import PatientDashboard from "./components/PatientDashboard";
import Settings from "./components/Settings";
import NavBar from './components/NavBar';
import { useSettingsContext } from './context/SettingsContext';
import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import FitbitCallback from './components/FitbitCallback';
import OptIn from './components/OptIn';

function EMSModal() {
  const { settingsState, handleCallEMS, handleCancelEMS } = useSettingsContext();
  const [evaluatedVitals, setEvaluatedVitals] = useState(settingsState.vitals);

  useEffect(() => {
    if (settingsState.emsModalOpen) {
      setEvaluatedVitals(settingsState.vitals);
      console.log("Modal opened — captured vitals:", settingsState.vitals);
    }
  }, [settingsState.emsModalOpen]);

  if (!settingsState.emsModalOpen) return null;

  const { skinTemp, pulse, spO2 } = evaluatedVitals;

  const isAbnormal =
    skinTemp < 95 || skinTemp > 105 ||
    pulse < 30 || pulse > 220 ||
    spO2 <= 90;

  const title = isAbnormal ? "Emergency Activation" : "Confirm EMS Call";
  const message = isAbnormal
    ? "Critical vitals detected. Do you want to call an EMS dispatcher?"
    : "Vitals are currently stable. Are you sure you want to call 911?";

  const autoCallMessage = isAbnormal
    ? "Automatically calling in 60 seconds if no action is taken."
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ems-modal-title"
      aria-describedby="ems-modal-description"
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
    >
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h2 id="ems-modal-title" className="text-lg font-semibold mb-2">{title}</h2>
        <p id="ems-modal-description" className="mb-4">{message}</p>
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleCancelEMS}
            className="text-black bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleCallEMS}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md"
          >
            Call EMS
          </button>
        </div>
        {autoCallMessage && (
          <p className="text-xs text-gray-600 mt-4 text-center" aria-live="assertive">
            {autoCallMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function App() {
  const { user } = useAuthenticator();
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { setSettingsState } = useSettingsContext();

  const generateVitals = async(email: string, idToken: string) => {
    try{
      console.log("Generating random vitals for:", email);
      console.log("Generating random vitals for:", email);
      const res = await fetch(
        "https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/vitals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email,
            numDataPoints: 30,
          }),
        }
      );
      if (res.ok) {
        console.log("✓ Vitals generated successfully");
      } else {
        console.error("Failed to generate vitals:", res.status);
      }
    } catch (err) {
      console.error("Error generating vitals:", err);
    }
  } 

    // Function to trigger vitals generation after profile save
  const handleProfileSaved = async () => {
    const email = user?.signInDetails?.loginId;
    if (!email) return;

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      if (idToken) {
        await generateVitals(email, idToken);
      }
    } catch (err) {
      console.error("Error in handleProfileSaved:", err);
    }
  };
  useEffect(() => {
    const checkProfileAndLoad = async () => {
      const email = user?.signInDetails?.loginId;

      if (!email) {
        console.warn("User not ready yet");
        setIsLoading(false);
        return;
      }

      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (!idToken) {
          console.error("No ID token available");
          setIsLoading(false);
          return;
        }

        // Try to fetch user profile
        const res = await fetch(
          `https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/profiles?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (!res.ok) {
          // Profile doesn't exist - first time user
          console.log("Profile not found - redirecting to Settings");
          setIsFirstTime(true);
          setIsLoading(false);
          return;
        }

        const profile = await res.json();
        console.log("Profile loaded:", profile);

        // Update settings context with user data
        setSettingsState((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            firstName: profile.firstName || "—",
            lastName: profile.lastName || "—",
            // age: profile.birthdate ? new Date().getFullYear() - new Date(profile.birthdate).getFullYear() : 0,
            gender: profile.gender || "—",
            height: profile.height || "—",
            weight: profile.weight || "—",
            phoneNumber: profile.phoneNumber || "—",
            primaryAddress: {
              ...prev.user.primaryAddress,
              street: profile.address?.street || "—",
              city: profile.address?.city || "—",
              state: profile.address?.state || "—",
              zipCode: profile.address?.zipCode || "—",
            },
          },
          emergencyContact: {
            ...prev.emergencyContact,
            name: {
              firstName: profile.emergencyContact?.firstName || "—",
              lastName: profile.emergencyContact?.lastName || "—",
            },
            phoneNumber: profile.emergencyContact?.phoneNumber || "—",
            relationship: profile.emergencyContact?.relationship || "—",
          },
        }));

        console.log("User data loaded into context");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setIsFirstTime(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      checkProfileAndLoad();
    }
  }, [user, setSettingsState]);

  if (isLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (window.location.pathname === "/opt-in") {
    return (
      <main className="p-4">
        <OptIn />
      </main>
    );
  }

  // First time user - go to Settings
  if (isFirstTime) {
    return (
      <main>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Settings isFirstTime={true} onProfileSaved={handleProfileSaved} />
          </div>
          <NavBar />
          <EMSModal />
        </div>
      </main>
    );
  }

  // Returning user - normal routes
  return (
    <main>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/settings" element={<Settings isFirstTime={false} />} />
            <Route path="/fitbit/callback" element={<FitbitCallback />} />
          </Routes>
        </div>
        <NavBar />
        <EMSModal />
      </div>
    </main>
  );
}

export default App;