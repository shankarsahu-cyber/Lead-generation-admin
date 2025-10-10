import { useState, useEffect } from "react";

const AddLocation = ({ formId }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, [formId]);

  const fetchLocations = async () => {
    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem("authToken");

      // Fetch all available locations
      const locationsResponse = await fetch("http://15.206.69.231:8888/api/merchant/locations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const locationsResult = await locationsResponse.json();

      if (!locationsResult.success) {
        setError("Failed to fetch locations");
        return;
      }

      setLocations(locationsResult.data);

      // Fetch form details to get previously selected locations
      if (formId) {
        const formResponse = await fetch(`http://15.206.69.231:8888/api/merchant/forms/${formId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const formResult = await formResponse.json();

        if (formResult.success && formResult.data.locations) {
          // Extract location IDs from the form's locations array
          const preSelectedLocationIds = formResult.data.locations.map(loc => loc.id);
          setSelectedLocations(preSelectedLocationIds);
        }
      }
    } catch (err) {
      setError("Error fetching locations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (locationId) => {
    setSelectedLocations((prev) => {
      if (prev.includes(locationId)) {
        return prev.filter((id) => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };

  const handleSave = async () => {
    if (selectedLocations.length === 0) {
      setSaveMessage({ type: "error", text: "Please select at least one location" });
      return;
    }
    if (!formId) {
      setSaveMessage({ type: "error", text: "Form ID is missing" });
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);

      // Get token from localStorage
      const token = localStorage.getItem("authToken");

      const response = await fetch(`http://15.206.69.231:8888/api/merchant/forms/${formId}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(selectedLocations),
      });

      const result = await response.json();

      if (response.ok) {
        setSaveMessage({ type: "success", text: "Locations saved successfully!" });
      } else {
        setSaveMessage({ type: "error", text: result.message || "Failed to save locations" });
      }
    } catch (err) {
      setSaveMessage({ type: "error", text: "Error saving locations: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-gray-600">Loading locations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="block text-sm font-medium text-gray-700">Add Location</h1>

      <div className="bg-white border border-gray-200 rounded-lg mt-2 shadow-sm">
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {locations.map((location) => (
            <label
              key={location.id}
              className="flex items-start p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLocations.includes(location.id)}
                onChange={() => handleCheckboxChange(location.id)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{location.name}</span>
                  {location.isPrimary && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                      Primary
                    </span>
                  )}
                  {!location.isActive && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {location.address}, {location.city}, {location.state} {location.zipCode}
                </div>
                {location.phone && (
                  <div className="text-sm text-gray-500 mt-1">{location.phone}</div>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedLocations.length} location(s) selected
            </span>
            <button
              onClick={handleSave}
              disabled={saving || selectedLocations.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? "Saving..." : "Save Locations"}
            </button>
          </div>

          {saveMessage && (
            <div
              className={`mt-3 p-3 rounded-lg ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLocation;
