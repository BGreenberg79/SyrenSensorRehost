import { useState, useEffect } from 'react';
// import { User } from '../models/User';
import { SubmitStatus } from '../models/SubmitStatus';
import { useSettingsContext } from '../context/SettingsContext';
import syrenLogo from '../assets/syrensensor2.png'


export default function Settings() {
  const {
    settingsState,
    updateUser,
    updateEmergencyContact,
    updateBluetoothDevice,
    updateVitals
  } = useSettingsContext()

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    submitted: false,
    success: false,
    error: null,
  });
  const [vitalsStatus, setVitalsStatus] = useState<SubmitStatus>({
    submitted: false,
    success: false,
    error: null,
  });

  const handleSubmit = () => {
    try {
      const userSubmit = JSON.stringify(settingsState.user);
      const emergencyContactSubmit = JSON.stringify(settingsState.emergencyContact);
      const bluetoothDeviceSubmit = JSON.stringify(settingsState.bluetoothDevice);

      console.log(userSubmit)
      console.log(emergencyContactSubmit)
      console.log(bluetoothDeviceSubmit)

      setSubmitStatus({
        submitted: true,
        success: true,
        error: null,
      });

      alert('Successfully submitted');
      console.log(submitStatus);
 
    } catch (err) {
      setSubmitStatus({
        submitted: true,
        success: false,
        error: (err as Error).message,
      });


      alert('There was an error saving your information.');
      console.error(submitStatus.error)
    }
  };

  const handleVitalsUpdate = () => {
     try {
      const vitalsSubmit = JSON.stringify(settingsState.vitals)
      // Replace with actual axios POST call to  API
      // axios.post('API_URL', { vitalsSubmit });
      console.log(vitalsSubmit)
      setVitalsStatus({
        submitted: true,
        success: true,
        error: null,
      });
      
      alert('Successfully updated vitals');
      console.log(vitalsStatus)

     } catch (err) {
        setVitalsStatus({
          submitted: true,
          success: false,
          error: (err as Error).message,
        })
        alert('There was an error saving your vitals.');
        console.error(vitalsStatus.error)
     }
      

  }

  useEffect(() => {
    const isFirstLoad = settingsState.user.userId === 0;
    if (isFirstLoad) {
    const generatedUserId = Date.now();
    updateUser({...settingsState.user, userId:generatedUserId})
    updateEmergencyContact({
      ...settingsState.emergencyContact,
      userId: generatedUserId,
      contactId: generatedUserId +1
    });
    updateBluetoothDevice({...settingsState.bluetoothDevice, deviceId: generatedUserId+2});
    updateVitals({...settingsState.vitals, vitalsId: generatedUserId +3});
  }

  }, []);

  return (
    <div aria-labelledby='settings-form-title' className="min-h-screen bg-[#2b2b2c] p-6 flex flex-col items-center justify-start mb-10">
      <h1 id='settings-form-title' className='sr-only'>Syren Sensor Settings</h1>
      <img className='w-60 h-60 mb-6 mx-auto bg-[#2b2b2c]' alt="Syren Sensor Logo" src={syrenLogo}/>
      <form className="w-full sm:max-w-md md: max-w-xl lg:max-w-3xl xl:max-w-5xl mx-auto bg-black px-4 sm:px-8 py-4 rounded-lg shadow-lg my-6">
        <p id='settings-form-description' className='sr-only'>Form to update user information, emergency contact, and device details.</p>
        <div className="mb-6">
          <fieldset>
            <legend className="text-white text-xl font-bold mb-2">User Info</legend>
            <div className='space-y-2'>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor='firstName' className="sr-only">First Name</label>
                  <input
                    id='firstName'
                    type="text"
                    aria-label='First Name'
                    className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
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
                    aria-label='Last Name'
                    className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                    placeholder="Last Name"
                    value={settingsState.user.lastName}
                    onChange={(e) =>
                      updateUser({ ...settingsState.user, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label htmlFor='age' className="sr-only">Age</label>
                <input
                  id='age'
                  aria-label='Age'
                  type="number"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                  placeholder="Age"
                  value={settingsState.user.age || ''}
                  onChange={(e) => updateUser({ ...settingsState.user, age: Number(e.target.value) })}
              />
              </div>
            </div>

          </fieldset>
        
        
          <fieldset>
            <legend className="text-white text-xl font-bold mb-2">Gender</legend>
            <div className="flex flex-col mb-6" role='radiogroup' aria-labelledby='gender-group-label'>
              <span id='gender-group-label' className='sr-only'>Gender options</span>
              {['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'].map((option) => (
                <div key={option} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={`gender-${option}`}
                    name="gender"
                    value={option}
                    checked={settingsState.user.gender === option}
                    onChange={() => updateUser({ ...settingsState.user, gender: option })}
                    className="mr-2"
                  />
                  <label htmlFor={`gender-${option}`} className="text-white">{option}</label>
                </div>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <div>
              <label htmlFor='weight' className="sr-only">Weight</label>
              <input
                id='weight'
                aria-label='Weight'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                placeholder="Weight"
                value={settingsState.user.weight}
                onChange={(e) => updateUser({ ...settingsState.user, weight: e.target.value })}
              />
              <label htmlFor='height' className="sr-only">Height</label> 
              <input
                id='height'
                aria-label='height'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                placeholder="Height"
                value={settingsState.user.height}
                onChange={(e) => updateUser({ ...settingsState.user, height: e.target.value })}
              />
            </div>
          </fieldset>
          <fieldset>
            <div>
              <label htmlFor='phoneNumber' className="sr-only">Phone Number</label> 
              <input
              id='phoneNumber'
              aria-label='Phone Number'
              type="text"
              className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
              placeholder="Phone Number"
              value={settingsState.user.phoneNumber}
              onChange={(e) => updateUser({ ...settingsState.user, phoneNumber: e.target.value })}
            />
            </div>
            <div className="flex flex-col mb-6">
              <fieldset>
                <legend className="text-white text-xl font-bold mb-2">Primary Address</legend>
                <div>
                  <label htmlFor='buildingNumber' className="sr-only">Building Number</label> 
                  <input
                    id='buildingNumber'
                    aria-label='Building Number'
                    type="text"
                    className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                    placeholder="Building Number"
                    value={settingsState.user.primaryAddress.buildingNumber}
                    onChange={(e) => updateUser({ ...settingsState.user, primaryAddress: {...settingsState.user.primaryAddress, buildingNumber: e.target.value }})}
                  />
                </div>
                <div>
                  <label htmlFor='street' className="sr-only">Street</label>
                  <input
                    id='street'
                    aria-label='Street'
                    type="text"
                    className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                    placeholder="Street"
                    value={settingsState.user.primaryAddress.street}
                    onChange={(e) => updateUser({ ...settingsState.user, primaryAddress: {...settingsState.user.primaryAddress, street: e.target.value }})}
                  />
                </div>
                <div>
                  <label htmlFor='aptNumber' className="sr-only">Apt/Unit Number</label>
                  <input
                  id='aptNumber'
                  aria-label='Apartment or Unit Number'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                  placeholder="Apt/Unit Number"
                  value={settingsState.user.primaryAddress.aptUnitNumber}
                  onChange={(e) => updateUser({ ...settingsState.user, primaryAddress: {...settingsState.user.primaryAddress, aptUnitNumber: e.target.value }})}
                  />
                </div>
                <div>
                  <label htmlFor='city' className="sr-only">City</label>
                  <input
                    id='city'
                    aria-label='City'
                    type="text"
                    className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                    placeholder="City"
                    value={settingsState.user.primaryAddress.city}
                    onChange={(e) => updateUser({ ...settingsState.user, primaryAddress: {...settingsState.user.primaryAddress, city: e.target.value }})}
                  />
                </div>
                <div>
                  <label htmlFor='state' className="sr-only">State</label>
                  <input
                  id='state'
                  aria-label='State'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                  placeholder="State"
                  value={settingsState.user.primaryAddress.state}
                  onChange={(e) => updateUser({ ...settingsState.user, primaryAddress: {...settingsState.user.primaryAddress, state: e.target.value }})}
                />
                </div>
                <div>
                  <label htmlFor='zipCode' className="sr-only">Zip/Postage Code</label>
                  <input
                  id='zipCode'
                  aria-label='Zip or Postage Code'
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                  placeholder="Zip/Postage Code"
                  value={settingsState.user.primaryAddress.zipCode}
                  onChange={(e) => updateUser({ ...settingsState.user, primaryAddress: {...settingsState.user.primaryAddress, zipCode: e.target.value }})}
                  />
                </div>
                <div>
                  <label htmlFor='country' className="sr-only">Country</label>
                  <input
                  id='country'
                  aria-label="Country"
                  type="text"
                  className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                  placeholder="Country"
                  value={settingsState.user.primaryAddress.country}
                  onChange={(e) => updateUser({ ...settingsState.user, primaryAddress: {...settingsState.user.primaryAddress, country: e.target.value }})}
                />
              </div>
              </fieldset>
            </div>
          </fieldset>
        </div>
        <fieldset>
        <div className="mb-6">
          <legend className="text-white text-xl font-bold mb-2">Emergency Contact Info</legend>
          <div>
            <label htmlFor='emergencyFirstName' className="sr-only">Emergency Contact First Name</label>
            <input
              id='emergencyFirstName'
              aria-label='Emergency Contact First Name'
              type="text"
              className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
              placeholder="Emergency Contact First Name"
              value={settingsState.emergencyContact.name.firstName}
              onChange={(e) =>
                updateEmergencyContact({ ...settingsState.emergencyContact, name: { ...settingsState.emergencyContact.name, firstName: e.target.value } })
              }
            />
          </div>
          <div>
            <label htmlFor="emergencyLastName" className="sr-only">Emergency Contact Last Name</label>
            <input
              id='emergencyLastName'
              aria-label="Emergency Contact Last Name"
              type="text"
              className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
              placeholder="Emergency Contact Last Name"
              value={settingsState.emergencyContact.name.lastName}
              onChange={(e) =>
                updateEmergencyContact({ ...settingsState.emergencyContact, name: { ...settingsState.emergencyContact.name, lastName: e.target.value } })
              }
            />
          </div>
          <div>
            <label htmlFor="emergencyPhone" className="sr-only">Emergency Contact Phone Number</label>
            <input
              id='emergencyPhone'
              aria-label='Emergency Contact Phone Number'
              type="text"
              className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
              placeholder="Emergency Contact Phone Number"
              value={settingsState.emergencyContact.phoneNumber}
              onChange={(e) => updateEmergencyContact({ ...settingsState.emergencyContact, phoneNumber: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="emergencyRelationship" className="sr-only">Emergency Contact Relationship</label>
            <input
              id='emergencyRelationship'
              aria-label='Emergency Contact Relationship'
              type="text"
              className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
              placeholder="Emergency Contact Relationship"
              value={settingsState.emergencyContact.relationship}
              onChange={(e) => updateEmergencyContact({ ...settingsState.emergencyContact, relationship: e.target.value })}
            />
          </div>
        </div>
        </fieldset>

        <fieldset>
          <div className="mb-6">
            <legend className="text-white text-xl font-bold mb-2">Connect to Fitbit</legend>
            <a
              href={`https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23QJKP&redirect_uri=${encodeURIComponent(
                "https://dev-ja.d113xysrintyrk.amplifyapp.com/fitbit/callback"
              )}&scope=profile%20heartrate%20activity&expires_in=604800`}
            >
              <button
                type="button"
                className="w-full p-3 bg-purple-600 rounded text-white font-bold mb-4 hover:bg-purple-700 transition"
              >
                Connect to Fitbit
              </button>
            </a>
          </div>

          <div className="mb-6">
            <legend className="text-white text-xl font-bold mb-2">Bluetooth Device Details</legend>
            <div>
              <label htmlFor="deviceSerial" className="sr-only">Device Serial Number</label>
              <input
                id='deviceSerial'
                aria-label='Device Serial Number'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                placeholder="Device Serial Number"
                value={settingsState.bluetoothDevice.serialNumber}
                onChange={(e) => updateBluetoothDevice({ ...settingsState.bluetoothDevice, serialNumber: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="deviceManufacture" className="sr-only">Device Manufacture/Make</label>
              <input
                id='deviceManufacture'
                aria-label='Device Manufacturer or Makel'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                placeholder="Device Manufacturer/Make"
                value={settingsState.bluetoothDevice.deviceMake}
                onChange={(e) => updateBluetoothDevice({ ...settingsState.bluetoothDevice, deviceMake: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="deviceModel" className="sr-only">Device Model</label>
              <input
                id='deviceModel'
                aria-label='Device Model'
                type="text"
                className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
                placeholder="Device Model"
                value={settingsState.bluetoothDevice.deviceModel}
                onChange={(e) => updateBluetoothDevice({ ...settingsState.bluetoothDevice, deviceModel: e.target.value })}
              />
            </div>
          </div>
        </fieldset>

        <button
          className="w-full p-3 bg-green-600 rounded text-white font-bold mb-10"
          onClick={handleSubmit}
          type="button"
          aria-label='Submit User, Device, and Emergency Contact Information'
        >
          Submit
        </button>
        <fieldset>
          <div className="space-y-2">
            <legend className="text-white text-xl font-bold mb-2">Vitals Manual Input</legend>
            <div>
            <label htmlFor="spO2" className="block text-white font-semibold mb-1">
            Oxygen Saturation (SpO2 %)
            </label>
            <input
              id="spO2"
              type="number"
              aria-label='Oxygen Saturation'
              className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
              placeholder="Oxygen Saturation (SpO2)"
              value={settingsState.vitals.spO2 || ''}
              onChange={(e) =>
                updateVitals({ ...settingsState.vitals, spO2: Number(e.target.value) })
              }
            />
            </div>
            <div>
            <label htmlFor="skinTemp" className="block text-white font-semibold mb-1">
            Skin Temperature (°F)
            </label>
            <input
              id="skinTemp"
              aria-label="Skin Temperature"
              type="number"
              className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
              placeholder="Skin Temperature"
              value={settingsState.vitals.skinTemp || ''}
              onChange={(e) =>
                updateVitals({...settingsState.vitals, skinTemp: Number(e.target.value) })
              }
            />
            </div>
            <div>
            <label htmlFor="pulse" className="block text-white font-semibold mb-1">
            Pulse (BPM)
            </label>
            <input
              id="pulse"
              aria-label='Heart Rate Pulse'
              type="text"
              className="w-full p-3 bg-gray-200 text-blue-700 rounded mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-emerald-600 placeholder:opacity-90"
              placeholder="Heart Rate/Pulse"
              value={settingsState.vitals.pulse || ''}
              onChange={(e) => updateVitals({ ...settingsState.vitals, pulse: Number(e.target.value) })}
            /> 
            </div>
          <button
          type='button'
          aria-label='Update Vitals Information'
            className="w-full p-3 bg-green-600 rounded text-white font-bold mb-2"
            onClick={handleVitalsUpdate}
          >
            Update Vitals
          </button>
          
          </div>
        </fieldset>
      </form>
    </div>
  );
}
