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
    <form onSubmit={handleSubmit} className="simple-form" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px #e5e7eb', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>Plan Details</h2>
        <div style={{ color: '#64748b', fontSize: 15 }}>Configure your new subscription plan</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={{ fontWeight: 500 }}>Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
            placeholder="e.g., Professional"
            style={{ width: '100%', marginTop: 4, marginBottom: 0, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Price *</label>
          <input
            type="number"
            value={formData.price}
            onChange={e => handleInputChange('price', e.target.value)}
            required
            placeholder="e.g., 99"
            style={{ width: '100%', marginTop: 4, marginBottom: 0, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
          />
        </div>
        <div style={{ gridColumn: '1 / 3' }}>
          <label style={{ fontWeight: 500 }}>Description</label>
          <textarea
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            placeholder="Describe what this plan includes..."
            style={{ width: '100%', marginTop: 4, marginBottom: 0, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15, minHeight: 60 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Billing Cycle *</label>
          <select
            value={formData.billingCycle}
            onChange={e => handleInputChange('billingCycle', e.target.value)}
            required
            style={{ width: '100%', marginTop: 4, marginBottom: 0, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
          >
            <option value="">Select cycle</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Max Forms</label>
          <input
            type="number"
            value={formData.maxForms}
            onChange={e => handleInputChange('maxForms', e.target.value)}
            placeholder="e.g., 50"
            style={{ width: '100%', marginTop: 4, marginBottom: 0, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Max Leads Per Month</label>
          <input
            type="number"
            value={formData.maxLeadsPerMonth}
            onChange={e => handleInputChange('maxLeadsPerMonth', e.target.value)}
            placeholder="e.g., 1000"
            style={{ width: '100%', marginTop: 4, marginBottom: 0, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Max Locations</label>
          <input
            type="number"
            value={formData.maxLocations}
            onChange={e => handleInputChange('maxLocations', e.target.value)}
            placeholder="e.g., 5"
            style={{ width: '100%', marginTop: 4, marginBottom: 0, padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
          />
        </div>
        <div style={{ gridColumn: '1 / 3' }}>
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Features</label>
          <ShowFeaturesDropdown
            selectedFeatures={JSON.parse(formData.features)}
            onChange={featuresObj => handleInputChange('features', JSON.stringify(featuresObj))}
          />
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <button type="submit" style={{ background: '#2563eb', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 6, padding: '10px 28px', fontSize: 16, cursor: 'pointer' }}>Create New Plan</button>
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
      const f = FEATURES_LIST.find(f => f.value === key);
      return f ? f.label : key;
    });

  // Filtered features for search
  const filtered = FEATURES_LIST.filter(f => f.label.toLowerCase().includes(search.toLowerCase()));

  const handleToggle = (value) => {
    const updated = { ...selectedFeatures, [value]: !selectedFeatures[value] };
    onChange(updated);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        tabIndex={0}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          minHeight: 38,
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          padding: '4px 8px',
          background: '#f9f9f9',
          cursor: 'text',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        {selectedLabels.map(label => (
          <span key={label} style={{ background: '#e0e7ef', borderRadius: 4, padding: '2px 8px', fontSize: 13 }}>{label}</span>
        ))}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={selectedLabels.length === 0 && search === '' ? 'Select features...' : ''}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 14,
            flex: 1,
            minWidth: 80,
            marginLeft: 4
          }}
        />
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 10, width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, boxShadow: '0 2px 8px #e5e7eb', marginTop: 2 }}>
          <div style={{ maxHeight: 180, overflowY: 'auto', padding: 8 }}>
            {filtered.map(f => (
              <label key={f.value} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, cursor: 'pointer', fontSize: 15 }}>
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
      )}
    </div>
  );
};

export default CreatePlanForm;
