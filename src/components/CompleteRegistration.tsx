import { useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";

export default function CompleteRegistration() {
  const { user } = useAuthenticator();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhone: "",
    relationship: "",
    height: "",
    weight: "",
  });

  const [contactConsent, setContactConsent] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userID = user.signInDetails?.loginId;


    try {
      const idToken = (await fetchAuthSession()).tokens?.idToken?.toString(); 

      const res = await fetch("https://clgjdzows9.execute-api.us-east-1.amazonaws.com/dev/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`, 
        },
        body: JSON.stringify({
  email: userID,  // This is the email from Cognito
  firstName: formData.emergencyFirstName,
  lastName: formData.emergencyLastName,
  phoneNumber: formData.emergencyPhone,
  relationship: formData.relationship,
  height: formData.height,
  weight: formData.weight,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      console.log("Emergency contact saved.");
      navigate("/dashboard");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-4">Complete Registration</h2>

      <input
        name="emergencyFirstName"
        placeholder="Emergency Contact First Name"
        onChange={handleChange}
        value={formData.emergencyFirstName}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="emergencyLastName"
        placeholder="Emergency Contact Last Name"
        onChange={handleChange}
        value={formData.emergencyLastName}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="emergencyPhone"
        placeholder="Phone Number"
        type="tel"
        onChange={handleChange}
        value={formData.emergencyPhone}
        required
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="relationship"
        placeholder="Relationship"
        onChange={handleChange}
        value={formData.relationship}
        required
        className="w-full border px-3 py-2 rounded"
      />

        <input
            name="height"
            placeholder="Height (in in)"
            type="number"
            onChange={handleChange}
            value={formData.height}
            required
            className="w-full border px-3 py-2 rounded"
        />
        <input
            name="weight"
            placeholder="Weight (in lb)"
            type="number"
            onChange={handleChange}
            value={formData.weight}
            required
            className="w-full border px-3 py-2 rounded"
        />
      <div className="flex items-start">
        <input
          type="checkbox"
          id="contactConsent"
          checked={contactConsent}
          onChange={(e) => setContactConsent(e.target.checked)}
          required
          className="mt-1 mr-2"
        />
        <label htmlFor="contactConsent" className="text-sm">
          I confirm this emergency contact has consented to receive SMS alerts from this app.
        </label>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Submit & Continue
      </button>
    </form>
  );
}
