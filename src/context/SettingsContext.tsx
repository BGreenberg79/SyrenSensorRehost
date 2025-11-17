import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { User } from "../models/User";
import { Vitals } from "../models/Vitals";
import { fetchAuthSession } from "aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface SettingsState {
  user: User;
  emergencyContact: any;
  bluetoothDevice: any;
  vitals: Vitals;
  emsModalOpen: boolean;
  emsTriggeredManually: boolean;
}

interface SettingsContextType {
  settingsState: SettingsState;
  setSettingsState: React.Dispatch<React.SetStateAction<SettingsState>>;
  updateUser: (user: User) => void;
  updateEmergencyContact: (contact: any) => void;
  updateBluetoothDevice: (device: any) => void;
  updateVitals: (vitals: Vitals) => void;
  handleCallEMS: () => void;
  handleCancelEMS: () => void;
}

const defaultState: SettingsState = {
  user: {
    userId: 0,
    firstName: "",
    lastName: "",
    // age: 0,
    gender: null,
    height: "",
    weight: "",
    phoneNumber: "",
    primaryAddress: {
      buildingNumber: "",
      street: "",
      aptUnitNumber: "",
      zipCode: "",
      city: "",
      state: "",
      country: "",
    },
  },
  emergencyContact: {
    contactId: 0,
    userId: 0,
    name: { firstName: "", lastName: "" },
    phoneNumber: "",
    relationship: "",
  },
  bluetoothDevice: {
    deviceId: 0,
    serialNumber: "",
    deviceMake: "",
    deviceModel: "",
  },
  vitals: {
    vitalsId: 0,
    skinTemp: 98,
    pulse: 70,
    spO2: 100,
  },
  emsModalOpen: false,
  emsTriggeredManually: false,
};

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settingsState, setSettingsState] = useState<SettingsState>(defaultState);
  const [emsTimeoutId, setEmsTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const { user } = useAuthenticator((context) => [context.user]);

  const updateUser = (updatedUser: User) => {
    setSettingsState((prevState) => ({
      ...prevState,
      user: updatedUser,
    }));
  };

  const updateEmergencyContact = (updatedContact: any) => {
    setSettingsState((prevState) => ({
      ...prevState,
      emergencyContact: updatedContact,
    }));
  };

  const updateBluetoothDevice = (updatedDevice: any) => {
    setSettingsState((prevState) => ({
      ...prevState,
      bluetoothDevice: updatedDevice,
    }));
  };

  const updateVitals = (updatedVitals: Vitals) => {
    setSettingsState((prevState) => ({
      ...prevState,
      vitals: updatedVitals,
    }));
  };

  // const handleCallEMS = () => {
  //   setSettingsState((prev) => ({
  //     ...prev,
  //     emsModalOpen: false,
  //     emsTriggeredManually: false,
  //   }));
  //   window.location.href = "tel:+15551234567";
  // };
  const handleCallEMS = async () => {
  // Close modal immediately
  setSettingsState((prev) => ({
    ...prev,
    emsModalOpen: false,
    emsTriggeredManually: false,
  }));

  const sendLocation = async (latitude: number, longitude: number) => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const userID = user?.signInDetails?.loginId || "";

      if (!idToken || !userID) {
        console.error("Missing auth or user ID");
        return;
      }

      const res = await fetch("https://lesiun05ul.execute-api.us-east-1.amazonaws.com/demo/send-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userID,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", text);
      } else {
        console.log("Location sent to backend");
      }
    } catch (err) {
      console.error("Failed to send location to backend", err);
    } finally {
      // Trigger EMS call regardless
      window.location.href = "tel:+15551234567";
    }
  };

  if (!navigator.geolocation) {
    console.error("Geolocation is not supported");
    window.location.href = "tel:+15551234567";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Location acquired:", latitude, longitude);
      sendLocation(latitude, longitude);
    },
    (err) => {
      console.error("Geolocation error:", err);

      switch (err.code) {
        case 1:
          alert("Permission denied. Please enable location access.");
          break;
        case 2:
          alert("Location unavailable. Using fallback location for testing.");
          break;
        case 3:
          alert("Location request timed out.");
          break;
        default:
          alert("Unknown geolocation error.");
      }

      // Fallback location: San Francisco
      sendLocation(37.7749, -122.4194);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
};


  const handleCancelEMS = () => {
    setSettingsState((prev) => ({
      ...prev,
      emsModalOpen: false,
      emsTriggeredManually: false,
    }));
    if (emsTimeoutId) {
      clearTimeout(emsTimeoutId);
      setEmsTimeoutId(null);
    }
  };

  useEffect(() => {
    const { skinTemp, pulse, spO2 } = settingsState.vitals;
    const shouldCallEMS =
      skinTemp < 95 || skinTemp > 105 || spO2 <= 90 || pulse < 30 || pulse > 220;

    if (shouldCallEMS && !settingsState.emsModalOpen) {
      setSettingsState((prev) => ({ ...prev, emsModalOpen: true }));
      const timeout = setTimeout(() => {
        handleCallEMS();
      }, 60000);
      setEmsTimeoutId(timeout);
    }

    if (!shouldCallEMS && settingsState.emsModalOpen) {
      handleCancelEMS();
    }

    return () => {
      if (emsTimeoutId) {
        clearTimeout(emsTimeoutId);
        setEmsTimeoutId(null);
      }
    };
  }, [settingsState.vitals, location.pathname]);

  return (
    <SettingsContext.Provider
      value={{
        settingsState,
        setSettingsState,
        updateUser,
        updateEmergencyContact,
        updateBluetoothDevice,
        updateVitals,
        handleCallEMS,
        handleCancelEMS,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }
  return context;
};