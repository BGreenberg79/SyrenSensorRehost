import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import PatientDashboard from "./components/PatientDashboard";
import Settings from "./components/Settings";
import NavBar from './components/NavBar';
import { useSettingsContext } from './context/SettingsContext';
import CompleteRegistration from './components/CompleteRegistration';
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
  const navigate = useNavigate();
  const [profileChecked, setProfileChecked] = useState(false);
  const { setSettingsState } = useSettingsContext();


  useEffect(() => {
    const checkProfile = async () => {
      const email = user?.signInDetails?.loginId;

      if (!email) {
        console.warn("User not ready yet");
        return;
      }

      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (!idToken) {
          console.error("No ID token available");
          return;
        }

        const res = await fetch(`https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/profiles?email=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("Profile check:", data);

        if (!data) {
          console.warn("No data returned — redirecting to complete-registration");
          navigate("/complete-registration");
          return;
        }

        const requiredFields = ["firstName", "lastName", "phoneNumber", "relationship", "height", "weight"];
        const isComplete = requiredFields.every((key) => !!data[key]);
        console.log("isComplete:", isComplete);
        if (!isComplete && window.location.pathname !== "/complete-registration") {
          console.warn("Incomplete profile — redirecting to registration");
          navigate("/complete-registration");
      } else if (isComplete && window.location.pathname === "/complete-registration") {
          console.log("Already completed registration, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
}
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        navigate("/complete-registration");
      }
    };

    (async () => {
      await checkProfile();
      setProfileChecked(true);
    })();
  }, [user]);

  useEffect(() => {
  const loadPatientInfo = async () => {
    const loginId = user?.signInDetails?.loginId;
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (!loginId || !idToken) return;
    if (!user?.signInDetails?.loginId) {
  console.warn("User not ready — skipping patient info load");
  return;
}


    try {
      // Get name + dob from UserSignUp
      const signupRes = await fetch(`https://clgjdzows9.execute-api.us-east-1.amazonaws.com/devprofiles?email=${encodeURIComponent(loginId)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const signupData = await signupRes.json();
    
      // Get height + weight from emergencyContacts
      const contactRes = await fetch(`https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/get-profile?email=${encodeURIComponent(loginId)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const contactData = await contactRes.json();
       console.log("contactData:", contactData);

      // Age calculation
      const calculateAge = (dobStr: string) => {
        if (!dobStr) return null;
        const dob = new Date(dobStr);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age;
      };
      const signupItem = signupData;
      console.log("signupItem:", signupItem);
      const age = calculateAge(signupItem?.DOB);
       const normalizedPatientName = (signupItem?.name ?? "").trim();
      const [fallbackFirstName = "", ...remainingNameParts] = normalizedPatientName
        .split(/\s+/)
        .filter(Boolean);
      const fallbackLastName = remainingNameParts.join(" ");
      const profileFirstName = signupItem?.firstName ?? fallbackFirstName ?? "—";
      const profileLastName = signupItem?.lastName ?? fallbackLastName ?? "—";

      // Push to SettingsContext
    setSettingsState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        firstName: profileFirstName,
        lastName: profileLastName,
        age: age || 0,
        gender: signupItem?.gender || "—",
        height: contactData?.height || "—",
        weight: contactData?.weight || "—",
        primaryAddress: {
          ...prev.user.primaryAddress,
          street: signupItem?.address || "—",
      }}, 
        emergencyContact: {
    ...prev.emergencyContact,
        name: {
          firstName: contactData?.firstName || "—",
          lastName: contactData?.lastName || "—",
        },
        phoneNumber: contactData?.phoneNumber || "—",
        relationship: contactData?.relationship || "—",

      },
    }));
  console.log("setSettingsState called with patient name:", profileFirstName, profileLastName);


    } catch (err) {
      console.error("Error fetching patient info:", err);
    }
  };

  loadPatientInfo();
}, [user]);

  
  console.log("Current route:", window.location.pathname);

if (window.location.pathname === "/opt-in") {
  return (
    <main className="p-4">
      <OptIn />
    </main>
  );
}

  return (
      <main>
        {!profileChecked ? (
          <p className="text-center mt-10">Checking profile...</p>
        ) : (
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/complete-registration" element={<CompleteRegistration />} />
                <Route path="/fitbit/callback" element={<FitbitCallback />} />
              </Routes>
            </div>
            <NavBar />
            <EMSModal />
          </div>
        )}
      </main>
  );
}

export default App;