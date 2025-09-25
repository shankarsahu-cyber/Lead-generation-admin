import React from "react";

interface CreatePlanFormProps {
  formData: any;
  handleInputChange: (field: string, value: string | boolean) => void;
  handleFeatureChange: (featureName: string, checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const CreatePlanForm: React.FC<CreatePlanFormProps> = ({
  formData,
  handleInputChange,
  handleFeatureChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="simple-form">
      <div>
        <label>Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => handleInputChange('name', e.target.value)}
          required
        />
      </div>
      <div>
        <label>Price *</label>
        <input
          type="number"
          value={formData.price}
          onChange={e => handleInputChange('price', e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={e => handleInputChange('description', e.target.value)}
        />
      </div>
      <div>
        <label>Billing Cycle *</label>
        <select
          value={formData.billingCycle}
          onChange={e => handleInputChange('billingCycle', e.target.value)}
          required
        >
          <option value="">Select cycle</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </div>
      <div>
        <label>Max Forms</label>
        <input
          type="number"
          value={formData.maxForms}
          onChange={e => handleInputChange('maxForms', e.target.value)}
        />
      </div>
      <div>
        <label>Max Leads Per Month</label>
        <input
          type="number"
          value={formData.maxLeadsPerMonth}
          onChange={e => handleInputChange('maxLeadsPerMonth', e.target.value)}
        />
      </div>
      <div>
        <label>Max Locations</label>
        <input
          type="number"
          value={formData.maxLocations}
          onChange={e => handleInputChange('maxLocations', e.target.value)}
        />
      </div>
      <div>
        <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Features</label>
        <select
          value={(() => {
            const features = JSON.parse(formData.features);
            if (features.analytics) return 'analytics';
            if (features.customBranding) return 'customBranding';
            if (features.leadCaptureForms) return 'leadCaptureForms';
            if (features.crmIntegration) return 'crmIntegration';
            if (features.emailMarketing) return 'emailMarketing';
            if (features.landingPages) return 'landingPages';
            if (features.leadNurturingAutomation) return 'leadNurturingAutomation';
            if (features.leadAnalyticsReporting) return 'leadAnalyticsReporting';
            if (features.leadScoring) return 'leadScoring';
            if (features.multiChannelCampaigns) return 'multiChannelCampaigns';
            if (features.conversionTracking) return 'conversionTracking';
            if (features.aiChatbots) return 'aiChatbots';
            return '';
          })()}
          onChange={e => {
            const value = e.target.value;
            const allFeatures = [
              'analytics',
              'customBranding',
              'leadCaptureForms',
              'crmIntegration',
              'emailMarketing',
              'landingPages',
              'leadNurturingAutomation',
              'leadAnalyticsReporting',
              'leadScoring',
              'multiChannelCampaigns',
              'conversionTracking',
              'aiChatbots',
            ];
            allFeatures.forEach(f => handleFeatureChange(f, f === value));
          }}
        >
          <option value="">Select Feature</option>
          <option value="analytics">Analytics</option>
          <option value="customBranding">Custom Branding</option>
          <option value="leadCaptureForms">Lead Capture Forms</option>
          <option value="crmIntegration">CRM Integration</option>
          <option value="emailMarketing">Email Marketing</option>
          <option value="landingPages">Landing Pages</option>
          <option value="leadNurturingAutomation">Lead Nurturing Automation</option>
          <option value="leadAnalyticsReporting">Lead Analytics & Reporting</option>
          <option value="leadScoring">Lead Scoring</option>
          <option value="multiChannelCampaigns">Multi-Channel Campaigns</option>
          <option value="conversionTracking">Conversion Tracking</option>
          <option value="aiChatbots">AI Chatbots</option>
        </select>
      </div>
      <button type="submit">Create New Plan</button>
    </form>
  );
};

export default CreatePlanForm;
