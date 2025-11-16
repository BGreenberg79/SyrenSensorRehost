import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles.css";
import "@aws-amplify/ui-react/styles.css";
import "./auth-overrides.css";
import { Authenticator, ThemeProvider, defaultDarkModeOverride } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { BrowserRouter } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext.tsx";
import syrenLogo from './assets/syrensensor2.png'
import { useAuthenticator } from "@aws-amplify/ui-react";

Amplify.configure(outputs);

const formFields = {
	signUp: {
		// Basic Information
		firstName: {
			order: 1,
			label: "First Name",
			placeholder: "Enter your first name",
			isRequired: true,
		},
		lastName: {
			order: 2,
			label: "Last Name",
			placeholder: "Enter your last name",
			isRequired: true,
		},
		email: {
			order: 3,
			label: "Email",
			placeholder: "Enter your email",
			isRequired: true,
		},
		phone_number: {
			order: 4,
			label: "Phone Number",
			placeholder: "Enter your phone number",
			isRequired: true,
		},
		// Health Information
		address: {
			order: 5,
			label: "Height (inches)",
			placeholder: "e.g., 70",
			isRequired: true,
		},
		birthdate: {
			order: 6,
			label: "Weight (lbs)",
			placeholder: "e.g., 180",
			isRequired: true,
		},
		gender: {
			order: 7,
			label: "Gender",
			placeholder: "Enter your gender identity",
			type: "text",
		},
		// Emergency Contact
		family_name: {
			order: 8,
			label: "Emergency Contact First Name",
			placeholder: "Enter emergency contact first name",
			isRequired: true,
		},
		given_name: {
			order: 9,
			label: "Emergency Contact Last Name",
			placeholder: "Enter emergency contact last name",
			isRequired: true,
		},
		middle_name: {
			order: 10,
			label: "Emergency Contact Phone",
			placeholder: "Enter emergency contact phone",
			isRequired: true,
		},
		nickname: {
			order: 11,
			label: "Relationship to Emergency Contact",
			placeholder: "e.g., Sister, Brother, Parent",
			isRequired: true,
		},
		// Address
		street_address: {
			order: 12,
			label: "Street Address",
			placeholder: "Enter your street address",
			isRequired: false,
		},
		apartment_number: {
			order: 13,
			label: "Apartment/Unit Number (optional)",
			placeholder: "Apt, Suite, Unit number",
			isRequired: false,
		},
		locality: {
			order: 14,
			label: "City",
			placeholder: "Enter your city",
			isRequired: false,
		},
		region: {
			order: 15,
			label: "State",
			placeholder: "Enter your state",
			isRequired: false,
		},
		postal_code: {
			order: 16,
			label: "Zip Code",
			placeholder: "Enter your zip code",
			isRequired: false,
		},
		country: {
			order: 17,
			label: "Country",
			placeholder: "Enter your country",
			isRequired: false,
		},
		// Security
		password: {
			order: 18,
			label: "Password",
			placeholder: "Create a strong password",
			isRequired: true,
			type: "password",
		},
		confirm_password: {
			order: 19,
			label: "Confirm Password",
			placeholder: "Confirm your password",
			isRequired: true,
			type: "password",
		},
	},
};

const LogoHeader = () => (
  <div className="flex justify-center mb-4">
    <img
      src={syrenLogo}
      alt="Syren Sensor Logo"
      className="w-48 h-48 sm:w-32 sm:h-32 mt-2"
    />
  </div>
);

const darkTheme = {
  name: "my-dark-theme",
  overrides: [defaultDarkModeOverride],
};

function AuthGate() {
  const { route } = useAuthenticator((ctx) => [ctx.route]);

  if (route === "authenticated") {
    return <App />;
  }

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Authenticator.Provider>
			<BrowserRouter>
				<SettingsProvider>
					<ThemeProvider theme={darkTheme} colorMode="dark">
						<div className="min-h-screen flex flex-col items-center justify-center sm:justify-start pt-4 sm:pt-12 md:pt-16 pb-8 overflow-auto bg-[#2b2b2c]">
							<Authenticator
								formFields={formFields}
								components={{ Header: LogoHeader }}
								className="w-full max-w-xs sm:max-w-md mb-8">
									<AuthGate />
							</Authenticator>
						</div>
					</ThemeProvider>
				</SettingsProvider>
			</BrowserRouter>
		</Authenticator.Provider>
	</React.StrictMode>
);