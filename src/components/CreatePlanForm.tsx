import React, { useState } from "react";

interface CreatePlanFormProps {
  formData: any;
  handleInputChange: (field: string, value: string | boolean) => void;
  handleFeatureChange: (featureName: string, checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}


const FEATURES_LIST = [
  { value: 'analytics', label: 'Analytics' },
  { value: 'customBranding', label: 'Custom Branding' },
  { value: 'leadCaptureForms', label: 'Lead Capture Forms' },
  { value: 'crmIntegration', label: 'CRM Integration' },
  { value: 'emailMarketing', label: 'Email Marketing' },
  { value: 'landingPages', label: 'Landing Pages' },
  { value: 'leadNurturingAutomation', label: 'Lead Nurturing Automation' },
  { value: 'leadAnalyticsReporting', label: 'Lead Analytics & Reporting' },
  { value: 'leadScoring', label: 'Lead Scoring' },
  { value: 'multiChannelCampaigns', label: 'Multi-Channel Campaigns' },
  { value: 'conversionTracking', label: 'Conversion Tracking' },
  { value: 'aiChatbots', label: 'AI Chatbots' },
];

const MultiSelectFeatures = ({ selectedFeatures, onChange }) => {
  const [search, setSearch] = useState('');
  const filtered = FEATURES_LIST.filter(f => f.label.toLowerCase().includes(search.toLowerCase()));

  const handleToggle = (value) => {
    const updated = { ...selectedFeatures, [value]: !selectedFeatures[value] };
    onChange(updated);
  };

  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: 4, padding: 8, background: '#f9f9f9' }}>
      <input
        type="text"
        placeholder="Search features..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #cbd5e1' }}
      />
      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
        {filtered.map(f => (
          <label key={f.value} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!selectedFeatures[f.value]}
              onChange={() => handleToggle(f.value)}
              style={{ marginRight: 8 }}
            />
            {f.label}
          </label>
        ))}
        {filtered.length === 0 && <div style={{ color: '#888', fontSize: 13 }}>No features found</div>}
      </div>
    </div>
  );
};

const CreatePlanForm: React.FC<CreatePlanFormProps> = ({
  formData,
  handleInputChange,
  handleFeatureChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="simple-form w-full max-w-6xl mx-auto bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Plan Details</h2>
        <div className="text-gray-600 text-sm sm:text-base">Configure your new subscription plan</div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-1">
          <label className="block font-medium text-sm sm:text-base">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
            placeholder="e.g., Professional"
            className="w-full mt-1 p-2.5 sm:p-3 rounded-lg border border-gray-300 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block font-medium text-sm sm:text-base">Price *</label>
          <input
            type="number"
            value={formData.price}
            onChange={e => handleInputChange('price', e.target.value)}
            required
            placeholder="e.g., 99"
            className="w-full mt-1 p-2.5 sm:p-3 rounded-lg border border-gray-300 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block font-medium text-sm sm:text-base">Plan Type *</label>
          <select
            value={formData.billingCycle}
            onChange={e => handleInputChange('billingCycle', e.target.value)}
            required
            className="w-full mt-1 p-2.5 sm:p-3 rounded-lg border border-gray-300 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select plan type</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="ADDON">Addons</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="block font-medium text-sm sm:text-base">Max Forms</label>
          <input
            type="number"
            value={formData.maxForms}
            onChange={e => handleInputChange('maxForms', e.target.value)}
            placeholder="e.g., 10"
            className="w-full mt-1 p-2.5 sm:p-3 rounded-lg border border-gray-300 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block font-medium text-sm sm:text-base">Max Leads Per Month</label>
          <input
            type="number"
            value={formData.maxLeadsPerMonth}
            onChange={e => handleInputChange('maxLeadsPerMonth', e.target.value)}
            placeholder="e.g., 1000"
            className="w-full mt-1 p-2.5 sm:p-3 rounded-lg border border-gray-300 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block font-medium text-sm sm:text-base">Max Locations</label>
          <input
            type="number"
            value={formData.maxLocations}
            onChange={e => handleInputChange('maxLocations', e.target.value)}
            placeholder="e.g., 5"
            className="w-full mt-1 p-2.5 sm:p-3 rounded-lg border border-gray-300 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="lg:col-span-2 space-y-1">
          <label className="block font-semibold text-sm sm:text-base mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            placeholder="Describe this plan..."
            rows={3}
            className="w-full mt-1 p-2.5 sm:p-3 rounded-lg border border-gray-300 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
        </div>
        
        <div className="lg:col-span-2 space-y-2">
          <label className="block font-semibold text-sm sm:text-base">Features</label>
          <ShowFeaturesDropdown
            selectedFeatures={JSON.parse(formData.features)}
            onChange={featuresObj => handleInputChange('features', JSON.stringify(featuresObj))}
          />
        </div>
      </div>
      
      <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
        <button 
          type="submit" 
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold border-none rounded-lg px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base cursor-pointer transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Plan
        </button>
      </div>
    </form>
  );
};

import { useRef, useEffect } from "react";


const ShowFeaturesDropdown = ({ selectedFeatures, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const FEATURES_LIST = [
    { value: 'analytics', label: 'Analytics' },
    { value: 'customBranding', label: 'Custom Branding' },
    { value: 'leadCaptureForms', label: 'Lead Capture Forms' },
    { value: 'crmIntegration', label: 'CRM Integration' },
    { value: 'emailMarketing', label: 'Email Marketing' },
    { value: 'landingPages', label: 'Landing Pages' },
    { value: 'leadNurturingAutomation', label: 'Lead Nurturing Automation' },
    { value: 'leadAnalyticsReporting', label: 'Lead Analytics & Reporting' },
    { value: 'leadScoring', label: 'Lead Scoring' },
    { value: 'multiChannelCampaigns', label: 'Multi-Channel Campaigns' },
    { value: 'conversionTracking', label: 'Conversion Tracking' },
    { value: 'aiChatbots', label: 'AI Chatbots' },
  ];
  const selectedLabels = Object.keys(selectedFeatures)
    .filter(key => selectedFeatures[key])
    .map(key => {
      const feature = FEATURES_LIST.find(f => f.value === key);
      return feature ? feature.label : key;
    });

  const handleToggle = (value) => {
    onChange({ ...selectedFeatures, [value]: !selectedFeatures[value] });
  };

  const filtered = FEATURES_LIST.filter(f => 
    f.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative w-full">
      <div 
        onClick={() => setOpen(!open)}
        className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 transition-colors text-sm sm:text-base"
      >
        {selectedLabels.length === 0 ? (
          <span className="text-gray-500">Select features...</span>
        ) : (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {selectedLabels.slice(0, 3).map((label, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm">
                {label}
              </span>
            ))}
            {selectedLabels.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs sm:text-sm">
                +{selectedLabels.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          <div className="p-2 sm:p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-2">
            {filtered.map(f => (
              <label key={f.value} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={!!selectedFeatures[f.value]}
                  onChange={() => handleToggle(f.value)}
                  className="mr-2 sm:mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="flex-1">{f.label}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <div className="p-3 text-center text-gray-500 text-sm">No features found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePlanForm;
