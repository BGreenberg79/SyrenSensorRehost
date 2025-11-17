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
    <div
  aria-labelledby="dashboard-title"
  className="flex-1 bg-[#2b2b2c] min-h-screen overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 mb-10"
>
      <div className="flex flex-col items-center w-full">
        <h1 id='dashboard-title' className='sr-only'>Syren Sensor</h1>
        <img
  className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 mb-6 mx-auto bg-[#2b2b2c]"
  alt="Syren Sensor Logo"
  src={syrenLogo}
/>
        <div className="w-full max-w-5xl bg-black rounded-2xl border border-blue-500 shadow-lg px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 text-white space-y-6 sm:space-y-8">

          <section aria-labelledby="patient-info-title">
            <h3
  id="patient-info-title"
  className="text-white text-base sm:text-lg font-semibold mb-2"
>
  Patient Info:
</h3>

            <p className="text-white mb-2 capitalize">
              <span className="font-semibold">Name:</span>{" "}
              <span className="font-normal">{fullName}</span>
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
          
<section aria-labelledby="chart-title" className="mt-6 sm:mt-8 w-full min-w-0">
  <h3
    id="chart-title"
    className="text-white text-base sm:text-lg font-semibold mb-2"
  >
    Vitals (Last 30 Days)
  </h3>

  {/* Chart width + height control */}
  <div className="w-full overflow-x-auto">
    <div className="h-[240px] sm:h-[300px] md:h-[360px] min-w-full md:min-w-[600px]">
      <VitalsChart />
    </div>
  </div>
</section>



        </div>
      </div>
    </div>
  );
}