import { useState } from 'react';
import { useSettingsContext } from '../context/SettingsContext';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import syrenLogo from '../assets/syrensensor2.png'

interface SettingsProps {
  isFirstTime?: boolean;
  onProfileSaved?: () => Promise<void>;
}

export default function Settings({ isFirstTime = false, onProfileSaved }: SettingsProps) {
  const { settingsState, updateUser, updateEmergencyContact } = useSettingsContext();
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const email = user?.signInDetails?.loginId;

    if (!email) {
      alert("User email not found");
      setIsSaving(false);
      return;
    }

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        throw new Error("No ID token available");
      }

      // Step 1: Save Profile
      const res = await fetch(
        "https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/profiles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email,
            firstName: settingsState.user.firstName,
            lastName: settingsState.user.lastName,
            phoneNumber: settingsState.user.phoneNumber,
            height: settingsState.user.height,
            weight: settingsState.user.weight,
            gender: settingsState.user.gender,
            emergencyFirstName: settingsState.emergencyContact.name.firstName,
            emergencyLastName: settingsState.emergencyContact.name.lastName,
            emergencyPhone: settingsState.emergencyContact.phoneNumber,
            relationship: settingsState.emergencyContact.relationship,
            street: settingsState.user.primaryAddress.street,
            apartmentNumber: settingsState.user.primaryAddress.aptUnitNumber,
            city: settingsState.user.primaryAddress.city,
            state: settingsState.user.primaryAddress.state,
            zipCode: settingsState.user.primaryAddress.zipCode,
            country: settingsState.user.primaryAddress.country,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      alert("Profile saved successfully!");

      // Step 2: Generate vitals - NOW ALWAYS GENERATE (not just first time)
      console.log("💾 Generating vitals...");
      try {
        const vitalsRes = await fetch(
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

        console.log("💾 Vitals response status:", vitalsRes.status);

        if (vitalsRes.ok) {
          const vitalsData = await vitalsRes.json();
          console.log("✅ Vitals generated successfully:", vitalsData);
        } else {
          const errorText = await vitalsRes.text();
          console.error("❌ Failed to generate vitals:", vitalsRes.status, errorText);
        }
      } catch (vitalsErr) {
        console.error("❌ Error generating vitals:", vitalsErr);
      }

      // Step 3: Call onProfileSaved callback if provided
      if (onProfileSaved) {
        await onProfileSaved();
      }

      setIsSaving(false);

      // Step 4: Navigate to dashboard for first time users
      if (isFirstTime) {
        setTimeout(() => {
          navigate("/dashboard", { replace: true, state: { isFirstTime: false } });
        }, 500);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. " + (err instanceof Error ? err.message : "Please try again."));
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#2b2b2c] p-6 flex flex-col items-center justify-start mb-10">
      <img className='w-60 h-60 mb-6 mx-auto bg-[#2b2b2c]' alt="Syren Sensor Logo" src={syrenLogo}/>
      
      {isFirstTime && <h1 className="text-white text-3xl font-bold mb-2">Complete Your Profile</h1>}

      <form className="w-full sm:max-w-md md:max-w-xl lg:max-w-3xl xl:max-w-5xl mx-auto bg-black px-4 sm:px-8 py-4 rounded-lg shadow-lg my-6 space-y-6">
        
        {/* USER INFO SECTION */}
        <fieldset>
          <legend className="text-white text-xl font-bold mb-2">Personal Information</legend>
          <div className='space-y-2'>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor='firstName' className="sr-only">First Name</label>
                <input
                  id='firstName'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="First Name"
                  value={settingsState.user.firstName}
                  onChange={(e) =>
                    updateUser({ ...settingsState.user, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor='lastName' className="sr-only">Last Name</label>
                <input
                  id='lastName'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Last Name"
                  value={settingsState.user.lastName}
                  onChange={(e) =>
                    updateUser({ ...settingsState.user, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label htmlFor='phoneNumber' className="sr-only">Phone Number</label>
              <input
                id='phoneNumber'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone Number"
                value={settingsState.user.phoneNumber}
                onChange={(e) =>
                  updateUser({ ...settingsState.user, phoneNumber: e.target.value })
                }
              />
            </div>
          </div>
        </fieldset>

        {/* HEALTH INFO SECTION */}
        <fieldset>
          <legend className="text-white text-xl font-bold mb-2">Health Information</legend>
          <div className='space-y-2'>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor='height' className="sr-only">Height</label>
                <input
                  id='height'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Height (inches)"
                  value={settingsState.user.height}
                  onChange={(e) =>
                    updateUser({ ...settingsState.user, height: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor='weight' className="sr-only">Weight</label>
                <input
                  id='weight'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Weight (lbs)"
                  value={settingsState.user.weight}
                  onChange={(e) =>
                    updateUser({ ...settingsState.user, weight: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label htmlFor='gender' className="sr-only">Gender</label>
              <input
                id='gender'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Gender"
                value={settingsState.user.gender || ''}
                onChange={(e) =>
                  updateUser({ ...settingsState.user, gender: e.target.value })
                }
              />
            </div>
          </div>
        </fieldset>

        {/* EMERGENCY CONTACT SECTION */}
        <fieldset>
          <legend className="text-white text-xl font-bold mb-2">Emergency Contact</legend>
          <div className='space-y-2'>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor='emergencyFirstName' className="sr-only">Emergency Contact First Name</label>
                <input
                  id='emergencyFirstName'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Emergency Contact First Name"
                  value={settingsState.emergencyContact.name.firstName}
                  onChange={(e) =>
                    updateEmergencyContact({
                      ...settingsState.emergencyContact,
                      name: { ...settingsState.emergencyContact.name, firstName: e.target.value }
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor="emergencyLastName" className="sr-only">Emergency Contact Last Name</label>
                <input
                  id='emergencyLastName'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Emergency Contact Last Name"
                  value={settingsState.emergencyContact.name.lastName}
                  onChange={(e) =>
                    updateEmergencyContact({
                      ...settingsState.emergencyContact,
                      name: { ...settingsState.emergencyContact.name, lastName: e.target.value }
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label htmlFor="emergencyPhone" className="sr-only">Emergency Contact Phone</label>
              <input
                id='emergencyPhone'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Emergency Contact Phone"
                value={settingsState.emergencyContact.phoneNumber}
                onChange={(e) =>
                  updateEmergencyContact({ ...settingsState.emergencyContact, phoneNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="relationship" className="sr-only">Relationship</label>
              <input
                id='relationship'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Relationship"
                value={settingsState.emergencyContact.relationship}
                onChange={(e) =>
                  updateEmergencyContact({ ...settingsState.emergencyContact, relationship: e.target.value })
                }
              />
            </div>
          </div>
        </fieldset>

        {/* ADDRESS SECTION */}
        <fieldset>
          <legend className="text-white text-xl font-bold mb-2">Address</legend>
          <div className='space-y-2'>
            <div>
              <label htmlFor='street' className="sr-only">Street</label>
              <input
                id='street'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street"
                value={settingsState.user.primaryAddress.street}
                onChange={(e) =>
                  updateUser({
                    ...settingsState.user,
                    primaryAddress: { ...settingsState.user.primaryAddress, street: e.target.value }
                  })
                }
              />
            </div>
            <div>
              <label htmlFor='aptNumber' className="sr-only">Apartment/Unit Number</label>
              <input
                id='aptNumber'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apt/Unit Number"
                value={settingsState.user.primaryAddress.aptUnitNumber}
                onChange={(e) =>
                  updateUser({
                    ...settingsState.user,
                    primaryAddress: { ...settingsState.user.primaryAddress, aptUnitNumber: e.target.value }
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor='city' className="sr-only">City</label>
                <input
                  id='city'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                  value={settingsState.user.primaryAddress.city}
                  onChange={(e) =>
                    updateUser({
                      ...settingsState.user,
                      primaryAddress: { ...settingsState.user.primaryAddress, city: e.target.value }
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor='state' className="sr-only">State</label>
                <input
                  id='state'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State"
                  value={settingsState.user.primaryAddress.state}
                  onChange={(e) =>
                    updateUser({
                      ...settingsState.user,
                      primaryAddress: { ...settingsState.user.primaryAddress, state: e.target.value }
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor='zipCode' className="sr-only">Zip Code</label>
                <input
                  id='zipCode'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Zip Code"
                  value={settingsState.user.primaryAddress.zipCode}
                  onChange={(e) =>
                    updateUser({
                      ...settingsState.user,
                      primaryAddress: { ...settingsState.user.primaryAddress, zipCode: e.target.value }
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor='country' className="sr-only">Country</label>
                <input
                  id='country'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                  value={settingsState.user.primaryAddress.country}
                  onChange={(e) =>
                    updateUser({
                      ...settingsState.user,
                      primaryAddress: { ...settingsState.user.primaryAddress, country: e.target.value }
                    })
                  }
                />
              </div>
            </div>
          </div>
        </fieldset>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full p-3 bg-green-600 rounded text-white font-bold hover:bg-green-700 disabled:bg-gray-400"
        >
          {isSaving ? "Saving..." : isFirstTime ? "Complete Profile" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}