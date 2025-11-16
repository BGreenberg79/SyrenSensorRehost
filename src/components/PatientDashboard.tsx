import { useSettingsContext } from "../context/SettingsContext";
import syrenLogo from '../assets/syrensensor2.png'
import VitalsCard from "./VitalsCard";
import VitalsChart from "./LineChart";

export default function PatientDashboard() {
  const { settingsState } = useSettingsContext();
  const fullName = [settingsState.user.firstName, settingsState.user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "—";
  console.log("Dashboard render → name is:", fullName);

  return (
    <div aria-labelledby='dashboard-title' className="flex-1 bg-[#2b2b2c] min-h-screen overflow-y-auto px-4 py-6 mb-10">
      <div className="flex flex-col items-center">
        <h1 id='dashboard-title' className='sr-only'>Syren Sensor</h1>
        <img className='w-40 h-40 mb-6 mx-auto bg-[#2b2b2c]' alt="Syren Sensor Logo" src={syrenLogo}/>
          <div className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-black rounded-2xl border border-blue-500 shadow-lg px-4 sm:px-8 py-10 text-white space-y-8">
            <section  aria-labelledby="patient-info-title">
            <h3 id='patient-info-title' className="text-white text-lg font-semibold mb-2">Patient Info:</h3>

            <p className="text-white mb-2 capitalize">
              <span className="font-semibold">Name:</span>{" "}
              <span className="font-normal">{fullName}</span>
              
            </p>
            <p className="text-white mb-2 capitalize">
              <span className="font-semibold">Age:</span>{" "}
              <span className="font-normal">{settingsState.user.age}</span>
            </p>
            <p className="text-white mb-2 capitalize">
              <span className="font-semibold">Gender:</span>{" "}
              <span className="font-normal">{settingsState.user.gender}</span>
            </p>
            <p className="text-white mb-2 capitalize">
              <span className="font-semibold">Height:</span>{" "}
              <span className="font-normal">{settingsState.user.height}</span>
            </p>
            <p className="text-white mb-2 capitalize">
              <span className="font-semibold">Weight:</span>{" "}
              <span className="font-normal">{settingsState.user.weight}</span>
            </p>
            </section>
            <section aria-labelledby="vitals-title" aria-live='polite'>
              <VitalsCard className="text-white"/>
            </section>
            <section aria-labelledby="chart-title" className="mt-8">
              <h3 id="chart-title" className="text-white text-lg font-semibold mb-2">Vitals (Last 30 Days)</h3>
              <VitalsChart />
            </section>

          </div>
      </div>
    </div>
  );
}
